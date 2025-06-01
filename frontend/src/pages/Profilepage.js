import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { AppSnackbar } from "../App";
import { useUserStore } from "../store/userStore";
import ChangePasswordForm from "../components/ChangePasswordForm";
import RequestCard from "../components/RequestCard";
import CommentDialog from "../components/CommentDialog";

function Profilepage() {
  const [requests, setRequests] = useState([]);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState(5);
  const [cancelId, setCancelId] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const username = useUserStore((s) => s.username);
  const navigate = useNavigate();
  const ws = useRef(null);

  useEffect(() => {
    if (!username) {
      navigate("/", { replace: true });
      return;
    }
    fetchRequests();
    ws.current = new window.WebSocket(`ws://localhost:8000/ws/chat/${username}`);
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "book_available") {
        setSnackbarMsg(`Книга "${data.book_title}" теперь доступна для аренды!`);
        setSnackbarSeverity("info");
        setSnackbarOpen(true);
        fetchRequests();
      }
    };
    return () => {
      ws.current && ws.current.close();
    };
    // eslint-disable-next-line
  }, [username, navigate]);

  function fetchRequests() {
    fetch(`http://localhost:8000/my_requests?username=${username}`)
      .then((res) => res.json())
      .then(setRequests)
      .catch(() => setRequests([]));
  }

  function cancelRequest(id, status) {
    if (status === "pending") {
      cancelPendingRequest(id);
    } else if (status === "approved") {
      setCancelId(id);
      setShowCommentForm(true);
    }
  }

  function cancelPendingRequest(id) {
    fetch("http://localhost:8000/cancel_pending_request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request_id: id, username }),
    })
      .then((res) => res.json())
      .then((data) => {
        setSnackbarMsg(data.message);
        setSnackbarSeverity(data.success === false ? "error" : "success");
        setSnackbarOpen(true);
        fetchRequests();
      })
      .catch(() => {
        setSnackbarMsg("Ошибка отмены брони");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  }

  function handleCommentSubmit(e) {
    e.preventDefault();
    fetch("http://localhost:8000/request_return", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        request_id: cancelId,
        username,
        text: commentText,
        rating: commentRating,
      }),
    })
      .then((res) => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        setSnackbarMsg(data.message || (ok ? "Успешно" : "Ошибка"));
        setSnackbarSeverity(ok ? "success" : "error");
        setSnackbarOpen(true);
        if (ok) {
          fetchRequests();
          setShowCommentForm(false);
          setCommentText("");
          setCommentRating(5);
        } else {
          setShowCommentForm(false);
        }
      })
      .catch(() => {
        setSnackbarMsg("Ошибка отправки отзыва");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setShowCommentForm(false);
      });
  }

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      setSnackbarMsg("Введите оба пароля");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }
    const res = await fetch("http://localhost:8000/change_password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        old_password: oldPassword,
        new_password: newPassword,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setSnackbarMsg("Пароль успешно изменён");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setShowChangePassword(false);
      setOldPassword("");
      setNewPassword("");
    } else {
      setSnackbarMsg(data.detail || "Ошибка смены пароля");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 1100,
        mx: "auto",
        mt: { xs: 2, sm: 4, md: 5 },
        px: { xs: 1, sm: 2 },
        minHeight: "100vh",
      }}
    >
      <Navbar />
      <Card
        sx={{
          mb: 4,
          background: "rgba(255,255,255,0.65)",
          border: "1.5px solid #A78B71",
          width: "100%",
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            sx={{ mb: 2, color: "#583E26", fontWeight: 700 }}
          >
            Профиль пользователя
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 2, color: "#A78B71" }}>
            {username}
          </Typography>
          <ChangePasswordForm
            show={showChangePassword}
            setShow={setShowChangePassword}
            oldPassword={oldPassword}
            setOldPassword={setOldPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            handleChangePassword={handleChangePassword}
          />
        </CardContent>
      </Card>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <RequestCard
            title="В броне (ожидает одобрения)"
            requests={requests.filter((r) => r.status === "pending")}
            emptyText="Нет активных броней."
            cancelRequest={cancelRequest}
            type="pending"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <RequestCard
            title="Забронированные (одобрено)"
            requests={requests.filter((r) => r.status === "approved")}
            emptyText="Нет забронированных книг."
            cancelRequest={cancelRequest}
            type="approved"
          />
        </Grid>
      </Grid>
      <CommentDialog
        open={showCommentForm}
        onClose={() => setShowCommentForm(false)}
        commentText={commentText}
        setCommentText={setCommentText}
        commentRating={commentRating}
        setCommentRating={setCommentRating}
        handleCommentSubmit={handleCommentSubmit}
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

export default Profilepage;