import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { useUserStore } from "../store/userStore";
import { AppSnackbar } from "../App";
import BookCard from "../components/BookCard"; // Новый компонент

function CatalogPage() {
  const [books, setBooks] = useState([]);
  const [activeRents, setActiveRents] = useState([]);
  const [search, setSearch] = useState(""); // состояние для поиска
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const username = useUserStore((s) => s.username);
  const token = useUserStore((s) => s.token);
  const ws = useRef(null);
  const navigate = useNavigate(); // добавлено

  // функция загрузки книг с учётом поиска
  const fetchBooks = useCallback((searchQuery = "") => {
    let url = "http://localhost:8000/books";
    if (searchQuery) {
      url += `?query=${encodeURIComponent(searchQuery)}`;
    }
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token || ""}`
      }
    })
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((err) => console.error("Ошибка загрузки книг:", err));
  }, [token]);

  useEffect(() => {
    fetchBooks();
    fetch("http://localhost:8000/active_rents", {
      headers: {
        Authorization: `Bearer ${token || ""}`
      }
    })
      .then((res) => res.json())
      .then(setActiveRents);
  }, [fetchBooks, token]);

  // обновлять книги при изменении поиска
  useEffect(() => {
    fetchBooks(search);
  }, [search, fetchBooks]);

  useEffect(() => {
    if (!username) {
      navigate("/", { replace: true });
      return;
    }
    ws.current = new window.WebSocket(`ws://localhost:8000/ws/chat/${username}`);
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "book_available") {
        setSnackbarMsg(`Книга "${data.book_title}" теперь доступна для аренды!`);
        setSnackbarSeverity("info");
        setSnackbarOpen(true);
        // Можно обновить список книг и аренд, если нужно:
        fetchBooks();
        fetch("http://localhost:8000/active_rents", {
          headers: {
            Authorization: `Bearer ${token || ""}`
          }
        })
          .then((res) => res.json())
          .then(setActiveRents);
      }
    };
    return () => {
      ws.current && ws.current.close();
    };
  }, [username, fetchBooks, token, navigate]);

  const rentedBookIds = activeRents.map((r) => r.book_id);
  const myRentedBookIds = activeRents.filter(r => r.username === username).map(r => r.book_id);

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: { xs: 2, sm: 4, md: 5 },
        px: { xs: 1, sm: 2 },
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />
      <Card
        elevation={3}
        sx={{
          p: { xs: 1, sm: 2, md: 3 },
          background: "rgba(255,255,255,0.65)",
          border: "1.5px solid #A78B71",
          width: "100%",
        }}
      >
        <Typography variant="h4" sx={{ mb: 3, textAlign: "center", color: "#583E26", fontWeight: 700 }}>
          Каталог книг
        </Typography>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Поиск по названию, автору, жанру..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": { borderRadius: 8 },
              "& label": { color: "#A78B71" },
            }}
            InputProps={{ style: { color: "#583E26" } }}
          />
        </Box>
        <Grid
          container
          spacing={3}
          sx={{
            alignItems: "stretch",
          }}
        >
          {books.length === 0 ? (
            <Grid item xs={12}>
              <Typography sx={{ color: "#9C4A1A" }}>Нет книг в каталоге.</Typography>
            </Grid>
          ) : (
            books.map((book, idx) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={book.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                  // minHeight и height нужны для одинаковых форм карточек
                  minHeight: 420,
                  height: "100%",
                }}
              >
                <BookCard
                  book={book}
                  isRentedByMe={myRentedBookIds.includes(book.id)}
                  isRented={rentedBookIds.includes(book.id)}
                />
              </Grid>
            ))
          )}
        </Grid>
      </Card>
      <AppSnackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        severity={snackbarSeverity}
        message={snackbarMsg}
        autoHideDuration={2500}
      />
    </Container>
  );
}

export default CatalogPage;
