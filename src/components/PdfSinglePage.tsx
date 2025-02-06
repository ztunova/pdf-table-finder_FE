import { Page } from "react-pdf";
import { DrawingCanvas } from "./DrawingCanvas";
import { useRef, useState } from "react";

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
        <div ref={containerRef} style={{ position: 'relative' }}>
          <Page 
            pageNumber={pageNumber} 
            onLoadSuccess={onPageLoad}
            width={700}
            noData={""}
          />
          {pageSize.width > 0 && (
            <DrawingCanvas
              width={pageSize.width}
              height={pageSize.height}
    
            />
          )}
        </div>
    );
}