import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";


function BookCard({ book, isRentedByMe, isRented }) {
  let buttonText = "Подробнее";
  let disabled = false;
  let buttonColor = "#F7C815";
  if (isRentedByMe) {
    buttonText = "Уже арендовано";
    disabled = true;
    buttonColor = "#EC9704";
  } else if (isRented) {
    buttonText = "Занято";
    disabled = true;
    buttonColor = "#A78B71";
  }
  return (
    <Card
      sx={{
        width: 220,
        minWidth: 220,
        maxWidth: 220,
        height: 390,
        minHeight: 390,
        maxHeight: 390,
        m: "auto",
        p: 1.5,
        borderRadius: 3,
        boxShadow: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: "1px solid #E0C9A6",
        background: "rgba(255,255,255,0.93)",
        transition: "box-shadow 0.2s, border 0.2s",
        "&:hover": {
          boxShadow: 6,
          border: "1.5px solid #F7C815",
        },
      }}
    >
      <CardMedia
        component="img"
        image={book.cover_url}
        alt={book.title}
        sx={{
          width: 140, // увеличено
          height: 190, // увеличено
          objectFit: "cover",
          borderRadius: 2,
          boxShadow: 1,
          mb: 1,
          background: "#fff",
        }}
      />
      <CardContent
        sx={{
          p: 0,
          flex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            fontSize: "0.95rem",
            color: "#583E26",
            textAlign: "center",
            width: "100%",
            lineHeight: 1.15,
            maxHeight: 70,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "normal",
            wordBreak: "break-word",
            mb: 0.5,
          }}
          title={book.title}
        >
          {book.title}
        </Typography>
        <Box sx={{ height: 8 }} />
        <Typography
          variant="caption"
          sx={{
            color: "#A78B71",
            fontSize: "0.85rem",
            textAlign: "center",
            width: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            mb: 2,
          }}
          title={book.author}
        >
          {book.author}
        </Typography>
        {/* Используем Box с mt: "auto" для выравнивания кнопки вниз */}
        <Box sx={{ flexGrow: 1, width: "100%" }} />
        <Button
          fullWidth
          variant="contained"
          href={disabled ? undefined : `/book/${book.id}`}
          disabled={disabled}
          sx={{
            background: buttonColor,
            color: "#583E26",
            fontWeight: 700,
            borderRadius: 2,
            minHeight: 38,
            fontSize: "1rem",
            mt: "auto",
            mb: 1,
            boxShadow: "none",
            letterSpacing: 1,
            "&:hover": { background: buttonColor, color: "#fff" },
            transition: "background 0.2s, color 0.2s",
          }}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}

export default BookCard;
