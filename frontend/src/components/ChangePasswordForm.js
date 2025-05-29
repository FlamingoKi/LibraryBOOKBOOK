import React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

function ChangePasswordForm({
  show,
  setShow,
  oldPassword,
  setOldPassword,
  newPassword,
  setNewPassword,
  handleChangePassword,
}) {
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
          onSubmit={handleChangePassword}
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
          <TextField
            type="password"
            label="Новый пароль"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: 8 },
              "& label": { color: "#A78B71" },
            }}
            InputProps={{ style: { color: "#583E26" } }}
          />
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
        </Box>
      )}
    </>
  );
}

export default ChangePasswordForm;
