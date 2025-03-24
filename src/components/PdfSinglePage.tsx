import { Page } from "react-pdf";
import { DrawingCanvas } from "./DrawingCanvas";
import { useRef, useState } from "react";
import { Box } from "@mui/material";

interface PdfSinglePageProps {
    pageNumber: number,
}

interface PageSize {
    width: number,
    height: number,
}

export const PdfSinglePage: React.FC<PdfSinglePageProps> = ({pageNumber}) => {
  const [pageSize, setPageSize] = useState<PageSize>({width:0, height: 0})
  const containerRef = useRef<HTMLDivElement>(null);

  const onPageLoad = ({width, height} : PageSize) => {
      setPageSize({width, height})
  }

  return (
    <Box ref={containerRef} sx={{ position: 'relative', maxWidth: '100%', mb: 2, boxShadow: '0 4px 8px rgba(0,0,0,0.2)', border: '1px solid #e0e0e0' }}>
      <Page 
        pageNumber={pageNumber} 
        onLoadSuccess={onPageLoad}
        width={undefined}
        scale={1}
        noData={""}
      />
      {pageSize.width > 0 && (
        <DrawingCanvas
          pdfPageNumber={pageNumber}
          canvasWidth={pageSize.width}
          canvasHeight={pageSize.height}
        />
      )}
    </Box>
  );
}