import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

function AddBookForm({ formData, setFormData, file, setFile, handleSubmit, handleFileChange, handleChange }) {
  const fieldLabels = {
    title: "Название",
    author: "Автор",
    genre: "Жанр",
    publisher: "Издательство",
    description: "Описание",
    cover_url: "URL обложки",
  };

  return (
    <Card sx={{ mb: 4, background: "rgba(255,255,255,0.65)", border: "1.5px solid #A78B71", width: "100%" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, color: "#583E26", fontWeight: 700 }}>
          Добавить книгу
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          {Object.keys(fieldLabels).map((field) => (
            <TextField
              key={field}
              label={fieldLabels[field]}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              required
              sx={{
                flex: "1 1 220px",
                "& .MuiOutlinedInput-root": { borderRadius: 8 },
                "& label": { color: "#A78B71" },
              }}
              InputProps={{ style: { color: "#583E26" } }}
            />
          ))}
          <Button
            variant="contained"
            component="label"
            sx={{
              alignSelf: "center",
              minWidth: 180,
              background: "#F7C815",
              color: "#583E26",
              fontWeight: 700,
              "&:hover": { background: "#EC9704", color: "#fff" },
            }}
          >
            Загрузить PDF
            <input type="file" accept=".pdf,application/pdf" hidden onChange={handleFileChange} required />
          </Button>
          {file && (
            <Typography variant="caption" sx={{ color: "#A78B71", ml: 1 }}>
              {file.name}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            sx={{
              alignSelf: "center",
              minWidth: 180,
              background: "#F7C815",
              color: "#583E26",
              fontWeight: 700,
              "&:hover": { background: "#EC9704", color: "#fff" },
            }}
          >
            Добавить книгу
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default AddBookForm;
