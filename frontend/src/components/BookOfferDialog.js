import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";

function BookOfferDialog({
  open,
  onClose,
  myBooks,
  selectedBookId,
  setSelectedBookId,
  handleSendBookOffer,
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Выберите книгу для передачи</DialogTitle>
      <DialogContent>
        <TextField
          select
          label="Книга"
          value={selectedBookId}
          onChange={e => setSelectedBookId(e.target.value)}
          fullWidth
          sx={{ mt: 1, minWidth: 250 }}
        >
          {myBooks.map(b => (
            <MenuItem key={b.book_id} value={b.book_id}>
              {b.book_title}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button
          onClick={handleSendBookOffer}
          disabled={!selectedBookId}
          variant="contained"
        >
          Передать
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BookOfferDialog;
