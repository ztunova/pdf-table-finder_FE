import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

interface PdfContext {
    pdfUrl: string | null;
    pdfName: string | null;
    setPdfData: (url: string | null, name: string | null) => string;
    getPdfNameWithId: () => string | null;
}

const PdfContext = createContext<PdfContext | undefined>(undefined);

export const PdfProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [pdfUrl, setInternalPdfUrl] = useState<string | null>(null);
    const [pdfName, setInternalPdfName] = useState<string | null>(null);
    const [pdfId, setInternalPdfId] = useState<string | null>(null);

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

    const setPdfData = (newUrl: string | null, newName: string | null): string => {
        setPdfUrl(newUrl);
        setPdfName(newName);
        const id: string = uuidv4();
        setInternalPdfId(id);
        return id;
    }

    const getPdfNameWithId = () : string | null => {
        if (!pdfName) {
            console.log("!pdfname")
            return "exported_tables"
        };

        const pdfNameWithoutSuffix: string = pdfName.toLowerCase().endsWith('.pdf') 
        ? pdfName.slice(0, -4) 
        : pdfName;

        const pdfNameWithId: string = `${pdfNameWithoutSuffix}__${pdfId}.pdf`;
        console.log("pdf name with id: ", pdfNameWithId)
        return pdfNameWithId;
    }

    return (
        <PdfContext.Provider value={{
            pdfUrl, 
            pdfName,
            setPdfData,
            getPdfNameWithId,
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