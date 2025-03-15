import { createContext, ReactNode, useContext, useState } from "react";

interface TableBoundingBoxResponse {
    upperLeftX: number;
    upperLeftY: number;
    lowerRightX: number;
    lowerRightY: number;
}

interface TableDetectionResponse {
    allRectangles: Record<number, TableBoundingBoxResponse[]>;
}

interface TableDataContextType {
    tableData: TableDetectionResponse | null;
    setTableData: (data: TableDetectionResponse | null) => void;
}

const TableDataContext = createContext<TableDataContextType | undefined>(undefined);

export const TableDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tableData, setTableData] = useState<TableDetectionResponse | null>(null);
  
    return (
      <TableDataContext.Provider
        value={{
          tableData,
          setTableData
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

