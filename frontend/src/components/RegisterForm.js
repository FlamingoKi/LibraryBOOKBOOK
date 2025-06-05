import React, { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/userStore";
import Alert from "@mui/material/Alert";

function RegisterForm({ setSnackbarMsg, setSnackbarSeverity, setSnackbarOpen }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState([]);
  const [showUsernameChecks, setShowUsernameChecks] = useState(false);
  const [showPasswordChecks, setShowPasswordChecks] = useState(false);
  const navigate = useNavigate();
  const setUser = useUserStore((s) => s.setUser);

  const usernameChecks = [
    { test: (v) => v.length >= 3 && v.length <= 12, label: "3-12 символов" },
    { test: (v) => /^[a-zA-Z0-9_]+$/.test(v), label: "Только латиница, цифры и _" },
  ];
  const passwordChecks = [
    { test: (v) => v.length >= 8, label: "Минимум 8 символов" },
    { test: (v) => /[A-Z]/.test(v), label: "Хотя бы одна заглавная буква" },
    { test: (v) => /[a-z]/.test(v), label: "Хотя бы одна строчная буква" },
    { test: (v) => /\d/.test(v), label: "Хотя бы одна цифра" },
    { test: (v) => /[^A-Za-z0-9]/.test(v), label: "Хотя бы один специальный символ" },
  ];

  const validate = () => {
    let errs = [];
    if (!username || !password || !email) {
      errs.push("Введите логин, пароль и email");
    }
    if (!usernameChecks.every(c => c.test(username))) {
      errs.push("Логин: 3-12 символов, только латиница, цифры и _");
    }
    if (!passwordChecks.every(c => c.test(password))) {
      errs.push("Пароль не соответствует требованиям");
    }
    if (
      email.length < 5 ||
      email.length > 64 ||
      !/^[^@]+@[^@]+\.[^@]+$/.test(email)
    ) {
      errs.push("Некорректный email");
    }
    setErrors(errs);
    return errs.length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    const res = await fetch("http://localhost:8000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, email }),
    });

    const data = await res.json();

    if (res.ok) {
      const loginRes = await fetch("http://localhost:8000/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username, password }),
      });
      const loginData = await loginRes.json();
      if (loginRes.ok) {
        setUser({ username, role: loginData.role, token: loginData.access_token });
        setSnackbarMsg("Регистрация успешна! Вход...");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setTimeout(() => navigate("/profile"), 1200);
      } else {
        setSnackbarMsg(loginData.detail || "Ошибка входа после регистрации");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
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
      setSnackbarMsg(typeof msg === "string" ? msg : JSON.stringify(msg));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  return (
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
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            textAlign: "center",
            color: "#583E26",
            fontWeight: 700,
          }}
        >
          Регистрация
        </Typography>
        <TextField
          fullWidth
          label="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onFocus={() => setShowUsernameChecks(true)}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": { borderRadius: 8 },
            "& label": { color: "#A78B71" },
          }}
          InputProps={{ style: { color: "#583E26" } }}
        />
        {showUsernameChecks && (
          <Box sx={{ ml: 1, mb: 1 }}>
            {usernameChecks.map((c, i) => (
              <Typography
                key={i}
                variant="caption"
                sx={{
                  color: c.test(username) ? "green" : "#EC9704",
                  display: "block",
                  fontWeight: c.test(username) ? 600 : 400,
                }}
              >
                {c.test(username) ? "✓" : "•"} {c.label}
              </Typography>
            ))}
          </Box>
        )}
        <TextField
          fullWidth
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setShowPasswordChecks(true)}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": { borderRadius: 8 },
            "& label": { color: "#A78B71" },
          }}
          InputProps={{ style: { color: "#583E26" } }}
        />
        {showPasswordChecks && (
          <Box sx={{ ml: 1, mb: 1 }}>
            {passwordChecks.map((c, i) => (
              <Typography
                key={i}
                variant="caption"
                sx={{
                  color: c.test(password) ? "green" : "#EC9704",
                  display: "block",
                  fontWeight: c.test(password) ? 600 : 400,
                }}
              >
                {c.test(password) ? "✓" : "•"} {c.label}
              </Typography>
            ))}
          </Box>
        )}
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": { borderRadius: 8 },
            "& label": { color: "#A78B71" },
          }}
          InputProps={{ style: { color: "#583E26" } }}
        />
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            mt: 2,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Button
            variant="contained"
            sx={{
              background: "#F7C815",
              color: "#583E26",
              fontWeight: 700,
              "&:hover": { background: "#EC9704", color: "#fff" },
            }}
            onClick={handleRegister}
          >
            Зарегистрироваться
          </Button>
          <Button
            variant="outlined"
            sx={{
              borderColor: "#A78B71",
              color: "#A78B71",
              fontWeight: 700,
              "&:hover": { borderColor: "#583E26", color: "#583E26" },
            }}
            onClick={() => navigate("/")}
          >
            Назад
          </Button>
        </Box>
        {errors.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2, background: "#EC9704", color: "#583E26", fontWeight: 600 }}>
            {errors.map((err, i) => <div key={i}>{err}</div>)}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default RegisterForm;
