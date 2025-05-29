import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

function BookInfoCard({ book, booked, isBooking, handleRent }) {
  return (
    <Card
      sx={{
        display: "flex",
        gap: { xs: 2, md: 4 },
        alignItems: "flex-start",
        flexDirection: { xs: "column", md: "row" },
        p: { xs: 1, sm: 2, md: 3 },
        background: "rgba(255,255,255,0.65)",
        border: "1.5px solid #A78B71",
        width: "100%",
      }}
    >
      <CardMedia
        component="img"
        image={book.cover_url}
        alt={book.title}
        sx={{ width: 220, height: 320, borderRadius: 2, boxShadow: 2 }}
      />
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h4" sx={{ mb: 2, color: "#583E26", fontWeight: 700 }}>
          {book.title}
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 1, color: "#A78B71" }}>
          Автор: {book.author}
        </Typography>
        <Typography variant="subtitle2" sx={{ mb: 1, color: "#F7C815" }}>
          Жанр: {book.genre}
        </Typography>
        <Typography variant="subtitle2" sx={{ mb: 1, color: "#F7C815" }}>
          Издательство: {book.publisher}
        </Typography>
        <Typography sx={{ my: 2, color: "#583E26" }}>{book.description}</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            onClick={handleRent}
            disabled={isBooking || booked}
            variant="contained"
            sx={{
              background: "#F7C815",
              color: "#583E26",
              fontWeight: 700,
              "&:hover": { background: "#EC9704", color: "#fff" },
            }}
          >
            {booked ? "Уже забронировано" : isBooking ? "..." : "Забронировать"}
          </Button>
          <Button
            variant="outlined"
            sx={{
              borderColor: "#A78B71",
              color: "#A78B71",
              fontWeight: 700,
              "&:hover": { borderColor: "#583E26", color: "#583E26" },
            }}
            href="/catalog"
          >
            Назад
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default BookInfoCard;
