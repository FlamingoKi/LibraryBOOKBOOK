import { NavLink, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useUserStore } from "../store/userStore";

function Navbar() {
  const navigate = useNavigate();
  const { username, role, clearUser } = useUserStore();

  const handleLogout = () => {
    clearUser();
    navigate("/", { replace: true }); // Используем navigate с replace
  };

  return (
    <AppBar
      position="static"
      elevation={2}
      sx={{
        mb: 3,
        background: "#583E26",
        color: "#fff",
        borderBottom: "3px solid #F7C815",
        borderRadius: 2,
        px: { xs: 1, sm: 2 },
        boxShadow: "0 4px 24px 0 rgba(88,62,38,0.08)",
        width: "100%",
        minWidth: 0,
      }}
    >
      <Toolbar
        sx={{
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          gap: { xs: 1, sm: 0 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1, minWidth: 0 }}>
          <img
            src="/logo.png"
            alt="Логотип"
            style={{
              height: 38,
              width: 38,
              borderRadius: 12,
              marginRight: 14,
              background: "rgba(255,255,255,0.55)",
              boxShadow: "0 2px 12px 0 rgba(88,62,38,0.13)",
              objectFit: "contain",
              backdropFilter: "blur(1.5px)",
              border: "2px solid rgba(167,139,113,0.18)",
              opacity: 0.92,
              transition: "box-shadow 0.3s, background 0.3s",
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Montserrat', 'Roboto', sans-serif",
              fontWeight: 700,
              letterSpacing: 2,
              color: "#F7C815",
              fontSize: "1.5rem",
              userSelect: "none",
            }}
          >
            Библиотека
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: { xs: 1, sm: 0 },
            mt: { xs: 1, sm: 0 },
          }}
        >
          <NavLink
            to="/catalog"
            style={{ textDecoration: "none" }}
            className={({ isActive }) => isActive ? "active" : ""}
          >
            <Box
              sx={{
                mx: 1,
                px: 1,
                color: "#fff",
                fontWeight: 600,
                fontFamily: "'Montserrat', 'Roboto', sans-serif",
                fontSize: "1rem",
                position: "relative",
                transition: "color 0.2s",
                "&:hover": { color: "#F7C815" },
                "&.active": { color: "#F7C815" },
                "&:after": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  left: 0,
                  bottom: -2,
                  height: 2,
                  width: 0,
                  background: "#F7C815",
                  borderRadius: 2,
                  transition: "width 0.3s",
                },
                "&:hover:after, &.active:after": {
                  width: "100%",
                },
              }}
              className="navlink-box"
            >
              Каталог
            </Box>
          </NavLink>
          {username && (
            <>
              <NavLink to="/profile" style={{ textDecoration: "none" }} className={({ isActive }) => isActive ? "active" : ""}>
                <Box
                  sx={{
                    mx: 1,
                    px: 1,
                    color: "#fff",
                    fontWeight: 600,
                    fontFamily: "'Montserrat', 'Roboto', sans-serif",
                    fontSize: "1rem",
                    position: "relative",
                    transition: "color 0.2s",
                    "&:hover": { color: "#F7C815" },
                    "&.active": { color: "#F7C815" },
                    "&:after": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      left: 0,
                      bottom: -2,
                      height: 2,
                      width: 0,
                      background: "#F7C815",
                      borderRadius: 2,
                      transition: "width 0.3s",
                    },
                    "&:hover:after, &.active:after": {
                      width: "100%",
                    },
                  }}
                  className="navlink-box"
                >
                  Профиль
                </Box>
              </NavLink>
              <NavLink to="/chat" style={{ textDecoration: "none" }} className={({ isActive }) => isActive ? "active" : ""}>
                <Box
                  sx={{
                    mx: 1,
                    px: 1,
                    color: "#fff",
                    fontWeight: 600,
                    fontFamily: "'Montserrat', 'Roboto', sans-serif",
                    fontSize: "1rem",
                    position: "relative",
                    transition: "color 0.2s",
                    "&:hover": { color: "#F7C815" },
                    "&.active": { color: "#F7C815" },
                    "&:after": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      left: 0,
                      bottom: -2,
                      height: 2,
                      width: 0,
                      background: "#F7C815",
                      borderRadius: 2,
                      transition: "width 0.3s",
                    },
                    "&:hover:after, &.active:after": {
                      width: "100%",
                    },
                  }}
                  className="navlink-box"
                >
                  Чат
                </Box>
              </NavLink>
              {role === "admin" && (
                <NavLink to="/admin" style={{ textDecoration: "none" }} className={({ isActive }) => isActive ? "active" : ""}>
                  <Box
                    sx={{
                      mx: 1,
                      px: 1,
                      color: "#fff",
                      fontWeight: 600,
                      fontFamily: "'Montserrat', 'Roboto', sans-serif",
                      fontSize: "1rem",
                      position: "relative",
                      transition: "color 0.2s",
                      "&:hover": { color: "#F7C815" },
                      "&.active": { color: "#F7C815" },
                      "&:after": {
                        content: '""',
                        display: "block",
                        position: "absolute",
                        left: 0,
                        bottom: -2,
                        height: 2,
                        width: 0,
                        background: "#F7C815",
                        borderRadius: 2,
                        transition: "width 0.3s",
                      },
                      "&:hover:after, &.active:after": {
                        width: "100%",
                      },
                    }}
                    className="navlink-box"
                  >
                    Админ-панель
                  </Box>
                </NavLink>
              )}
              {role === "librarian" && (
                <NavLink to="/librarian" style={{ textDecoration: "none" }} className={({ isActive }) => isActive ? "active" : ""}>
                  <Box
                    sx={{
                      mx: 1,
                      px: 1,
                      color: "#fff",
                      fontWeight: 600,
                      fontFamily: "'Montserrat', 'Roboto', sans-serif",
                      fontSize: "1rem",
                      position: "relative",
                      transition: "color 0.2s",
                      "&:hover": { color: "#F7C815" },
                      "&.active": { color: "#F7C815" },
                      "&:after": {
                        content: '""',
                        display: "block",
                        position: "absolute",
                        left: 0,
                        bottom: -2,
                        height: 2,
                        width: 0,
                        background: "#F7C815",
                        borderRadius: 2,
                        transition: "width 0.3s",
                      },
                      "&:hover:after, &.active:after": {
                        width: "100%",
                      },
                    }}
                    className="navlink-box"
                  >
                    Библиотекарь
                  </Box>
                </NavLink>
              )}
              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{
                  mx: 1,
                  color: "#EC9704",
                  border: "1.5px solid #EC9704",
                  borderRadius: 2,
                  fontWeight: 700,
                  fontFamily: "'Montserrat', 'Roboto', sans-serif",
                  "&:hover": { background: "#EC9704", color: "#fff" },
                  transition: "all 0.2s",
                }}
              >
                Выход
              </Button>
              <Typography
                variant="body1"
                sx={{
                  color: "#F7C815",
                  fontWeight: 600,
                  ml: 1,
                  fontFamily: "'Montserrat', 'Roboto', sans-serif",
                }}
              >
                {username}
              </Typography>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
