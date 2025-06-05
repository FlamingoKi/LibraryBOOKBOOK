import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/userStore";
import { useAuthRedirect } from "../store/useAuthRedirect";
import Navbar from "../components/Navbar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { AppSnackbar } from "../App";
import UserList from "../components/UserList";
import ChatWindow from "../components/ChatWindow";
import BookOfferDialog from "../components/BookOfferDialog";

function getChatHistoryKey(username) {
  return `chat_history_${username}`;
}

function ChatPage() {
  const username = useUserStore((s) => s.username);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  const [myBooks, setMyBooks] = useState([]);
  const [showBookDialog, setShowBookDialog] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const ws = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!username) return;
    const saved = localStorage.getItem(getChatHistoryKey(username));
    if (saved) {
      setMessages(JSON.parse(saved));
    }
  }, [username]);

  useEffect(() => {
    if (username) {
      localStorage.setItem(getChatHistoryKey(username), JSON.stringify(messages));
    }
  }, [messages, username]);

  const fetchMyBooks = React.useCallback(() => {
    if (!username) return;
    fetch(`http://localhost:8000/my_requests?username=${username}`)
      .then(res => res.json())
      .then(data => {
        setMyBooks(data.filter(r => r.status === "approved"));
      });
  }, [username]);

  useEffect(() => {
    fetchMyBooks();
  }, [fetchMyBooks]);

  useEffect(() => {
    if (!username) {
      navigate("/", { replace: true });
      return;
    }
    ws.current = new WebSocket(`ws://localhost:8000/ws/chat/${username}`);
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "users") {
        setUsers([...new Set(data.users.filter((u) => u && u !== username))]);
      } else if (data.type === "message") {
        setMessages((prev) => {
          const from = data.from;
          const to = data.to;
          const msg = { from, text: data.message };
          const key = from === username ? to : from;
          return {
            ...prev,
            [key]: [...(prev[key] || []), msg],
          };
        });
      } else if (data.type === "book_offer") {
        setMessages((prev) => {
          const key = data.from;
          const alreadyExists = (prev[key] || []).some(
            m => m.type === "book_offer" && m.book.book_id === data.book.book_id && m.from === data.from
          );
          if (alreadyExists) return prev;
          return {
            ...prev,
            [key]: [
              ...(prev[key] || []),
              { from: data.from, type: "book_offer", book: data.book, handled: false }
            ],
          };
        });
      } else if (data.type === "book_offer_response") {
        setMessages((prev) => {
          const key = data.from;
          return {
            ...prev,
            [key]: [
              ...(prev[key] || []),
              {
                from: data.from,
                type: "book_offer_response",
                book: data.book,
                accepted: data.accepted,
              },
            ],
          };
        });
        if (data.accepted) {
          setSnackbarMsg("Книга успешно передана!");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
          fetchMyBooks();
        } else {
          setSnackbarMsg("Передача книги отклонена");
          setSnackbarSeverity("warning");
          setSnackbarOpen(true);
        }
      } else if (data.type === "book_available") {
        setSnackbarMsg(`Книга "${data.book_title}" теперь доступна для аренды!`);
        setSnackbarSeverity("info");
        setSnackbarOpen(true);
      }
    };
    return () => {
      ws.current && ws.current.close();
    };
  }, [username, navigate, fetchMyBooks]);

  const sendMessage = () => {
    if (!selectedUser || !input.trim()) return;
    ws.current.send(JSON.stringify({ to: selectedUser, message: input }));
    setMessages((prev) => ({
      ...prev,
      [selectedUser]: [...(prev[selectedUser] || []), { from: username, text: input }],
    }));
    setInput("");
  };

  const handleOpenBookDialog = () => {
    setShowBookDialog(true);
    setSelectedBookId("");
  };

  const handleSendBookOffer = () => {
    if (!selectedUser || !selectedBookId) return;
    const book = myBooks.find(b => b.book_id === Number(selectedBookId));
    ws.current.send(JSON.stringify({
      type: "book_offer",
      to: selectedUser,
      book: {
        book_id: book.book_id,
        book_title: book.book_title,
        cover_url: book.cover_url,
      }
    }));
    setMessages((prev) => ({
      ...prev,
      [selectedUser]: [
        ...(prev[selectedUser] || []),
        { from: username, type: "book_offer", book: {
          book_id: book.book_id,
          book_title: book.book_title,
          cover_url: book.cover_url,
        } }
      ]
    }));
    setShowBookDialog(false);
    setSelectedBookId("");
  };

  const handleBookOfferResponse = (from, book, accepted) => {
    ws.current.send(JSON.stringify({
      type: "book_offer_response",
      to: from,
      book,
      accepted,
    }));
    setMessages((prev) => {
      const key = from;
      return {
        ...prev,
        [key]: (prev[key] || []).map(msg =>
          msg.type === "book_offer" && msg.book.book_id === book.book_id && msg.from === from
            ? { ...msg, handled: true }
            : msg
        ),
      };
    });
    if (accepted) {
      fetch("http://localhost:8000/transfer_book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_username: from,
          to_username: username,
          book_id: book.book_id,
        }),
      })
        .then(async res => {
          const data = await res.json();
          setSnackbarMsg(data.message || "Книга передана");
          setSnackbarSeverity(res.ok ? "success" : "error");
          setSnackbarOpen(true);
          fetchMyBooks();
        })
        .catch(() => {
          setSnackbarMsg("Ошибка передачи книги");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        });
    }
  };

  useAuthRedirect();

  if (!username) {
    window.location.href = "/";
    return null;
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 5, minHeight: "80vh" }}>
      <Navbar />
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Чат пользователей
          </Typography>
          <Box sx={{ display: "flex", gap: 3 }}>
            <UserList
              users={users}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
            />
            <ChatWindow
              username={username}
              selectedUser={selectedUser}
              messages={messages}
              input={input}
              setInput={setInput}
              sendMessage={sendMessage}
              myBooks={myBooks}
              handleOpenBookDialog={handleOpenBookDialog}
              handleBookOfferResponse={handleBookOfferResponse}
              messagesEndRef={messagesEndRef}
            />
          </Box>
        </CardContent>
      </Card>
      <BookOfferDialog
        open={showBookDialog}
        onClose={() => setShowBookDialog(false)}
        myBooks={myBooks}
        selectedBookId={selectedBookId}
        setSelectedBookId={setSelectedBookId}
        handleSendBookOffer={handleSendBookOffer}
      />
      <AppSnackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        severity={snackbarSeverity}
        message={snackbarMsg}
        autoHideDuration={2500}
      />
    </Box>
  );
}

export default ChatPage;
