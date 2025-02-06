import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { Box, Button, Paper, styled } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PdfSinglePage } from './PdfSinglePage';


pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function PdfViewer() {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pages, setPages] = useState<number[]>([])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setPages([...Array(numPages).keys()]);
  }

  function incpage() {
    setPageNumber(pageNumber + 1);
  }

  function decpage() {
    setPageNumber(pageNumber - 1);
  }

  return (
    <div>
    <Box component="div" sx={{ 
      overflow: 'auto',
      width: 700,
      height: 800,
      borderRadius: 1,
      bgcolor: '#007FFF',
     }}>
      <Document file="2_big_borderless_together.pdf" onLoadSuccess={onDocumentLoadSuccess}>
        {
          pages.map((val) => (
            console.log(val),
            <PdfSinglePage pageNumber={val+1} key={val} />
          ))
        }
      </Document>
    </Box>
    <Button onClick={decpage}>Dec</Button>
    <Button onClick={incpage}>Inc</Button>
    </div>
  );
}
