import { Rect } from "fabric";
import { createContext, ReactNode, useContext, useRef } from "react";
import RectWithData from "../shared-types";

export interface TabsRef {
    addTab: (tabData: any) => void;
    updateTabContent: (tabId: string, content: React.ReactNode, apiResponse?: any) => void;
    findTabByRectangleId: (rectangleId: string) => any;
    removeTab: (tabId: string) => void;
}

interface RectangleData {
    object: Rect;
    apiResponse?: any;
    tabId?: string;
}

interface RectangleTableMappingContextType {
  tabsRef: React.RefObject<TabsRef>;
  storeRectangle: (rectangleId: string, rect: RectWithData) => void;     // Store a rectangle in the mapping
  setApiResponse: (rectangleId: string, apiResponse: any) => void;      // Associate an API response with a rectangle
  setTabForRectangle: (rectangleId: string, tabId: string) => void;     // Associate a tab with a rectangle
  getRectangleData: (rectangleId: string) => RectangleData | undefined;
  getTabIdForRectangle: (rectangleId: string) => string | undefined;
  getRectangleIdForTab: (tabId: string) => string | undefined;
  getAllRectanglesWithApiResponse: () => Map<string, RectangleData>;
  removeRectangle: (rectangleId: string) => void;
  getApiResponseForRectangle: (rectangleId: string) => any;
  
  createTab: (rectangleId: string, content: React.ReactNode, apiResponse: any) => void;
  updateTab: (rectangleId: string, content: React.ReactNode, apiResponse: any) => void;
  removeTabForRectangle: (rectangleId: string) => void;
}

const RectangleTableMappingContext = createContext<RectangleTableMappingContextType | undefined>(undefined);

export const RectangleTableMappingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const tabsRef = useRef<TabsRef>(null);
    const rectangleMap = useRef<Map<string, RectangleData>>(new Map());
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
        if (currentData) {
            rectangleMap.current.set(rectangleId, {
            ...currentData,
            apiResponse
            });
        }
        else {
            // Create a new entry if it doesn't exist
            rectangleMap.current.set(rectangleId, {
              object: {} as RectWithData, // This is a placeholder
              apiResponse
            });
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
        else {
            // Create a new entry if it doesn't exist
            rectangleMap.current.set(rectangleId, {
              object: {} as RectWithData,
              tabId
            });
            tabToRectangleMap.current.set(tabId, rectangleId);
          }
    };

    const getRectangleData = (rectangleId: string) => {
        return rectangleMap.current.get(rectangleId);
    }

    const getTabIdForRectangle = (rectangleId: string) => {
        return rectangleMap.current.get(rectangleId)?.tabId;
    };

    const getRectangleIdForTab = (tabId: string) => {
        return tabToRectangleMap.current.get(tabId);
    };

    const getAllRectanglesWithApiResponse = () => {
        const result = new Map<string, RectangleData>;
        rectangleMap.current.forEach((data, id) => {
            if (data.apiResponse) {
              result.set(id, data);
            }
          });
          return result;
    };

    const removeRectangle = (rectangleId: string) => {
        const rectData = rectangleMap.current.get(rectangleId);
        if (rectData?.tabId) {
          tabToRectangleMap.current.delete(rectData.tabId);
        }
        rectangleMap.current.delete(rectangleId);
    };

    const getApiResponseForRectangle = (rectangleId: string) => {
        return rectangleMap.current.get(rectangleId)?.apiResponse;
    };

    const createTab = (rectangleId: string, content: React.ReactNode, apiResponse: any) => {
        if (!tabsRef.current) { 
            console.log("POMOC")
            return
        };
    
        // Set API response in our mapping
        setApiResponse(rectangleId, apiResponse);
        
        // Generate a tab ID (using rectangleId as tabId)
        const tabId = rectangleId;

        if (!getTabIdForRectangle(rectangleId)) {
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
            console.log("XXX", rectangleMap)
        }
    };

    const updateTab = (rectangleId: string, content: React.ReactNode, apiResponse: any) => {
        if (!tabsRef.current) {
            return;
        };

        setApiResponse(rectangleId, apiResponse);
        const tabId = getTabIdForRectangle(rectangleId);
        
        // update tab contentent if it exist, otherwise create new tab
        if (tabId) {
            tabsRef.current.updateTabContent(tabId, content, apiResponse);
        }
        else {
            createTab(rectangleId, content, apiResponse);
        }
    }

    // Remove a tab associated with a rectangle
    const removeTabForRectangle = (rectangleId: string) => {
        if (!tabsRef.current) {
            return
        };
    
        const tabId = getTabIdForRectangle(rectangleId);
        if (tabId) {
          tabsRef.current.removeTab(tabId);
        }
    };

    const value: RectangleTableMappingContextType = {
        tabsRef,
        storeRectangle,
        setApiResponse,
        setTabForRectangle,
        getRectangleData,
        getTabIdForRectangle,
        getRectangleIdForTab,
        getAllRectanglesWithApiResponse,
        removeRectangle,
        getApiResponseForRectangle,
        createTab,
        updateTab,
        removeTabForRectangle,
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