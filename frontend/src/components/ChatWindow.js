import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

function ChatWindow({
  username,
  selectedUser,
  messages,
  input,
  setInput,
  sendMessage,
  myBooks,
  handleOpenBookDialog,
  handleBookOfferResponse,
  messagesEndRef,
}) {
  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Paper sx={{ flex: 1, mb: 2, p: 2, minHeight: 300, maxHeight: 400, overflowY: "auto" }}>
        {selectedUser ? (
          <>
            {(messages[selectedUser] || []).map((msg, idx) => {
              if (msg.type === "book_offer") {
                if (msg.from === username) {
                  return (
                    <Box key={idx} sx={{ textAlign: "right", mb: 1 }}>
                      <Typography variant="body2" sx={{
                        display: "inline-block",
                        background: "#F7C815",
                        color: "#583E26",
                        borderRadius: 2,
                        px: 1.5, py: 0.5, fontWeight: 600,
                      }}>
                        Вы предложили книгу: {msg.book.book_title}
                      </Typography>
                    </Box>
                  );
                } else {
                  return (
                    <Box key={idx} sx={{ textAlign: "left", mb: 1 }}>
                      <Typography variant="body2" sx={{
                        display: "inline-block",
                        background: "#A78B71",
                        color: "#583E26",
                        borderRadius: 2,
                        px: 1.5, py: 0.5, fontWeight: 600,
                      }}>
                        {msg.from} предлагает вам книгу: {msg.book.book_title}
                      </Typography>
                      {/* Кнопки только если не обработано */}
                      {!msg.handled && (
                        <Box sx={{ mt: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            sx={{ mr: 1, background: "#4caf50", color: "#fff" }}
                            onClick={() => handleBookOfferResponse(msg.from, msg.book, true)}
                          >
                            Принять
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{ color: "#f44336", borderColor: "#f44336" }}
                            onClick={() => handleBookOfferResponse(msg.from, msg.book, false)}
                          >
                            Отклонить
                          </Button>
                        </Box>
                      )}
                    </Box>
                  );
                }
              }
              if (msg.type === "book_offer_response") {
                return (
                  <Box key={idx} sx={{ textAlign: msg.from === username ? "right" : "left", mb: 1 }}>
                    <Typography variant="body2" sx={{
                      display: "inline-block",
                      background: msg.accepted ? "#F7C815" : "#EC9704",
                      color: "#583E26",
                      borderRadius: 2,
                      px: 1.5, py: 0.5, fontWeight: 600,
                    }}>
                      {msg.accepted
                        ? `Книга "${msg.book.book_title}" передана!`
                        : `Передача книги "${msg.book.book_title}" отклонена`}
                    </Typography>
                  </Box>
                );
              }
              // Обычное сообщение
              return (
                <Box
                  key={idx}
                  sx={{
                    textAlign: msg.from === username ? "right" : "left",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      display: "inline-block",
                      background: msg.from === username ? "#F7C815" : "#A78B71",
                      color: "#583E26",
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.5,
                      fontWeight: 600,
                    }}
                  >
                    {msg.from === username ? "Вы" : msg.from}: {msg.text}
                  </Typography>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <Typography sx={{ color: "#A78B71" }}>Выберите пользователя для чата</Typography>
        )}
      </Paper>
      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
        <TextField
          fullWidth
          placeholder="Введите сообщение..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          disabled={!selectedUser}
        />
        <Button
          variant="contained"
          onClick={sendMessage}
          disabled={!selectedUser || !input.trim()}
          sx={{ background: "#F7C815", color: "#583E26", fontWeight: 700 }}
        >
          Отправить
        </Button>
        <Button
          variant="outlined"
          onClick={handleOpenBookDialog}
          disabled={!selectedUser || myBooks.length === 0}
          sx={{ borderColor: "#A78B71", color: "#A78B71", fontWeight: 700 }}
        >
          Передать книгу
        </Button>
      </Box>
    </Box>
  );
}

export default ChatWindow;
