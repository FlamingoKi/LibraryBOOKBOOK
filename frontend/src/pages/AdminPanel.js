import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useUserStore } from "../store/userStore";
import { useAuthRedirect } from "../store/useAuthRedirect";
import AddUserForm from "../components/AddUserForm";
import UserTable from "../components/UserTable";
import EditUserDialog from "../components/EditUserDialog";

function AdminPanel() {
  useAuthRedirect();
  const [users, setUsers] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "",
    username: "",
    new_username: "",
    new_password: "",
    new_role: "reader",
    new_email: "",
  });
  const role = useUserStore((s) => s.role);
  const username = useUserStore((s) => s.username);
  const navigate = useNavigate();
  const ws = useRef(null);
  const setSnackbar = useUserStore((s) => s.setSnackbar);

  useEffect(() => {
    if (useUserStore.getState().username) {
      ws.current = new window.WebSocket(`ws://localhost:8000/ws/chat/${useUserStore.getState().username}`);
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "book_available") {
          setSnackbar({
            open: true,
            msg: `Книга "${data.book_title}" теперь доступна для аренды!`,
            severity: "info",
          });
        }
      };
    }
    return () => {
      ws.current && ws.current.close();
    };
  }, [role, username, navigate, setSnackbar]);

  const fetchUsers = () => {
    fetch("http://localhost:8000/users", {
      headers: {
        Authorization: `Bearer ${useUserStore.getState().token || ""}`
      }
    })
      .then(async (res) => {
        if (res.status === 403) {
          setSnackbar({
            open: true,
            msg: "Нет доступа к админ-панели",
            severity: "error",
          });
          setTimeout(() => navigate("/profile", { replace: true }), 0);
          return [];
        }
        return res.json();
      })
      .then(setUsers)
      .catch(() => setUsers([]));
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [role]);

  const handleEdit = (user) => {
    setEditForm({
      id: user.id,
      username: user.username,
      new_username: user.username,
      new_password: "",
      new_role: user.role,
      new_email: user.email || "",
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (username) => {
    if (!window.confirm(`Удалить пользователя "${username}"?`)) return;
    fetch("http://localhost:8000/admin/delete_user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${useUserStore.getState().token || ""}`
      },
      body: JSON.stringify({ username }),
    })
      .then((res) => res.json())
      .then((data) => {
        setSnackbar({
          open: true,
          msg: data.message || "Пользователь удалён",
          severity: "success",
        });
        fetchUsers();
      })
      .catch(() => {
        setSnackbar({
          open: true,
          msg: "Ошибка удаления пользователя",
          severity: "error",
        });
      });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8000/admin/edit_user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${useUserStore.getState().token || ""}`
      },
      body: JSON.stringify({
        id: editForm.id,
        username: editForm.username,
        new_username: editForm.new_username,
        new_password: editForm.new_password,
        new_role: editForm.new_role,
        new_email: editForm.new_email,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setSnackbar({
        open: true,
        msg: data.message || "Пользователь обновлён",
        severity: "success",
      });
      setEditDialogOpen(false);
      fetchUsers();
    } else {
      setSnackbar({
        open: true,
        msg: data.detail || "Ошибка обновления пользователя",
        severity: "error",
      });
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 1100,
        mx: "auto",
        mt: { xs: 2, sm: 4, md: 5 },
        px: { xs: 1, sm: 2 },
        minHeight: "100vh",
      }}
    >
      <Navbar />
      <Card
        sx={{
          mb: 4,
          background: "rgba(255,255,255,0.65)",
          border: "1.5px solid #A78B71",
          width: "100%",
        }}
      >
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2, color: "#583E26", fontWeight: 700 }}>
            Админ-панель
          </Typography>
          <AddUserForm
            onUserAdded={fetchUsers}
            token={useUserStore.getState().token}
          />
          <UserTable users={users} onEdit={handleEdit} onDelete={handleDelete} />
        </CardContent>
      </Card>
      <EditUserDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        editForm={editForm}
        setEditForm={setEditForm}
        onSubmit={handleEditSubmit}
      />
    </Box>
  );
}

export default AdminPanel;
