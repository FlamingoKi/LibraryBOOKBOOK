import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";

function RequestCard({ title, requests, emptyText, cancelRequest, type }) {
  return (
    <Card sx={{ mb: 3, background: "rgba(255,255,255,0.65)", border: "1.5px solid #A78B71" }}>
      <CardContent>
        <Typography
          variant="h6"
          sx={{ mb: 2, color: "#583E26", fontWeight: 700 }}
        >
          {title}
        </Typography>
        {requests.length === 0 ? (
          <Typography sx={{ color: "#9C4A1A" }}>{emptyText}</Typography>
        ) : (
          requests.map((r) => (
            <Box
              key={r.id}
              sx={{
                mb: 2,
                display: "flex",
                gap: 2,
                alignItems: "center",
              }}
            >
              <img
                src={r.cover_url}
                alt={r.book_title}
                style={{
                  width: 60,
                  height: 80,
                  borderRadius: 6,
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ color: "#583E26", fontWeight: 600 }}
                >
                  {r.book_title}
                </Typography>
                <Typography variant="body2" sx={{ color: "#A78B71" }}>
                  {r.description}
                </Typography>
                <Typography variant="caption" sx={{ color: "#F7C815" }}>
                  Автор: {r.author} | Жанр: {r.genre} | Издание: {r.publisher}
                </Typography>
                <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {type === "approved" && (
                    <Button
                      variant="contained"
                      sx={{
                        background: "#F7C815",
                        color: "#583E26",
                        fontWeight: 700,
                        "&:hover": { background: "#EC9704", color: "#fff" },
                      }}
                      size="small"
                      component={Link}
                      to={`/read/${r.book_id}`}
                    >
                      Читать
                    </Button>
                  )}
                  <Button
                    variant={type === "pending" ? "outlined" : "outlined"}
                    sx={{
                      color: "#EC9704",
                      borderColor: "#EC9704",
                      fontWeight: 700,
                      "&:hover": { borderColor: "#9C4A1A", color: "#9C4A1A" },
                    }}
                    size="small"
                    onClick={() => {
                      if (window.confirm("Вы уверены, что хотите отменить бронь?")) {
                        cancelRequest(r.id, r.status);
                      }
                    }}
                  >
                    Отменить бронь
                  </Button>
                </Box>
              </Box>
            </Box>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default RequestCard;
