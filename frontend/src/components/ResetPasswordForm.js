import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";

function ResetPasswordForm() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [showPasswordChecks, setShowPasswordChecks] = useState(false);
  const navigate = useNavigate();

  const passwordChecks = [
    { test: (v) => v.length >= 8, label: "Минимум 8 символов" },
    { test: (v) => /[A-Z]/.test(v), label: "Хотя бы одна заглавная буква" },
    { test: (v) => /[a-z]/.test(v), label: "Хотя бы одна строчная буква" },
    { test: (v) => /\d/.test(v), label: "Хотя бы одна цифра" },
    { test: (v) => /[^A-Za-z0-9]/.test(v), label: "Хотя бы один специальный символ" },
  ];

  const handleReset = async (e) => {
    e.preventDefault();
    let errs = [];
    if (!passwordChecks.every(c => c.test(newPassword))) {
      errs.push("Пароль не соответствует требованиям");
    }
    setErrors(errs);
    if (errs.length) return;
    setLoading(true);
    setMsg("");
    const res = await fetch("http://localhost:8000/reset_password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, new_password: newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg("Пароль успешно сброшен! Теперь вы можете войти.");
      setTimeout(() => navigate("/"), 2000);
    } else {
      setMsg(data.detail || "Ошибка сброса пароля");
    }
    setLoading(false);
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
          Сброс пароля
        </Typography>
        <form onSubmit={handleReset}>
          <TextField
            fullWidth
            type="password"
            label="Новый пароль"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onFocus={() => setShowPasswordChecks(true)}
            required
            sx={{
              mb: 1,
              "& .MuiOutlinedInput-root": { borderRadius: 8 },
              "& label": { color: "#A78B71" },
            }}
            InputProps={{ style: { color: "#583E26" } }}
          />
          {showPasswordChecks && (
            <Box sx={{ mb: 2, ml: 1 }}>
              {passwordChecks.map((c, i) => (
                <Typography
                  key={i}
                  variant="caption"
                  sx={{
                    color: c.test(newPassword) ? "green" : "#EC9704",
                    display: "block",
                    fontWeight: c.test(newPassword) ? 600 : 400,
                  }}
                >
                  {c.test(newPassword) ? "✓" : "•"} {c.label}
                </Typography>
              ))}
            </Box>
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              background: "#F7C815",
              color: "#583E26",
              fontWeight: 700,
              "&:hover": { background: "#EC9704", color: "#fff" },
            }}
          >
            {loading ? "Отправка..." : "Сбросить пароль"}
          </Button>
        </form>
        {errors.length > 0 && (
          <Alert
            severity="warning"
            sx={{
              mt: 2,
              background: "#EC9704",
              color: "#583E26",
              fontWeight: 600,
            }}
          >
            {errors.map((err, i) => <div key={i}>{err}</div>)}
          </Alert>
        )}
        {msg && (
          <Alert
            severity={msg.includes("успешно") ? "success" : "warning"}
            sx={{
              mt: 2,
              background: msg.includes("успешно") ? "#F7C815" : "#EC9704",
              color: "#583E26",
              fontWeight: 600,
            }}
          >
            {msg}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default ResetPasswordForm;
