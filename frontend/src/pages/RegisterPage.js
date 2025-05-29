import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import { AppSnackbar } from "../App";
import RegisterForm from "../components/RegisterForm";

function RegisterPage() {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 0,
        px: { xs: 1, sm: 2 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 3,
        }}
      >
        <img
          src="/logo.png"
          alt="Логотип"
          style={{
            height: 90,
            width: 90,
            borderRadius: 24,
            background: "rgba(255,255,255,0.55)",
            boxShadow: "0 4px 24px 0 rgba(88,62,38,0.13)",
            objectFit: "contain",
            backdropFilter: "blur(2px)",
            transition: "box-shadow 0.3s, background 0.3s",
            border: "2.5px solid rgba(167,139,113,0.25)",
            opacity: 0.92,
            animation: "fadeInLogo 1s",
          }}
        />
      </Box>
      <RegisterForm
        setSnackbarMsg={setSnackbarMsg}
        setSnackbarSeverity={setSnackbarSeverity}
        setSnackbarOpen={setSnackbarOpen}
      />
      <AppSnackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        severity={snackbarSeverity}
        message={snackbarMsg}
        autoHideDuration={2500}
      />
    </Box>
  );
}

export default RegisterPage;
