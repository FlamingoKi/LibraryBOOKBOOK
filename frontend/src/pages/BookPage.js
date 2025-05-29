import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Box from "@mui/material/Box";
import { AppSnackbar } from "../App";
import { useUserStore } from "../store/userStore";
import BookInfoCard from "../components/BookInfoCard";
import BookComments from "../components/BookComments";

function BookPage() {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [comments, setComments] = useState([]);
  const [isBooking, setIsBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const username = useUserStore((s) => s.username);
  const token = useUserStore((s) => s.token);
  const ws = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!username) {
      navigate("/", { replace: true });
      return;
    }
    if (!bookId) return;
    fetch(`http://localhost:8000/books?`, {
      headers: {
        Authorization: `Bearer ${token || ""}`
      }
    })
      .then(res => res.json())
      .then(data => {
        const b = data.find(b => b.id === Number(bookId));
        setBook(b || null);
        if (b) {
          fetch(`http://localhost:8000/comments/${bookId}`, {
            headers: {
              Authorization: `Bearer ${token || ""}`
            }
          })
            .then(res => res.json())
            .then(setComments);
        } else {
          setComments([]);
        }
      });
    // Check if user already has a pending/approved request for this book
    if (username) {
      fetch(`http://localhost:8000/my_requests?username=${username}`)
        .then(res => res.json())
        .then(data => {
          if (data.some(r => r.book_id === Number(bookId) && (r.status === "pending" || r.status === "approved"))) {
            setBooked(true);
          }
        });
    }

    if (username) {
      ws.current = new window.WebSocket(`ws://localhost:8000/ws/chat/${username}`);
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "book_available") {
          setSnackbarMsg(`Книга "${data.book_title}" теперь доступна для аренды!`);
          setSnackbarSeverity("info");
          setSnackbarOpen(true);
        }
      };
      return () => {
        ws.current && ws.current.close();
      };
    }
  }, [bookId, username, token, navigate]);

  if (book === null) {
    return (
      <Box sx={{ maxWidth: 900, mx: "auto", mt: 5 }}>
        <Navbar />
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <h5 style={{ color: "#9C4A1A" }}>Книга не найдена</h5>
          <a href="/catalog">
            <button style={{ marginTop: 16, background: "#F7C815", color: "#583E26" }}>
              Вернуться в каталог
            </button>
          </a>
        </Box>
      </Box>
    );
  }
  if (!book) return <div>Загрузка...</div>;

  const avgRating = comments.length
    ? (comments.reduce((sum, c) => sum + (c.rating || 0), 0) / comments.length).toFixed(2)
    : null;

  const handleRent = async () => {
    if (!username) {
      setSnackbarMsg("Войдите в систему");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }
    setIsBooking(true);
    const res = await fetch("http://localhost:8000/request_rent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, book_id: Number(bookId) }),
    });
    const data = await res.json();
    if (res.ok) {
      setSnackbarMsg(data.message || "Заявка отправлена");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setBooked(true);
    } else {
      setSnackbarMsg(data.detail || "Ошибка бронирования");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
    setIsBooking(false);
  };

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: "auto",
        mt: { xs: 2, sm: 4, md: 5 },
        px: { xs: 1, sm: 2 },
        minHeight: "100vh",
      }}
    >
      <Navbar />
      <BookInfoCard
        book={book}
        booked={booked}
        isBooking={isBooking}
        handleRent={handleRent}
      />
      <BookComments comments={comments} avgRating={avgRating} />
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

export default BookPage;