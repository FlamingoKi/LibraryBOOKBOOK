import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

function BookComments({ comments, avgRating }) {
  return (
    <Paper
      sx={{
        mt: 4,
        p: { xs: 1, sm: 2, md: 3 },
        background: "rgba(255,255,255,0.65)",
        border: "1.5px solid #A78B71",
        width: "100%",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, color: "#583E26", fontWeight: 700 }}>
        Средняя оценка: {avgRating ? `${avgRating} / 5` : "Нет оценок"}
      </Typography>
      <Typography variant="h6" sx={{ mb: 2, color: "#583E26", fontWeight: 700 }}>
        Комментарии
      </Typography>
      {comments.length === 0 ? (
        <Typography sx={{ color: "#9C4A1A" }}>Нет комментариев</Typography>
      ) : (
        comments.map((c, i) => (
          <Box key={i} sx={{ borderBottom: "1.5px solid #F7C815", mb: 2, pb: 1 }}>
            <Typography variant="subtitle2" sx={{ color: "#F7C815", fontWeight: 600 }}>
              <b>{c.username}</b> — Оценка: {c.rating}/5
            </Typography>
            <Typography variant="body2" sx={{ color: "#A78B71" }}>{c.text}</Typography>
            <Typography variant="caption" sx={{ color: "#EC9704" }}>
              {new Date(c.created_at).toLocaleString()}
            </Typography>
          </Box>
        ))
      )}
    </Paper>
  );
}

export default BookComments;
