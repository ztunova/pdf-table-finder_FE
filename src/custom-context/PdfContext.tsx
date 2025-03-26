import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface PdfContext {
    pdfUrl: string | null;
    pdfName: string | null;
    setPdfUrl: (url: string | null) => void;
    setPdfName: (name: string | null) => void;
    setPdfData: (url: string | null, name: string | null) => void;
}

const PdfContext = createContext<PdfContext | undefined>(undefined);

export const PdfProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [pdfUrl, setInternalPdfUrl] = useState<string | null>(null);
    const [pdfName, setInternalPdfName] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        }
    }, [pdfUrl])

    const setPdfUrl = (newUrl: string | null) => {
        // if there is an existing URL, revoke it
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
        }
        setInternalPdfUrl(newUrl);
    }

    const setPdfName = (newName: string | null) => {
        setInternalPdfName(newName);
    }

    // Convenience method to set both URL and name at once
    const setPdfData = (newUrl: string | null, newName: string | null) => {
        setPdfUrl(newUrl);
        setPdfName(newName);
    }

    return (
        <PdfContext.Provider value={{
            pdfUrl, 
            pdfName,
            setPdfUrl,
            setPdfName,
            setPdfData,
            }}>
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