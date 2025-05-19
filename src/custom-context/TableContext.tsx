import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { TableBoundingBox, TableData, TableDetectionResponse } from "../shared-types";
import { v4 as uuidv4 } from 'uuid';
import { usePdf } from "./PdfContext";

// PDF PAGE NUMBER IS COUNTED FROM 0 HERE BUT FROM 1 IN DOCUMENT!!!

type TableDataMap = {
  [rectangleId: string]: TableData;
};

type PageTablesMap = {
  [pageNumber: number]: string[];
}

interface TableDataContextType {
    tableData: TableDataMap | null;
    tablesPerPage: PageTablesMap;
    selectedRectangleId: string | null;
    extractedTables: string[];
    setTableData: (data: TableDetectionResponse | null) => void;
    getTablesForPage: (pageNumber: number) => TableData[];
    addTableRecord: (pageNumber: number, tableCoordinates: TableBoundingBox) => string;
    deleteTableRecord: (rectangleId: string) => void;
    updateTableCoordinates: (rectangleId: string, newCoordinates: TableBoundingBox) => void;
    setSelectedRectangle: (rectangleId: string | null) => void;
    getTableDataById: (rectangleId: string) => TableData | null;
    updateExtractedData: (rectangleId: string, data: string[][] | null) => void;
    getExtractedTableData: () => TableDataMap;
    setChatGptPrompt: (rectangleId: string, prompt: string | null) => void;
    setUseCustomPrompt: (rectangleId: string, usePrompt: boolean) => void;
}

const TableDataContext = createContext<TableDataContextType | undefined>(undefined);

export const TableDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { pdfUrl } = usePdf();
    const [tableData, setTableDataState] = useState<TableDataMap | null>(null);
    const [tablesPerPage, setTablesPerPage] = useState<PageTablesMap>({});
    const [selectedRectangleId, setSelectedRectangleIdState] = useState<string | null>(null);
    const [extractedTables, setExtractedTablesState] = useState<string[]>([]);

    // Reset table data when PDF URL changes
    useEffect(() => {
        resetAllTableData();
      }, [pdfUrl]);

    useEffect(() => {
      updateExtractedTableIds();
    }, [tableData]);

    const setTableData = (data: TableDetectionResponse | null) => {
      if (data && data.allRectangles) {
        const newTableDataMap: TableDataMap = {};
        const newTablesPerPage: PageTablesMap = {}

        Object.entries(data.allRectangles).forEach(([pageNumberStr, tables]) => {
            const pageNumber = parseInt(pageNumberStr, 10);
            if (!newTablesPerPage[pageNumber]) {
              newTablesPerPage[pageNumber] = [];
            }
            
            tables.forEach((table, index) => {
                const rectId: string = uuidv4() 
                const tableRecord: TableData = {
                  id: rectId,
                  title: `Page ${pageNumber + 1} Table ${index + 1}`,
                  pdfPageNumber: pageNumber,
                  coordinates: table,
                  extractedData: null,
                  chatgptPrompt: null,
                  useCustomPrompt: false
                }
                newTableDataMap[rectId] = tableRecord
                newTablesPerPage[pageNumber].push(rectId);
            });
        });

        setTableDataState(newTableDataMap);
        setTablesPerPage(newTablesPerPage);

        // Reset extractedTables to empty since we're loading new data
        setExtractedTablesState([]);
      }
    };

    const getTablesForPage = (pageNumber: number): TableData[] => {
      const tableIdsForPage: string[] = tablesPerPage[pageNumber-1] || []
      const rectDataForPage: TableData[] = []
      if (tableData) {
        for (const rectId of tableIdsForPage) {
          if (tableData[rectId]) {
            rectDataForPage.push(tableData[rectId])
          }
        }
      }

      return [...new Set(rectDataForPage)];
    };

    const addTableRecord = (pageNumber: number, tableCoordinates: TableBoundingBox): string => {
      const zeroBasedPageNumber = pageNumber - 1;
      const rectId: string = uuidv4();
      const tableCount = (tablesPerPage[zeroBasedPageNumber] || []).length;

      const tableRecord: TableData = {
        id: rectId,
        title: `Page ${pageNumber} Table ${tableCount + 1}`,
        pdfPageNumber: zeroBasedPageNumber,
        coordinates: tableCoordinates,
        extractedData: null,
        chatgptPrompt: null,
        useCustomPrompt: false
      };
    
      // Update tableData state with the new record
      setTableDataState(prevTableData => {
        return {
          ...(prevTableData || {}),
          [rectId]: tableRecord
        };
      });
    
      // Update tablesPerPage state to include table for the specified page
      setTablesPerPage(prevTablesPerPage => {
        const updatedTablesPerPage = { ...prevTablesPerPage };
        if (!updatedTablesPerPage[zeroBasedPageNumber]) {
          updatedTablesPerPage[zeroBasedPageNumber] = [];
        }
        updatedTablesPerPage[zeroBasedPageNumber].push(rectId);
        return updatedTablesPerPage;
      });
    
      return rectId;
    }

    const deleteTableRecord = (rectangleId: string): void => {
      if (!rectangleId) {
        return;
      }

      // If there's no tableData, nothing to delete
      if (!tableData) {
        return;
      }

      // Check if the record exists
      if (!tableData[rectangleId]) {
        return;
      }

      // If this is the currently selected rectangle, deselect it
      if (selectedRectangleId === rectangleId) {
        setSelectedRectangleIdState(null);
      }

      // Check if the rectangle is in extractedTables list and remove it
      if (extractedTables.includes(rectangleId)) {
        setExtractedTablesState(prevExtractedTables => 
          prevExtractedTables.filter(id => id !== rectangleId)
        );
      }

      // Remove the record from tableData
      setTableDataState(prevTableData => {
        if (!prevTableData) return null;
        
        const updatedTableData = { ...prevTableData };
        delete updatedTableData[rectangleId];

        return updatedTableData;
      });

      // Remove references to this table from tablesPerPage
      setTablesPerPage(prevTablesPerPage => {
        const updatedTablesPerPage = { ...prevTablesPerPage };
        
        Object.keys(updatedTablesPerPage).forEach((pageNumberStr) => {
          const pageNumber = parseInt(pageNumberStr, 10);
          const tableIds = updatedTablesPerPage[pageNumber];
          
          // Filter out the rectangleId from the array
          const filteredTableIds = tableIds.filter(id => id !== rectangleId);
          
          // Update the page with filtered IDs or delete the page entry if empty
          if (filteredTableIds.length > 0) {
            updatedTablesPerPage[pageNumber] = filteredTableIds;
          } else {
            delete updatedTablesPerPage[pageNumber];
          }
        });
        
        return updatedTablesPerPage;
      });
    };

    // trigger re-render when coordinates change
    const updateTableCoordinates = (rectangleId: string, newCoordinates: TableBoundingBox): void => {
      setTableDataState(prevTableData => {
        if (!prevTableData || !prevTableData[rectangleId]) {
          return prevTableData;
        }

        return {
          ...prevTableData,
          [rectangleId]: {
            ...prevTableData[rectangleId],
            coordinates: newCoordinates
          }
        };
      });
    };

    const setSelectedRectangle = (rectangleId: string | null): void => {
      setSelectedRectangleIdState(rectangleId);
    };

    const getTableDataById = (rectangleId: string): TableData | null => {
      if (!tableData || !rectangleId) {
        return null;
      }
      
      return tableData[rectangleId] || null;
    };

    const updateExtractedData = (rectangleId: string, data: string[][] | null): void => {
      if (!rectangleId) {
        return;
      }
      
      setTableDataState(prevTableData => {
        if (!prevTableData || !prevTableData[rectangleId]) {
          return prevTableData;
        }

        const updatedData = {
          ...prevTableData,
          [rectangleId]: {
            ...prevTableData[rectangleId],
            extractedData: data
          }
        };

        return updatedData;
      });
    };

    const updateExtractedTableIds = (): void => {
      if (!tableData) {
        setExtractedTablesState([]);
        return;
      }

      // Filter tableData records where extractedData is not null and collect their IDs
      const extractedTableIds = Object.keys(tableData).filter(id => 
        tableData[id].extractedData !== null
      );

      setExtractedTablesState(extractedTableIds);
    };

    const getExtractedTableData = (): TableDataMap => {
      if (!tableData || extractedTables.length === 0) {
        return {};
      }
      
      // Create a new object with only the entries whose keys are in extractedTables
      const extractedTableData: TableDataMap = {};
      
      extractedTables.forEach(id => {
        if (tableData[id]) {
          extractedTableData[id] = tableData[id];
        }
      });
      
      return extractedTableData;
    };

    const setChatGptPrompt = (rectangleId: string, prompt: string | null): void => {
      if (!rectangleId) {
        return;
      }
      
      setTableDataState(prevTableData => {
        if (!prevTableData || !prevTableData[rectangleId]) {
          return prevTableData;
        }

        return {
          ...prevTableData,
          [rectangleId]: {
            ...prevTableData[rectangleId],
            chatgptPrompt: prompt
          }
        };
      });
    };

    const setUseCustomPrompt = (rectangleId: string, usePrompt: boolean): void => {
      if (!rectangleId) {
        return;
      }
      
      setTableDataState(prevTableData => {
        if (!prevTableData || !prevTableData[rectangleId]) {
          return prevTableData;
        }
    
        return {
          ...prevTableData,
          [rectangleId]: {
            ...prevTableData[rectangleId],
            useCustomPrompt: usePrompt
          }
        };
      });
    };

    const resetAllTableData = () => {
      setTableDataState(null);
      setTablesPerPage({});
      setSelectedRectangleIdState(null);
      setExtractedTablesState([]);
    };
  
    return (
      <TableDataContext.Provider
        value={{
          tableData,
          tablesPerPage,
          selectedRectangleId,
          extractedTables,
          setTableData,
          getTablesForPage,
          addTableRecord,
          deleteTableRecord,
          updateTableCoordinates,
          setSelectedRectangle,
          getTableDataById,
          updateExtractedData,
          getExtractedTableData,
          setChatGptPrompt,
          setUseCustomPrompt,
        }}
      >
        {children}
      </TableDataContext.Provider>
    );
};

export const useTableData = (): TableDataContextType => {
    const context = useContext(TableDataContext);
    if (context === undefined) {
      throw new Error('useTableData must be used within a TableDataProvider');
    }
    return context;
};

