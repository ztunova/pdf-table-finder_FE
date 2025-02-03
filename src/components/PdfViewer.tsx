import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { Box, Button, Paper, styled } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';


pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function PdfViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    var context = canvasRef.current.getContext('2d');
    var { width, height } = canvasRef.current;

    if (context !== null) {
      console.log("here?");
      context.save();

      context.translate(width / 2, height / 2);
      context.globalCompositeOperation = 'multiply';
      context.textAlign = 'center';
      context.font = '100px sans-serif';
      context.fillStyle = 'rgba(0, 0, 0, .25)';
      context.fillText('Acme Inc', 0, 0);
      context.clearRect(40, 40, 50, 50);

      context.restore();
    }
  }, []);

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
            <Page pageNumber={val} key={val} noData={""} canvasRef={canvasRef}/>
          ))
        }
        {/* <Page pageNumber={pageNumber} />
        <Page pageNumber={pageNumber+1} /> */}
      </Document>
    </Box>
    <Button onClick={decpage}>Dec</Button>
    <Button onClick={incpage}>Inc</Button>
    </div>
  );
}
