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

function RequestsTable({ requests, handleProcess }) {
  return (
    <Card sx={{ mb: 4, background: "rgba(255,255,255,0.65)" }}>
      <CardContent>
        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
          Заявки на аренду
        </Typography>
        <TableContainer component={Paper} sx={{ background: "rgba(255,255,255,0.65)" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Пользователь</TableCell>
                <TableCell>Книга</TableCell>
                <TableCell>Дата</TableCell>
                <TableCell>Действие</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests
                .filter(req => req.status === "pending")
                .map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.username}</TableCell>
                    <TableCell>{req.book_title}</TableCell>
                    <TableCell>{new Date(req.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button size="small" variant="contained" color="success" sx={{ mr: 1 }} onClick={() => handleProcess(req.id, true)}>
                        Одобрить
                      </Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => handleProcess(req.id, false)}>
                        Отклонить
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

export default RequestsTable;
