import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface PdfContext {
    pdfUrl: string | null;
    setPdfUrl: (url: string | null) => void;
}

const PdfContext = createContext<PdfContext | undefined>(undefined);

export const PdfProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [pdfUrl, setInternalPdfUrl] = useState<string | null>(null);

    const setPdfUrl = (newUrl: string | null) => {
        // if there is an existing URL, revoke it
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
        }
        setInternalPdfUrl(newUrl);
    }

    useEffect(() => {
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        }
    }, [pdfUrl])

    return (
        <PdfContext.Provider value={{pdfUrl, setPdfUrl}}>
            {children}
        </PdfContext.Provider>
    );
};

export const usePdf = () => {
    const context = useContext(PdfContext);
    if (context === undefined) {
        throw new Error("usePdf must be used within a PdfProvider");
    }
    return context;
} 