import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

function AddUserForm({ onUserAdded, token, setSnackbarMsg, setSnackbarSeverity, setSnackbarOpen }) {
  const [form, setForm] = useState({ username: "", password: "", role: "reader", email: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim() || !form.email.trim()) {
      setSnackbarMsg && setSnackbarMsg("Логин, пароль и email не могут быть пустыми");
      setSnackbarSeverity && setSnackbarSeverity("warning");
      setSnackbarOpen && setSnackbarOpen(true);
      return;
    }
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
      setSnackbarMsg && setSnackbarMsg(data.detail || "Ошибка");
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
        required
        sx={{
          "& .MuiOutlinedInput-root": { borderRadius: 8 },
          "& label": { color: "#A78B71" },
        }}
        InputProps={{ style: { color: "#583E26" } }}
      />
      <TextField
        label="Пароль"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        required
        sx={{
          "& .MuiOutlinedInput-root": { borderRadius: 8 },
          "& label": { color: "#A78B71" },
        }}
        InputProps={{ style: { color: "#583E26" } }}
      />
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
    </Box>
  );
}

export default AddUserForm;
