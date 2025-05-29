import React, { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/userStore";

function RegisterForm({ setSnackbarMsg, setSnackbarSeverity, setSnackbarOpen }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const setUser = useUserStore((s) => s.setUser);

  const handleRegister = async () => {
    if (!username || !password || !email) {
      setSnackbarMsg("Введите логин, пароль и email");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }
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
      setSnackbarMsg(data.detail || "Ошибка регистрации");
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
      </CardContent>
    </Card>
  );
}

export default RegisterForm;
