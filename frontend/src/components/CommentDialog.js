import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

function CommentDialog({
  open,
  onClose,
  commentText,
  setCommentText,
  commentRating,
  setCommentRating,
  handleCommentSubmit,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, border: "1.5px solid #A78B71", background: "rgba(255,255,255,0.75)" },
      }}
    >
      <DialogTitle sx={{ color: "#583E26", fontWeight: 700 }}>
        Оставьте отзыв и оценку книге
      </DialogTitle>
      <form onSubmit={handleCommentSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Ваш комментарий"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            required
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
              alignItems: "center",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Typography sx={{ color: "#583E26", fontWeight: 600 }}>Оценка:</Typography>
            <Select
              value={commentRating}
              onChange={(e) => setCommentRating(Number(e.target.value))}
              size="small"
              sx={{
                minWidth: 120,
                color: "#583E26",
                "& .MuiOutlinedInput-root": { borderRadius: 8 },
              }}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            type="submit"
            variant="contained"
            sx={{
              background: "#F7C815",
              color: "#583E26",
              fontWeight: 700,
              mr: 1,
              "&:hover": { background: "#EC9704", color: "#fff" },
            }}
          >
            Отправить отзыв и отменить бронь
          </Button>
          <Button
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

export default CommentDialog;
