import React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

function UserList({ users, selectedUser, setSelectedUser }) {
  return (
    <Paper sx={{ minWidth: 200, maxHeight: 400, overflowY: "auto" }}>
      <Typography sx={{ p: 1, fontWeight: 700 }}>Пользователи онлайн</Typography>
      <List>
        {users.length === 0 && (
          <ListItem>
            <ListItemText primary="Нет других пользователей" />
          </ListItem>
        )}
        {users.map((u) => (
          <ListItem
            button
            key={u}
            selected={selectedUser === u}
            onClick={() => setSelectedUser(u)}
          >
            <ListItemText primary={u} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default UserList;
