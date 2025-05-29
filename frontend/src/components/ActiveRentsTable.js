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

function ActiveRentsTable({ activeRents, handleCancelRent, handleExtendRent }) {
  return (
    <Card sx={{ mb: 4, background: "rgba(255,255,255,0.65)", width: "100%" }}>
      <CardContent>
        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
          Активные брони
        </Typography>
        <TableContainer component={Paper} sx={{ background: "rgba(255,255,255,0.65)" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Пользователь</TableCell>
                <TableCell>Книга</TableCell>
                <TableCell>Дата бронирования</TableCell>
                <TableCell>Действие</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeRents.map((rent) => (
                <TableRow key={rent.rent_id}>
                  <TableCell>{rent.username}</TableCell>
                  <TableCell>{rent.book_title}</TableCell>
                  <TableCell>{new Date(rent.rented_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" color="error" sx={{ mr: 1 }} onClick={() => handleCancelRent(rent.rent_id)}>
                      Убрать бронь
                    </Button>
                    <Button size="small" variant="contained" color="warning" onClick={() => handleExtendRent(rent.rent_id)}>
                      Продлить
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

export default ActiveRentsTable;
