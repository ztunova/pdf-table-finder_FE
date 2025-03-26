import { HotTable, HotTableRef } from '@handsontable/react-wrapper';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import { useTableData } from '../../custom-context/TableContext';
import { useRef, useEffect } from 'react';

// register Handsontable's modules
registerAllModules();

enum PositionCategory {
  SAME_ROW = "Same Row",
  SAME_COLUMN = "Same Column",
  MIXED = "Mixed Positions",
}

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

  if (!isActive) { 
    return null
  };

  // Debounced handler for table changes to prevent excessive updates
  const handleTableUpdate = () => {
    const hotInstance = hotTableRef.current?.hotInstance;
    if (!hotInstance) return;
    
    const currentData = hotInstance.getData();
    const currentDataString = JSON.stringify(currentData);
    
    // Only update if data has actually changed
    if (currentDataString !== previousDataRef.current) {
      // console.log("DATA CHANGED", tablesContext.getTableDataById(rectangleId))
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


  function categorizePositions(positions: [number, number, number, number][]): string {
    const allSameRow = positions.every(pos => pos[0] === positions[0][0]);
    const allSameColumn = positions.every(pos => pos[1] === positions[0][1]);
    
    if (allSameRow) { 
      return PositionCategory.SAME_ROW
    };
    if (allSameColumn) {
       return PositionCategory.SAME_COLUMN
    };

    // Check if all are in different rows and columns
    // const uniqueRows = new Set(positions.map(pos => pos[0])).size;
    // const uniqueColumns = new Set(positions.map(pos => pos[1])).size;

    return PositionCategory.MIXED
  }


// Function to split a cell's content based on a specified character
const addColumnsRight = (col: number, numOfColsToAdd: number) => {
  console.log("COL", col)
    const hotInstance = hotTableRef.current?.hotInstance;
    if (!hotInstance) { 
      return
    };

    hotInstance.alter('insert_col_end', col, numOfColsToAdd);
    
    // Get the content of the selected cell
    // const cellContent = hotInstance.getDataAtCell(row, col);
    
    // if (!cellContent || typeof cellContent !== 'string') {
    //   // No content to split or not a string
    //   return;
    // }
    
    // // Split the content based on the character
    // const parts = cellContent.split(splitChar);
    
    // if (parts.length <= 1) {
    //   // No splits occurred
    //   alert('No splits occurred with the given character.');
    //   return;
    // }
    
    // // Insert columns to the right of the current cell before setting any data
    // if (parts.length > 1) {
    //   // Insert n-1 columns to the right of the current cell (for the remaining parts)
    //   hotInstance.alter('insert_col_end', col, parts.length - 1);
    // }
    
    // // Now place all parts in the cells
    // for (let i = 0; i < parts.length; i++) {
    //   hotInstance.setDataAtCell(row, col + i, parts[i]);
    // }
  };

  const splitCellContent = () => {
    const hotInstance = hotTableRef.current?.hotInstance;
    if (!hotInstance) return;

    // console.log(hotInstance.getSelectedRangeLast())
    
    // const selectedRange = hotInstance.getSelectedRange();
    // if (!selectedRange || !selectedRange.length) return;
    
    // Get the selected range coordinates
    // const range = selectedRange[0];
    // const startRow = Math.min(range.from.row, range.to.row);
    // const endRow = Math.max(range.from.row, range.to.row);
    // const startCol = Math.min(range.from.col, range.to.col);
    // const endCol = Math.max(range.from.col, range.to.col);

    // console.log("range", hotInstance.getSelected(), selectedRange.length)
    // console.log("start row",startRow)
    // console.log("end row", endRow)
    // console.log("start col", startCol)
    // console.log("end col", endCol)
  
    // // Calculate dimensions
    // const numRows = endRow - startRow + 1;
    // const numCols = endCol - startCol + 1;

    // Ask user for the character to split on
    const splitChar = prompt('Enter character to split on:', ' ');
    if (splitChar === null) {
      // User cancelled the prompt
      return;
    }

    const selectedRange = hotInstance.getSelected() || []
    console.log("selectedRange",selectedRange)
    if (!selectedRange) {
      return
    }

    const positionType = categorizePositions(selectedRange)
    if (positionType === PositionCategory.SAME_ROW) {
      console.log("SAME ROW")
      console.log(selectedRange)
      for (let i = 0; i < selectedRange.length; i += 1) {
        const cellPosition = selectedRange[i]
        console.log(cellPosition)
        const cellRow = cellPosition[0]
        const cellColumn = cellPosition[1]
        const cellContent = hotInstance.getDataAtCell(cellRow, cellColumn);
        const parts = cellContent.split(splitChar);
        if (parts.length > 1) {
          addColumnsRight(cellPosition[1], parts.length - 1)
          // // Now place all parts in the cells
          for (let j = 0; j < parts.length; j++) {
            hotInstance.setDataAtCell(cellRow, cellColumn + j, parts[j]);
          }
        }
      }
    }
    if (positionType === PositionCategory.SAME_COLUMN) {
      console.log("SAME COL")
      // const numColsToAdd = []
      // for (let i = 0; i < selectedRange.length; i += 1) {
      //   const cellPosition = selectedRange[i]
      //   const cellContent = hotInstance.getDataAtCell(cellPosition[0], cellPosition[1]);
      //   const parts = cellContent.split(splitChar);
      //   numColsToAdd.push(parts);
      // }

      // const maxColsToAdd = Math.max(...numColsToAdd)
    }
    
    // // Case 1: Single cell selected
    // if (selectedRange.length === 1) {
    //   console.log('Case: Single cell selected', { row: startRow, col: startCol });
    //   splitSingleCellContent(startCol, 1)
    // }
    // // Case 2: Multiple cells in same row
    // else if (numRows === 1 && numCols > 1) {
    //   console.log('Case: Multiple cells in same row', { row: startRow, startCol, endCol, numCols });
    //   // for (let col = startCol; col <= endCol; col++) {
    //   //   splitSingleCellContent(startRow, col, splitChar)
    //   // }
    // }
    // // Case 3: Multiple cells in same column
    // else if (numRows > 1 && numCols === 1) {
    //   console.log('Case: Multiple cells in same column', { col: startCol, startRow, endRow, numRows });
    // }
    // // Case 4: Multiple cells in different rows and columns
    // else {
    //   console.log('Case: Multiple cells in different rows and columns', { 
    //     startRow, 
    //     endRow, 
    //     startCol, 
    //     endCol, 
    //     numRows, 
    //     numCols 
    //   });
    // }

    // Update the table data
    handleTableUpdate();
  }


  const contextMenuOptions = {
    items: {
      mergeText: {
        name: 'Merge Text',
        callback: mergeSelectedCellsText
      },
      splitCell: {
        name: 'Split Cell',
        callback: splitCellContent
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