import React, { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";

function ChangePasswordForm({
  show,
  setShow,
  oldPassword,
  setOldPassword,
  newPassword,
  setNewPassword,
  handleChangePassword,
}) {
  const [errors, setErrors] = useState([]);
  const [showPasswordChecks, setShowPasswordChecks] = useState(false);

  const passwordChecks = [
    { test: (v) => v.length >= 8, label: "Минимум 8 символов" },
    { test: (v) => /[A-Z]/.test(v), label: "Хотя бы одна заглавная буква" },
    { test: (v) => /[a-z]/.test(v), label: "Хотя бы одна строчная буква" },
    { test: (v) => /\d/.test(v), label: "Хотя бы одна цифра" },
    { test: (v) => /[^A-Za-z0-9]/.test(v), label: "Хотя бы один специальный символ" },
  ];

  const validate = () => {
    let errs = [];
    if (!oldPassword || !newPassword) {
      errs.push("Введите оба пароля");
    }
    if (!passwordChecks.every((c) => c.test(newPassword))) {
      errs.push("Пароль не соответствует требованиям");
    }
    setErrors(errs);
    return errs.length === 0;
  };

  const onSubmit = (e) => {
    const errs = validate();
    if (errs.length) {
      e.preventDefault();
      return;
    }
    handleChangePassword(e);
  };

  return (
    <>
      <Button
        variant="outlined"
        sx={{
          color: "#A78B71",
          borderColor: "#A78B71",
          fontWeight: 700,
          mb: 2,
          "&:hover": { borderColor: "#583E26", color: "#583E26" },
        }}
        onClick={() => setShow((v) => !v)}
      >
        {show ? "Скрыть смену пароля" : "Сменить пароль"}
      </Button>
      {show && (
        <Box
          component="form"
          onSubmit={onSubmit}
          sx={{
            mt: 2,
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          <TextField
            type="password"
            label="Старый пароль"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: 8 },
              "& label": { color: "#A78B71" },
            }}
            InputProps={{ style: { color: "#583E26" } }}
          />
          <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <TextField
              type="password"
              label="Новый пароль"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onFocus={() => setShowPasswordChecks(true)}
              required
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 8 },
                "& label": { color: "#A78B71" },
              }}
              InputProps={{ style: { color: "#583E26" } }}
            />
            {showPasswordChecks && (
              <Box sx={{ ml: 1, mt: 0.5 }}>
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
          </Box>
          <Button
            type="submit"
            variant="contained"
            sx={{
              background: "#F7C815",
              color: "#583E26",
              fontWeight: 700,
              height: "100%",
              "&:hover": { background: "#EC9704", color: "#fff" },
            }}
          >
            Сменить пароль
          </Button>
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
              {errors.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </Alert>
          )}
        </Box>
      )}
    </>
  );
}

export default ChangePasswordForm;
