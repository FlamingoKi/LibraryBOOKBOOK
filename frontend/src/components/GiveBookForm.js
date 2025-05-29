import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";

function GiveBookForm({
  users,
  books,
  selectedUser,
  setSelectedUser,
  selectedBook,
  setSelectedBook,
  handleGiveBook,
}) {
  return (
    <Card sx={{ mb: 4, background: "rgba(255,255,255,0.65)", width: "100%" }}>
      <CardContent>
        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
          Выдать книгу пользователю
        </Typography>
        <Box component="form" onSubmit={handleGiveBook} sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Select
            value={selectedUser}
            onChange={e => setSelectedUser(e.target.value)}
            required
            displayEmpty
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Выберите пользователя</MenuItem>
            {users.map(u => (
              <MenuItem key={u.id} value={u.username}>{u.username}</MenuItem>
            ))}
          </Select>
          <Select
            value={selectedBook}
            onChange={e => setSelectedBook(e.target.value)}
            required
            displayEmpty
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Выберите книгу</MenuItem>
            {books.map(b => (
              <MenuItem key={b.id} value={b.id}>{b.title}</MenuItem>
            ))}
          </Select>
          <Button type="submit" variant="contained" color="primary">
            Выдать
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default GiveBookForm;
