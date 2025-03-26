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


  // New custom function added
const mergeSelectedCellsText = () => {
    const hotInstance = hotTableRef.current?.hotInstance;
    if (!hotInstance) return;
    
    const selectedRange = hotInstance.getSelectedRange();
    if (!selectedRange || !selectedRange.length) return;
    
    // Get the selected range coordinates
    const range = selectedRange[0];
    const startRow = Math.min(range.from.row, range.to.row);
    const endRow = Math.max(range.from.row, range.to.row);
    const startCol = Math.min(range.from.col, range.to.col);
    const endCol = Math.max(range.from.col, range.to.col);
    
    // Collect all non-empty text content from selected cells
    const textParts: string[] = [];
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const cellValue = hotInstance.getDataAtCell(row, col);
        if (cellValue && cellValue.toString().trim() !== '') {
          textParts.push(cellValue.toString());
        }
      }
    }
    
    // Combine the collected text with space separation
    const mergedText = textParts.join(' ');
    
    // Place the merged text in the top-left cell of the selection
    hotInstance.setDataAtCell(startRow, startCol, mergedText);
    
    // Clear all other cells in the selection
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        if (row !== startRow || col !== startCol) {
          hotInstance.setDataAtCell(row, col, '');
        }
      }
    }
    
    // Update the table data
    handleTableUpdate();
  };

  const contextMenuOptions = {
    items: {
      mergeText: {
        name: 'Merge Text',
        callback: mergeSelectedCellsText
      },
      separatorCustom: { name: '---------' },
      row_above: {}, 
      row_below: {},
      col_left: {},
      col_right: {},
      separatorInsert: { name: '---------' },
      remove_row: {},
      remove_col: {},
      separatorRemove: { name: '---------' },
      undo: {},
      redo: {},
      cut: {},
      copy: {},
      separatorTools: { name: '---------' },
      alignment: {}
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
        contextMenu={contextMenuOptions}
        // mergeCells={true}
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