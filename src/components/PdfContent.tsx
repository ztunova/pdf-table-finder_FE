import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { Box } from '@mui/material';
import { useState } from 'react';
import { Document, pdfjs } from 'react-pdf';
import { PdfSinglePage } from './PdfSinglePage';
import { usePdf } from '../custom-context/PdfContext';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function PdfContent() {
  const { pdfUrl } = usePdf();
  const [numPages, setNumPages] = useState<number>();
  const [pages, setPages] = useState<number[]>([]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setPages([...Array(numPages).keys()]);
  }

  return (
    <Box 
      component="div" 
      sx={{ 
        overflow: 'auto',
        width: '100%',
        height: 800,
        borderRadius: 1,
        bgcolor: '#007FFF',
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <Document 
        file={pdfUrl} 
        onLoadSuccess={onDocumentLoadSuccess}
        // options={{ worker: pdfjs.GlobalWorkerOptions.workerSrc }}
      >
        {pages.map((val) => (
          <PdfSinglePage 
            pageNumber={val+1} 
            key={val} 
          />
        ))}
      </Document>
    </Box>
  );
}