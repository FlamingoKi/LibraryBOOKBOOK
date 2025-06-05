import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { useUserStore } from "../store/userStore";
import { useAuthRedirect } from "../store/useAuthRedirect";
import ChangePasswordForm from "../components/ChangePasswordForm";
import RequestCard from "../components/RequestCard";
import CommentDialog from "../components/CommentDialog";

function Profilepage() {
  useAuthRedirect();
  const [requests, setRequests] = useState([]);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState(5);
  const [cancelId, setCancelId] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const username = useUserStore((s) => s.username);
  const navigate = useNavigate();
  const ws = useRef(null);
  const setSnackbar = useUserStore((s) => s.setSnackbar);

  useEffect(() => {
    fetchRequests();
    ws.current = new window.WebSocket(`ws://localhost:8000/ws/chat/${username}`);
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "book_available") {
        setSnackbar({
          open: true,
          msg: `Книга "${data.book_title}" теперь доступна для аренды!`,
          severity: "info",
        });
        fetchRequests();
      }
    };
    return () => {
      ws.current && ws.current.close();
    };
    // eslint-disable-next-line
  }, [username, navigate]);

  function fetchRequests() {
    setLoading(true);
    fetch(`http://localhost:8000/my_requests?username=${username}`)
      .then((res) => res.json())
      .then(setRequests)
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
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
        setSnackbar({
          open: true,
          msg: data.message,
          severity: data.success === false ? "error" : "success",
        });
        fetchRequests();
      })
      .catch(() => {
        setSnackbar({
          open: true,
          msg: "Ошибка отмены брони",
          severity: "error",
        });
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
        setSnackbar({
          open: true,
          msg: data.message || (ok ? "Успешно" : "Ошибка"),
          severity: ok ? "success" : "error",
        });
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
        setSnackbar({
          open: true,
          msg: "Ошибка отправки отзыва",
          severity: "error",
        });
        setShowCommentForm(false);
      });
  }

  const handleChangePassword = async (e) => {
    e.preventDefault();
    let errors = [];
    if (!oldPassword || !newPassword) {
      errors.push("Введите оба пароля");
    }
    if (newPassword.length < 8) errors.push("минимум 8 символов");
    if (!/[A-Z]/.test(newPassword)) errors.push("хотя бы одну заглавную букву");
    if (!/[a-z]/.test(newPassword)) errors.push("хотя бы одну строчную букву");
    if (!/\d/.test(newPassword)) errors.push("хотя бы одну цифру");
    if (!/[^A-Za-z0-9]/.test(newPassword)) errors.push("хотя бы один специальный символ");
    if (errors.length) {
      setSnackbar({
        open: true,
        msg: errors.join("; "),
        severity: "warning",
      });
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
      setSnackbar({
        open: true,
        msg: "Пароль успешно изменён",
        severity: "success",
      });
      setShowChangePassword(false);
      setOldPassword("");
      setNewPassword("");
    } else {
      let msg = "";
      if (Array.isArray(data)) {
        msg = data.map(
          (err) =>
            typeof err === "object"
              ? (err.msg
                  ? `${err.msg}${err.input ? ` (${err.input})` : ""}`
                  : JSON.stringify(err))
              : String(err)
        ).join("; ");
      } else if (typeof data === "object" && data !== null) {
        msg = data.detail || JSON.stringify(data);
      } else {
        msg = String(data);
      }
      setSnackbar({
        open: true,
        msg: typeof msg === "string" ? msg : JSON.stringify(msg),
        severity: "error",
      });
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
          {loading ? (
            <Typography sx={{ color: "#9C4A1A" }}>Загрузка...</Typography>
          ) : (
            <RequestCard
              title="В броне (ожидает одобрения)"
              requests={requests.filter((r) => r.status === "pending")}
              emptyText="Нет активных броней."
              cancelRequest={cancelRequest}
              type="pending"
            />
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {loading ? (
            <Typography sx={{ color: "#9C4A1A" }}>Загрузка...</Typography>
          ) : (
            <RequestCard
              title="Забронированные (одобрено)"
              requests={requests.filter((r) => r.status === "approved")}
              emptyText="Нет забронированных книг."
              cancelRequest={cancelRequest}
              type="approved"
            />
          )}
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
    </Box>
  );
}

export default Profilepage;