import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

function ReturnsTable({ requests, handleAcceptReturn }) {
  return (
    <Card sx={{ mb: 4, background: "rgba(255,255,255,0.65)" }}>
      <CardContent>
        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
          Ожидают возврата
        </Typography>
        {requests.filter(r => r.status === "return_requested").length === 0
          ? <Typography>Нет книг на возврат.</Typography>
          : requests.filter(r => r.status === "return_requested").map((r) => (
            <Box key={r.id} sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center" }}>
              <img src={r.cover_url} alt={r.book_title} style={{ width: 60, height: 80, borderRadius: 6 }} />
              <Box>
                <Typography variant="subtitle1">{r.book_title}</Typography>
                <Typography variant="body2">Пользователь: <span>{r.username}</span></Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  sx={{ mt: 1 }}
                  onClick={() => handleAcceptReturn({ request_id: r.id })}
                >
                  Принять возврат
                </Button>
              </Box>
            </Box>
          ))}
      </CardContent>
    </Card>
  );
}

export default ReturnsTable;
