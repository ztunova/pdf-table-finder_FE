import { Rect } from "fabric";
import { createContext, ReactNode, useContext, useRef } from "react";
import RectWithData from "../shared-types";

export interface TabsRef {
    addTab: (tabData: any) => void;
    updateTabContent: (tabId: string, content: React.ReactNode, apiResponse?: any) => void;
    findTabByRectangleId: (rectangleId: string) => any;
    removeTab: (tabId: string) => void;
}

interface RectangleTableMappingData {
    object: Rect;
    apiResponse?: any;
    tabId?: string;
}

interface RectangleTableMappingContextType {
  tabsRef: React.RefObject<TabsRef>;
  storeRectangle: (rectangleId: string, rect: RectWithData) => void;     // Store a rectangle in the mapping
  setApiResponse: (rectangleId: string, apiResponse: any) => void;      // Associate an API response with a rectangle
  // Associate a tab with a rectangle
  setTabForRectangle: (rectangleId: string, tabId: string) => void;
  
  // Methods that directly use tabsRef, so components don't need direct access to tabsRef
  createOrUpdateTab: (rectangleId: string, content: React.ReactNode, apiResponse: any) => void;
}

const RectangleTableMappingContext = createContext<RectangleTableMappingContextType | undefined>(undefined);

export const RectangleTableMappingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const tabsRef = useRef<TabsRef>(null);
    const rectangleMap = useRef<Map<string, RectangleTableMappingData>>(new Map());
    const tabToRectangleMap = useRef<Map<string, string>>(new Map());

    const storeRectangle = (rectangleId: string, rect: Rect) => {
        const currentData = rectangleMap.current.get(rectangleId);
        rectangleMap.current.set(rectangleId, {
            object: rect,
            apiResponse: currentData?.apiResponse,
            tabId: currentData?.tabId,
        });

        console.log("current data map: ", rectangleMap);
    }

    const setApiResponse = (rectangleId: string, apiResponse: any) => {
        const currentData = rectangleMap.current.get(rectangleId);
        console.log(rectangleId)
        console.log("cd", currentData)
        if (currentData) {
            console.log("XXX", apiResponse)
            rectangleMap.current.set(rectangleId, {
            ...currentData,
            apiResponse
            });
            // console.log("xxx", rectangleMap.current)
        }
    }

    // Associate a tab with a rectangle
    const setTabForRectangle = (rectangleId: string, tabId: string) => {
        const currentData = rectangleMap.current.get(rectangleId);
        if (currentData) {
        // Update rectangle data with tab ID
        rectangleMap.current.set(rectangleId, {
            ...currentData,
            tabId
        });
        
        // Update reverse mapping
        tabToRectangleMap.current.set(tabId, rectangleId);
        }
    };

    const createOrUpdateTab = (rectangleId: string, content: React.ReactNode, apiResponse: any) => {
        console.log("cout")
        if (!tabsRef.current) { 
            console.log("POMOC")
            return
        };
    
        // Set API response in our mapping
        setApiResponse(rectangleId, apiResponse);
        
        // Generate a tab ID (using rectangleId as tabId)
        const tabId = rectangleId;
        
        // Create or update the tab
        tabsRef.current.addTab({
          id: tabId,
          label: tabId,
          content: content,
          apiResponse: apiResponse,
          rectangleId
        });
        
        // Update our mapping to associate the rectangle with the tab
        setTabForRectangle(rectangleId, tabId);
    };

    const value: RectangleTableMappingContextType = {
        tabsRef,
        storeRectangle,
        setApiResponse,
        setTabForRectangle,
        createOrUpdateTab,
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