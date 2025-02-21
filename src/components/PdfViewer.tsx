import { Box } from "@mui/material";
import { DrawingProvider } from "../custom-context/DrawingContext";
import PdfContent from "./PdfContent";
import { PdfToolbar } from "./PdfToolbar";

const PdfViewer: React.FC = () => {
  return (
    <DrawingProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <PdfToolbar />
        <PdfContent />
      </Box>
    </DrawingProvider>
  );
}

export default PdfViewer;