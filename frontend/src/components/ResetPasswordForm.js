import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";

function ResetPasswordForm() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
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
            required
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": { borderRadius: 8 },
              "& label": { color: "#A78B71" },
            }}
            InputProps={{ style: { color: "#583E26" } }}
          />
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
