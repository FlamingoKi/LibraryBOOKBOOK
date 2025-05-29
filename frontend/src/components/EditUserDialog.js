import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";

function EditUserDialog({
  open,
  onClose,
  editForm,
  setEditForm,
  onSubmit,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: "1.5px solid #A78B71",
          background: "rgba(255,255,255,0.75)",
          width: { xs: "95vw", sm: "auto" },
          maxWidth: "500px",
        },
      }}
    >
      <DialogTitle sx={{ color: "#583E26", fontWeight: 700 }}>Редактировать пользователя</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <TextField
            label="Новый логин"
            value={editForm.new_username}
            onChange={e => setEditForm(f => ({ ...f, new_username: e.target.value }))}
            required
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": { borderRadius: 8 },
              "& label": { color: "#A78B71" },
            }}
            InputProps={{ style: { color: "#583E26" } }}
          />
          <TextField
            label="Email"
            value={editForm.new_email || ""}
            onChange={e => setEditForm(f => ({ ...f, new_email: e.target.value }))}
            required
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": { borderRadius: 8 },
              "& label": { color: "#A78B71" },
            }}
            InputProps={{ style: { color: "#583E26" } }}
          />
          <TextField
            label="Новый пароль (опционально)"
            type="password"
            value={editForm.new_password}
            onChange={e => setEditForm(f => ({ ...f, new_password: e.target.value }))}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": { borderRadius: 8 },
              "& label": { color: "#A78B71" },
            }}
            InputProps={{ style: { color: "#583E26" } }}
          />
          <Select
            value={editForm.new_role}
            onChange={e => setEditForm(f => ({ ...f, new_role: e.target.value }))}
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
        </DialogContent>
        <DialogActions>
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
            Сохранить
          </Button>
          <Button
            type="button"
            onClick={onClose}
            sx={{
              color: "#A78B71",
              borderColor: "#A78B71",
              fontWeight: 700,
            }}
            variant="outlined"
          >
            Отмена
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default EditUserDialog;
