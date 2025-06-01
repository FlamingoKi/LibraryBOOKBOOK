import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginRegPage";
import RegisterPage from "./pages/RegisterPage";
import Profilepage from "./pages/Profilepage";
import CatalogPage from "./pages/CatalogPage";
import ReadPage from "./pages/ReadPage";
import AdminPanel from "./pages/AdminPanel";
import LibrarianPanel from "./pages/LibrarianPanel";
import BookPage from "./pages/BookPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GradientBackground from "./GradientBackground";
import ChatPage from "./pages/ChatPage";

const theme = createTheme({
  palette: {
    primary: {
      main: "#583E26",
      contrastText: "#fff",
    },
    secondary: {
      main: "#A78B71",
      contrastText: "#fff",
    },
    warning: {
      main: "#F7C815",
      contrastText: "#583E26",
    },
    info: {
      main: "#EC9704",
      contrastText: "#fff",
    },
    error: {
      main: "#9C4A1A",
      contrastText: "#fff",
    },
    background: {
      default: "#F7F4EF",
      paper: "rgba(255,255,255,0.85)",
    },
    text: {
      primary: "#583E26",
      secondary: "#A78B71",
    },
  },
  typography: {
    fontFamily: "'Montserrat', 'Roboto', sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, letterSpacing: 1 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1.5px solid #A78B71",
          boxShadow: "0 2px 12px rgba(88,62,38,0.07)",
          background: "rgba(255,255,255,0.85)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: "rgba(255,255,255,0.85)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1.5px solid #A78B71",
        },
        head: {
          background: "#F7C815",
          color: "#583E26",
          fontWeight: 700,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: "rgba(88,62,38,0.92)",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          background: "rgba(255,255,255,0.92)",
        },
      },
    },
  },
});

export function AppSnackbar({ open, onClose, severity = "info", message, autoHideDuration = 2500 }) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        sx={{
          width: "100%",
          background: severity === "success"
            ? "#F7C815"
            : severity === "warning"
            ? "#EC9704"
            : severity === "error"
            ? "#9C4A1A"
            : "#F7C815",
          color: "#583E26",
          fontWeight: 600,
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GradientBackground />
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<Profilepage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/read/:bookId" element={<ReadPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/librarian" element={<LibrarianPanel />} />
          <Route path="/book/:bookId" element={<BookPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
