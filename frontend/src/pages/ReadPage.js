import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useUserStore } from "../store/userStore";
import PdfViewer from "../components/PdfViewer";

function ReadPage() {
  const { bookId } = useParams();
  const username = useUserStore((s) => s.username);
  const token = useUserStore((s) => s.token);

  if (!username) {
    window.location.href = "/";
    return null;
  }

  const pdfUrl = `http://localhost:8000/read/${bookId}?token=${token || ""}`;

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: "auto",
        mt: { xs: 2, sm: 4, md: 5 },
        p: { xs: 1, sm: 2 },
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />
      <Card
        elevation={3}
        sx={{
          background: "rgba(255,255,255,0.65)",
          width: "100%",
        }}
      >
        <CardContent>
          <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
            📖 Чтение книги
          </Typography>
          <PdfViewer pdfUrl={pdfUrl} />
        </CardContent>
      </Card>
    </Box>
  );
}

export default ReadPage;