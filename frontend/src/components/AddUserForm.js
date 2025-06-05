import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";

function AddUserForm({ onUserAdded, token, setSnackbarMsg, setSnackbarSeverity, setSnackbarOpen }) {
  const [form, setForm] = useState({ username: "", password: "", role: "reader", email: "" });
  const [errors, setErrors] = useState([]);
  const [showUsernameChecks, setShowUsernameChecks] = useState(false);
  const [showPasswordChecks, setShowPasswordChecks] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
    if (!form.username.trim() || !form.password.trim() || !form.email.trim()) {
      errs.push("Логин, пароль и email не могут быть пустыми");
    }
    if (!usernameChecks.every(c => c.test(form.username))) {
      errs.push("Логин: 3-12 символов, только латиница, цифры и _");
    }
    if (!passwordChecks.every(c => c.test(form.password))) {
      errs.push("Пароль не соответствует требованиям");
    }
    if (
      form.email.length < 5 ||
      form.email.length > 64 ||
      !/^[^@]+@[^@]+\.[^@]+$/.test(form.email)
    ) {
      errs.push("Некорректный email");
    }
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const res = await fetch("http://localhost:8000/admin/add_user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || ""}`
      },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setSnackbarMsg && setSnackbarMsg(data.message || "Пользователь добавлен");
      setSnackbarSeverity && setSnackbarSeverity("success");
      setSnackbarOpen && setSnackbarOpen(true);
      setForm({ username: "", password: "", role: "reader", email: "" });
      onUserAdded && onUserAdded();
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
      setSnackbarMsg && setSnackbarMsg(typeof msg === "string" ? msg : JSON.stringify(msg));
      setSnackbarSeverity && setSnackbarSeverity("error");
      setSnackbarOpen && setSnackbarOpen(true);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        gap: 2,
        mb: 3,
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "center" },
      }}
    >
      <TextField
        label="Логин"
        name="username"
        value={form.username}
        onChange={handleChange}
        onFocus={() => setShowUsernameChecks(true)}
        required
        sx={{
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
                color: c.test(form.username) ? "green" : "#EC9704",
                display: "block",
                fontWeight: c.test(form.username) ? 600 : 400,
              }}
            >
              {c.test(form.username) ? "✓" : "•"} {c.label}
            </Typography>
          ))}
        </Box>
      )}
      <TextField
        label="Пароль"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        onFocus={() => setShowPasswordChecks(true)}
        required
        sx={{
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
                color: c.test(form.password) ? "green" : "#EC9704",
                display: "block",
                fontWeight: c.test(form.password) ? 600 : 400,
              }}
            >
              {c.test(form.password) ? "✓" : "•"} {c.label}
            </Typography>
          ))}
        </Box>
      )}
      <TextField
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        required
        sx={{
          "& .MuiOutlinedInput-root": { borderRadius: 8 },
          "& label": { color: "#A78B71" },
        }}
        InputProps={{ style: { color: "#583E26" } }}
      />
      <Select
        name="role"
        value={form.role}
        onChange={handleChange}
        sx={{
          minWidth: 120,
          color: "#583E26",
          "& .MuiOutlinedInput-root": { borderRadius: 8 },
        }}
      >
        <MenuItem value="reader">reader</MenuItem>
        <MenuItem value="librarian">librarian</MenuItem>
        <MenuItem value="admin">admin</MenuItem>
      </Select>
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
        Добавить
      </Button>
      {errors.length > 0 && (
        <Alert severity="warning" sx={{ mt: 2, background: "#EC9704", color: "#583E26", fontWeight: 600 }}>
          {errors.map((err, i) => <div key={i}>{err}</div>)}
        </Alert>
      )}
    </Box>
  );
}

export default AddUserForm;
