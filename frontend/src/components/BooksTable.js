import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";

function BooksTable({ books, handleDeleteBook }) {
  return (
    <Card sx={{ mb: 4, background: "rgba(255,255,255,0.65)", width: "100%" }}>
      <CardContent>
        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
          Список книг
        </Typography>
        <TableContainer component={Paper} sx={{ background: "rgba(255,255,255,0.65)" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Автор</TableCell>
                <TableCell>Жанр</TableCell>
                <TableCell>Действие</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {books.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.genre}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleDeleteBook(book.id)}>
                      Удалить
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

export default BooksTable;
