import { createContext, ReactNode, useContext, useState } from "react";
import { TableBoundingBox, TableData, TableDetectionResponse } from "../shared-types";
import { v4 as uuidv4 } from 'uuid';

type TableDataMap = {
  [rectangleId: string]: TableData;
};

type PageTablesMap = {
  [pageNumber: number]: string[];
}

interface TableDataContextType {
    tableData: TableDataMap | null;
    tablesPerPage: PageTablesMap;
    setTableData: (data: TableDetectionResponse | null) => void;
    getTablesForPage: (pageNumber: number) => TableData[];
    addTableRecord: (pageNumber: number, tableCoordinates: TableBoundingBox) => string;
    deleteTableRecord: (rectangleId: string) => void;
    updateTableCoordinates: (rectangleId: string, newCoordinates: TableBoundingBox) => void;
}

const TableDataContext = createContext<TableDataContextType | undefined>(undefined);

export const TableDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tableData, setTableDataState] = useState<TableDataMap | null>(null);
    const [tablesPerPage, setTablesPerPage] = useState<PageTablesMap>({});

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
              console.log("XX", table)
                const rectId: string = uuidv4() 
                const tableRecord: TableData = {
                  id: rectId,
                  title: `Page ${pageNumber}, Table ${index}:`,
                  coordinates: table,
                }
                newTableDataMap[rectId] = tableRecord
                newTablesPerPage[pageNumber].push(rectId);
            });
        });

        setTableDataState(newTableDataMap);
        setTablesPerPage(newTablesPerPage);
      }
    };

    const getTablesForPage = (pageNumber: number): TableData[] => {
      const tableIdsForPage: string[] = tablesPerPage[pageNumber-1] || []
      // console.log("table ids for page", tableIdsForPage)
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
      pageNumber = pageNumber -1
      const rectId: string = uuidv4()
      const tableRecord: TableData = {
        id: rectId,
        title: "some title",
        coordinates: tableCoordinates,
      }

      // Update tableData state with the new record
      setTableDataState(prevTableData => {
        return {
          ...(prevTableData || {}),
          [rectId]: tableRecord
        };
      });

      // Update tablesPerPage state to include this table for the specified page
      setTablesPerPage(prevTablesPerPage => {
        const updatedTablesPerPage = { ...prevTablesPerPage };
        if (!updatedTablesPerPage[pageNumber]) {
          updatedTablesPerPage[pageNumber] = [];
        }
        updatedTablesPerPage[pageNumber].push(rectId);
        return updatedTablesPerPage;
      });

      return rectId;
    }

    const deleteTableRecord = (rectangleId: string): void => {
      setTableDataState(prevTableData => {
        console.log('id', rectangleId);
        console.log("Current tableData state:", prevTableData);
        
        if (!prevTableData) {
          return null;
        }
        
        // Create new object without the specified record
        const updatedTableData = { ...prevTableData };
        delete updatedTableData[rectangleId];
        console.log('updated tableData', updatedTableData);
        
        return updatedTableData;
      });

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
        
        console.log('updated tablesPerPage', updatedTablesPerPage);
        return updatedTablesPerPage;
      });
    }

    // trigger re-render when coordinates change
    const updateTableCoordinates = (rectangleId: string, newCoordinates: TableBoundingBox): void => {
      setTableDataState(prevTableData => {
        if (!prevTableData || !prevTableData[rectangleId]) {
          console.log(`Table record with ID ${rectangleId} not found`);
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
  
    return (
      <TableDataContext.Provider
        value={{
          tableData,
          tablesPerPage,
          setTableData,
          getTablesForPage,
          addTableRecord,
          deleteTableRecord,
          updateTableCoordinates,
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

