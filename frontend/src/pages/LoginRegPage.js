import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { AppSnackbar } from "../App";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import { useUserStore } from "../store/userStore";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState(""); // добавьте это состояние
  const navigate = useNavigate();
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      setSnackbarMsg("Введите логин и пароль");
      setSnackbarOpen(true);
      return;
    }
    const res = await fetch("http://localhost:8000/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setUser({ username, role: data.role, token: data.access_token });
      setSnackbarMsg("Вход выполнен");
      setSnackbarOpen(true);
      setTimeout(() => navigate("/profile"), 1200);
    } else {
      setSnackbarMsg(data.detail || "Ошибка");
      setSnackbarOpen(true);
      setShowForgot(true);
    }
  };

  const handleForgotPassword = () => {
    setShowResetModal(true);
    setResetMsg("");
    setResetEmail("");
  };

  const handleSendReset = async (e) => {
    e.preventDefault();
    setResetMsg("");
    const res = await fetch("http://localhost:8000/request_password_reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: resetEmail }),
    });
    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    if (res.ok) {
      setResetMsg("Письмо отправлено! Проверьте почту.");
      setSnackbarOpen(true);
    } else {
      // Преобразуем ошибку в строку
      let msg = "";
      if (Array.isArray(data)) {
        msg = data.map(
          (err) => (err.msg ? `${err.msg}${err.input ? ` (${err.input})` : ""}` : JSON.stringify(err))
        ).join("; ");
      } else if (typeof data === "object" && data !== null) {
        msg = data.detail || JSON.stringify(data);
      } else {
        msg = String(data);
      }
      setResetMsg(msg || "Ошибка отправки письма");
      setSnackbarOpen(true);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 0, // убрали отступ сверху полностью
        px: { xs: 1, sm: 2 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 3,
        }}
      >
        <img
          src="/logo.png"
          alt="Логотип"
          style={{
            height: 90,
            width: 90,
            borderRadius: 24,
            background: "rgba(255,255,255,0.55)",
            boxShadow: "0 4px 24px 0 rgba(88,62,38,0.13)",
            objectFit: "contain",
            backdropFilter: "blur(2px)",
            transition: "box-shadow 0.3s, background 0.3s",
            border: "2.5px solid rgba(167,139,113,0.25)",
            opacity: 0.92,
            animation: "fadeInLogo 1s",
          }}
        />
      </Box>
      <Card
        elevation={4}
        sx={{
          background: "rgba(255,255,255,0.65)",
          border: "1.5px solid #A78B71",
          width: "100%",
          maxWidth: 400,
          mx: "auto",
          "@media (max-width: 500px)": {
            px: 1,
          },
        }}
      >
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, textAlign: "center", color: "#583E26", fontWeight: 700 }}>
            Вход
          </Typography>
          <TextField
            fullWidth
            label="Логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": { borderRadius: 8 },
              "& label": { color: "#A78B71" },
            }}
            InputProps={{ style: { color: "#583E26" } }}
          />
          <TextField
            fullWidth
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": { borderRadius: 8 },
              "& label": { color: "#A78B71" },
            }}
            InputProps={{ style: { color: "#583E26" } }}
          />
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 2 }}>
            <Button
              variant="contained"
              sx={{
                background: "#F7C815",
                color: "#583E26",
                "&:hover": { background: "#EC9704", color: "#fff" },
                fontWeight: 700,
              }}
              onClick={handleLogin}
            >
              Вход
            </Button>
            <Button
              variant="outlined"
              sx={{
                borderColor: "#A78B71",
                color: "#A78B71",
                fontWeight: 700,
                "&:hover": { borderColor: "#583E26", color: "#583E26" },
              }}
              onClick={() => navigate("/register")}
            >
              Регистрация
            </Button>
          </Box>
          {showForgot && (
            <Button
              variant="text"
              sx={{
                mt: 1,
                width: "100%",
                color: "#EC9704",
                fontWeight: 700,
                "&:hover": { color: "#9C4A1A" },
              }}
              onClick={handleForgotPassword}
            >
              Забыли пароль?
            </Button>
          )}
        </CardContent>
      </Card>
      <Dialog open={showResetModal} onClose={() => setShowResetModal(false)}
        PaperProps={{
          sx: { background: "rgba(255,255,255,0.75)" }
        }}
      >
        <DialogTitle sx={{ color: "#583E26", fontWeight: 700 }}>Сброс пароля</DialogTitle>
        <form onSubmit={handleSendReset}>
          <DialogContent>
            <TextField
              fullWidth
              label="Введите ваш email"
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": { borderRadius: 8 },
                "& label": { color: "#A78B71" },
              }}
              InputProps={{ style: { color: "#583E26" } }}
            />
            {resetMsg && (
              <Alert
                severity={resetMsg.includes("Письмо отправлено") ? "success" : "warning"}
                sx={{
                  background: resetMsg.includes("Письмо отправлено") ? "#F7C815" : "#EC9704",
                  color: "#583E26",
                  fontWeight: 600,
                }}
              >
                {resetMsg}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setShowResetModal(false)}
              sx={{
                color: "#A78B71",
                borderColor: "#A78B71",
                fontWeight: 700,
              }}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                background: "#F7C815",
                color: "#583E26",
                fontWeight: 700,
                "&:hover": { background: "#EC9704", color: "#fff" },
              }}
            >
              Отправить ссылку
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <AppSnackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        severity="success"
        message={snackbarMsg}
        autoHideDuration={2000}
      />
    </Box>
  );
}

export default LoginPage;
