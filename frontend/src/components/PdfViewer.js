import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import Box from "@mui/material/Box";

function PdfViewer({ pdfUrl }) {
  return (
    <Box
      sx={{
        height: { xs: 400, sm: 600, md: 800 },
        border: '1.5px solid #e0e7ff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: "0 2px 12px rgba(99,102,241,0.08)",
        width: "100%",
        maxWidth: "100vw",
      }}
    >
      <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
        <Viewer fileUrl={pdfUrl} />
      </Worker>
    </Box>
  );
}

export default PdfViewer;
