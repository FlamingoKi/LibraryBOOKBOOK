import React from "react";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

function UserTable({ users, onEdit, onDelete }) {
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 3,
        border: "1.5px solid #A78B71",
        background: "rgba(255,255,255,0.65)",
        width: "100%",
        overflowX: "auto",
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Пользователь</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Роль</TableCell>
            <TableCell>Действие</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users && users.length > 0 ? users.map((u) => (
            <TableRow key={u.id}>
              <TableCell sx={{ color: "#583E26" }}>{u.username}</TableCell>
              <TableCell sx={{ color: "#A78B71" }}>{u.email}</TableCell>
              <TableCell sx={{ color: "#A78B71" }}>{u.role}</TableCell>
              <TableCell>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: "#A78B71",
                    color: "#A78B71",
                    fontWeight: 700,
                    mr: 1,
                    "&:hover": { borderColor: "#583E26", color: "#583E26" },
                  }}
                  onClick={() => onEdit(u)}
                >
                  Редактировать
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: "#9C4A1A",
                    color: "#9C4A1A",
                    fontWeight: 700,
                    "&:hover": { borderColor: "#EC9704", color: "#EC9704" },
                  }}
                  onClick={() => onDelete(u.username)}
                >
                  Удалить
                </Button>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={4}>
                <Typography sx={{ color: "#9C4A1A" }}>Нет пользователей</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default UserTable;
