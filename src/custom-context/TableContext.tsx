import { createContext, ReactNode, useContext, useState } from "react";
import { TableBoundingBoxResponse, TableDetectionResponse } from "../shared-types";

interface TableDataContextType {
    tableData: TableDetectionResponse | null;
    setTableData: (data: TableDetectionResponse | null) => void;
    getTablesForPage: (pageNumber: number) => TableBoundingBoxResponse[];
}

const TableDataContext = createContext<TableDataContextType | undefined>(undefined);

export const TableDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tableData, setTableData] = useState<TableDetectionResponse | null>(null);

    const getTablesForPage = (pageNumber: number): TableBoundingBoxResponse[] => {
        console.log("table data", tableData)
        console.log("all rects ", tableData?.allRectangles)
        if (!tableData || !tableData.allRectangles) {
            console.log("no table data")
            return [];
        }
        return tableData.allRectangles[pageNumber-1] || [];
    };
  
    return (
      <TableDataContext.Provider
        value={{
          tableData,
          setTableData,
          getTablesForPage,
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

