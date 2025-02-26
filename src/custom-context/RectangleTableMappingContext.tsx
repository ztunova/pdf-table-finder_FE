import { Rect } from "fabric";
import { createContext, ReactNode, useContext, useRef } from "react";
import RectWithData from "../shared-types";

interface RectangleTableMappingData {
    object: Rect;
    apiResponse?: any;
    tabId?: string;
}

interface RectangleTableMappingContextType {
      // Store a rectangle in the mapping
  storeRectangle: (rectangleId: string, rect: RectWithData) => void;
}

const RectangleTableMappingContext = createContext<RectangleTableMappingContextType | undefined>(undefined);

export const RectangleTableMappingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const rectMap = useRef<Map<string, RectangleTableMappingData>>(new Map());
    const tableToRectMap = useRef<Map<string, string>>(new Map());

    const storeRectangle = (rectangleId: string, rect: Rect) => {
        const currentData = rectMap.current.get(rectangleId);
        rectMap.current.set(rectangleId, {
            object: rect,
            apiResponse: currentData?.apiResponse,
            tabId: currentData?.tabId,
        });

        console.log("current data map: ", rectMap);
    }

    const value: RectangleTableMappingContextType = {
        storeRectangle,
    };

    return (
        <RectangleTableMappingContext.Provider value={value}>
          {children}
        </RectangleTableMappingContext.Provider>
    );
}

export const useRectangleMapping = (): RectangleTableMappingContextType => {
    const context = useContext(RectangleTableMappingContext);
    if (context === undefined) {
      throw new Error('useRectangleMapping must be used within a RectangleMappingProvider');
    }
    return context;
};