import { createContext, ReactNode, useContext, useState } from "react";

interface DrawingContextType {
    isDrawingEnabled: boolean;
    isDrawingLocked: boolean;
    setIsDrawingEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    setIsDrawingLocked: React.Dispatch<React.SetStateAction<boolean>>;
}

const DrawingContext = createContext<DrawingContextType | undefined>(undefined)

export const DrawingProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    // This state controls whether rectangle drawing is enabled or disabled and locked state
    const [isDrawingEnabled, setIsDrawingEnabled] = useState<boolean>(false);
    const [isDrawingLocked, setIsDrawingLocked] = useState<boolean>(false);


    return (
        <DrawingContext.Provider value={{
            isDrawingEnabled,
            isDrawingLocked, 
            setIsDrawingEnabled,
            setIsDrawingLocked,
            }}>
            {children}
        </DrawingContext.Provider>
    );

};

export const useDrawing = () => {
    const context = useContext(DrawingContext);
    if (context === undefined) {
        throw new Error('useDrawing must be used within a DrawingProvider');
    }
    return context;
}
