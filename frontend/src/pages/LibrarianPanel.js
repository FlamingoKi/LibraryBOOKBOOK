import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { AppSnackbar } from "../App";
import { useUserStore } from "../store/userStore";
import AddBookForm from "../components/AddBookForm";
import RequestsTable from "../components/RequestsTable";
import ReturnsTable from "../components/ReturnsTable";
import ActiveRentsTable from "../components/ActiveRentsTable";
import GiveBookForm from "../components/GiveBookForm";
import BooksTable from "../components/BooksTable";

function LibrarianPanel() {
  const role = useUserStore((s) => s.role);
  const token = useUserStore((s) => s.token);
  const username = useUserStore((s) => s.username); // добавлено
  const ws = useRef(null);
  const navigate = useNavigate(); // добавлено

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    publisher: "",
    description: "",
    cover_url: "",
  });
  const [file, setFile] = useState(null);

  // --- Заявки ---
  const [requests, setRequests] = useState([]);
  const [books, setBooks] = useState([]);
  const [activeRents, setActiveRents] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedBook, setSelectedBook] = useState("");

  // --- Snackbar ---
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  const fetchRequests = useCallback(() => {
    fetch("http://localhost:8000/requests", {
      headers: {
        Authorization: `Bearer ${token || ""}`
      }
    })
      .then((res) => res.json())
      .then(setRequests);
  }, [token]);

  const fetchBooks = useCallback(() => {
    fetch("http://localhost:8000/books", {
      headers: {
        Authorization: `Bearer ${token || ""}`
      }
    })
      .then((res) => res.json())
      .then(setBooks);
  }, [token]);

  const fetchActiveRents = useCallback(() => {
    fetch("http://localhost:8000/active_rents", {
      headers: {
        Authorization: `Bearer ${token || ""}`
      }
    })
      .then((res) => res.json())
      .then(setActiveRents);
  }, [token]);

  useEffect(() => {
    if (!username) {
      navigate("/", { replace: true });
      return;
    }
    if (role !== "librarian") {
      setSnackbarMsg("Доступ только для библиотекаря");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setTimeout(() => window.location.href = "/catalog", 1200);
      return;
    }
    fetchRequests();
    fetchBooks();
    fetchActiveRents();
    fetch("http://localhost:8000/users", {
      headers: {
        Authorization: `Bearer ${token || ""}`
      }
    })
      .then((res) => res.json())
      .then(setUsers);

    // WebSocket уведомление о доступности книги
    if (useUserStore.getState().username) {
      ws.current = new window.WebSocket(`ws://localhost:8000/ws/chat/${useUserStore.getState().username}`);
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "book_available") {
          setSnackbarMsg(`Книга "${data.book_title}" теперь доступна для аренды!`);
          setSnackbarSeverity("info");
          setSnackbarOpen(true);
          fetchBooks();
          fetchActiveRents();
        }
      };
    }
    return () => {
      ws.current && ws.current.close();
    };
  }, [role, token, fetchRequests, fetchBooks, fetchActiveRents, username, navigate]);

  function handleProcess(id, approve) {
    fetch("http://localhost:8000/process_request", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || ""}`
      },
      body: JSON.stringify({ request_id: id, approve }),
    })
      .then((res) => res.json())
      .then((data) => {
        setSnackbarMsg(data.message);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        fetchRequests();
      });
  }

  const handleDeleteBook = (bookId) => {
    // confirm заменяем на Snackbar с подтверждением
    if (!window.confirm("Удалить эту книгу?")) return;
    fetch("http://localhost:8000/admin/delete_book", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || ""}`
      },
      body: JSON.stringify({ book_id: bookId }),
    })
      .then((res) => res.json())
      .then((data) => {
        setSnackbarMsg(data.message);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        fetchBooks();
      })
      .catch(() => {
        setSnackbarMsg("Ошибка удаления книги");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  function handleCancelRent(rentId) {
    if (!window.confirm("Убрать бронь у пользователя?")) return;
    fetch("http://localhost:8000/librarian/cancel_rent", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || ""}`
      },
      body: JSON.stringify({ rent_id: rentId }),
    })
      .then((res) => res.json())
      .then((data) => {
        setSnackbarMsg(data.message);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        fetchActiveRents();
      });
  }

  function handleExtendRent(rentId) {
    const hours = prompt("На сколько часов продлить аренду?", "48");
    if (!hours || isNaN(hours)) return;
    fetch("http://localhost:8000/librarian/extend_rent", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || ""}`
      },
      body: JSON.stringify({ rent_id: rentId, hours: Number(hours) }),
    })
      .then((res) => res.json())
      .then((data) => {
        setSnackbarMsg(data.message);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        fetchActiveRents();
      });
  }

  // --- Добавление книги ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setSnackbarMsg("Пожалуйста, выберите PDF-файл с содержанием книги");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setSnackbarMsg("Можно загрузить только PDF-файл");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    data.append("pdf_file", file);

    try {
      const res = await fetch("http://localhost:8000/add_books", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token || ""}`
        },
        body: data,
      });

      const result = await res.json();
      setSnackbarMsg(result.message || (res.ok ? "Книга добавлена" : "Ошибка"));
      setSnackbarSeverity(res.ok ? "success" : "error");
      setSnackbarOpen(true);

      if (res.ok) {
        setFormData({
          title: "",
          author: "",
          genre: "",
          publisher: "",
          description: "",
          cover_url: "",
        });
        setFile(null);
        fetchBooks();
      }
    } catch (err) {
      setSnackbarMsg("Ошибка при добавлении книги");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleGiveBook = (e) => {
    e.preventDefault();
    if (!selectedUser || !selectedBook) {
      setSnackbarMsg("Выберите пользователя и книгу");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }
    fetch("http://localhost:8000/librarian/give_book", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || ""}`
      },
      body: JSON.stringify({ username: selectedUser, book_id: Number(selectedBook) }),
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        setSnackbarMsg(data.message || (ok ? "Книга выдана" : "Ошибка"));
        setSnackbarSeverity(ok ? "success" : "error");
        setSnackbarOpen(true);
        if (ok) {
          fetchActiveRents();
          fetchRequests();
        }
      })
      .catch(() => {
        setSnackbarMsg("Ошибка выдачи книги");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  const handleAcceptReturn = (data) => {
    fetch("http://localhost:8000/librarian/accept_return", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || ""}`
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {
        setSnackbarMsg(data.message);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        fetchRequests();
        fetchActiveRents();
        fetchBooks();
      });
  };

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        mt: { xs: 2, sm: 4, md: 5 },
        px: { xs: 1, sm: 2 },
        minHeight: "100vh",
      }}
    >
      <Navbar />
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          textAlign: "center",
          color: "#583E26",
          fontWeight: 700,
        }}
      >
        Панель библиотекаря
      </Typography>
      <AddBookForm
        formData={formData}
        setFormData={setFormData}
        file={file}
        setFile={setFile}
        handleSubmit={handleSubmit}
        handleFileChange={handleFileChange}
        handleChange={handleChange}
      />
      <RequestsTable
        requests={requests}
        handleProcess={handleProcess}
      />
      <ReturnsTable
        requests={requests}
        handleAcceptReturn={handleAcceptReturn}
      />
      <ActiveRentsTable
        activeRents={activeRents}
        handleCancelRent={handleCancelRent}
        handleExtendRent={handleExtendRent}
      />
      <GiveBookForm
        users={users}
        books={books}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        selectedBook={selectedBook}
        setSelectedBook={setSelectedBook}
        handleGiveBook={handleGiveBook}
      />
      <BooksTable
        books={books}
        handleDeleteBook={handleDeleteBook}
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

export default LibrarianPanel;
