import { HotTable, HotTableRef } from '@handsontable/react-wrapper';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import { useTableData } from '../../custom-context/TableContext';
import { useRef, useEffect } from 'react';

// register Handsontable's modules
registerAllModules();


interface SingleTableProps {
    id: string;
    isActive: boolean;
    rectangleId: string;
}

const SingleTable: React.FC<SingleTableProps> = ({ id, isActive, rectangleId }) => {
  const tablesContext = useTableData();
  const tableData = tablesContext.getTableDataById(rectangleId);
  const hotTableRef = useRef<HotTableRef>(null);
  const previousDataRef = useRef<string>('');
  
  // Default data to use if no extracted data exists
  const defaultData = [
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', '']
  ];
  const displayData = tableData?.extractedData || defaultData;

  // Store a JSON string representation of the current data for comparison
  useEffect(() => {
    previousDataRef.current = JSON.stringify(displayData);
  }, [displayData]);

  if (!isActive) return null;

  // Debounced handler for table changes to prevent excessive updates
  const handleTableUpdate = () => {
    const hotInstance = hotTableRef.current?.hotInstance;
    if (!hotInstance) return;
    
    const currentData = hotInstance.getData();
    const currentDataString = JSON.stringify(currentData);
    
    // Only update if data has actually changed
    if (currentDataString !== previousDataRef.current) {
      console.log("DATA CHANGED", tablesContext.getTableDataById(rectangleId))
      previousDataRef.current = currentDataString;
      
      // Use setTimeout to break the synchronous update cycle
      setTimeout(() => {
        tablesContext.updateExtractedData(rectangleId, currentData);
      }, 0);
    }
  };

  return (
    <div className="ht-theme-main-dark-auto">
      <HotTable
        ref={hotTableRef}
        id={id}
        data={displayData}
        rowHeaders={true}
        colHeaders={true}
        height="auto"
        minCols={10}
        minRows={10}
        autoWrapRow={true}
        autoWrapCol={true}
        contextMenu={true}
        mergeCells={true}
        manualRowMove={true}
        manualColumnMove={true}
        manualColumnResize={true}
        manualRowResize={true}

        afterChange={() => handleTableUpdate()}
        afterCreateRow={handleTableUpdate}
        afterRemoveRow={handleTableUpdate}
        afterCreateCol={handleTableUpdate}
        afterRemoveCol={handleTableUpdate}

        licenseKey="non-commercial-and-evaluation" // for non-commercial use only
      />
    </div>
  );
}

export default SingleTable;