import { createContext, ReactNode, useContext, useState } from "react";

interface DrawingContextType {
    isDrawingEnabled: boolean;
    setIsDrawingEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const DrawingContext = createContext<DrawingContextType | undefined>(undefined)

export const DrawingProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    // This state controls whether rectangle drawing is enabled or disabled
    const [isDrawingEnabled, setIsDrawingEnabled] = useState<boolean>(false);


    return (
        <DrawingContext.Provider value={{isDrawingEnabled, setIsDrawingEnabled}}>
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
