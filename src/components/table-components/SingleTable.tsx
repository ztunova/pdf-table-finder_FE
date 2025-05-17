import { HotTable, HotTableRef } from '@handsontable/react-wrapper';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import { useTableData } from '../../custom-context/TableContext';
import { useRef, useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

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
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [splitChars, setSplitChar] = useState<string>('');
  const [splitCellCoords, setSplitCellCoords] = useState<number[][]>([]);
  // const [selectedRanges, setSelectedRanges] = useState<number[][]>([]);
  
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

  const openSplitDialog = () => {
    const hotInstance = hotTableRef.current?.hotInstance;
    if (!hotInstance) return;

    const selected = hotInstance.getSelected() || [];
    if (!selected || selected.length === 0) return;

    // Store all selected cells as individual coordinates
    const cellCoords: number[][] = [];
    for (let index = 0; index < selected.length; index += 1) {
      const [row1, column1, row2, column2] = selected[index];
      const startRow = Math.max(Math.min(row1, row2), 0);
      const endRow = Math.max(row1, row2);
      const startCol = Math.max(Math.min(column1, column2), 0);
      const endCol = Math.max(column1, column2);
  
      for (let rowIndex = startRow; rowIndex <= endRow; rowIndex += 1) {
        for (let columnIndex = startCol; columnIndex <= endCol; columnIndex += 1) {
          cellCoords.push([rowIndex, columnIndex])
        }
      }
    }

    setSplitCellCoords(cellCoords);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSplitChar('');
  };

  // Debounced handler for table changes to prevent excessive updates
  const handleTableUpdate = () => {
    const hotInstance = hotTableRef.current?.hotInstance;
    if (!hotInstance) return;
    
    const currentData = hotInstance.getData();
    const currentDataString = JSON.stringify(currentData);
    
    // Only update if data has actually changed
    if (currentDataString !== previousDataRef.current) {
      previousDataRef.current = currentDataString;
      
      // Use setTimeout to break the synchronous update cycle
      setTimeout(() => {
        tablesContext.updateExtractedData(rectangleId, currentData);
      }, 0);
    }
  };

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

  const splitSingleCell = (row: number, col: number) => {
    const hotInstance = hotTableRef.current?.hotInstance;
    if (!hotInstance) return;

    const cellValue = hotInstance.getDataAtCell(row, col);
    if (!cellValue || typeof cellValue !== 'string' || cellValue.trim() === '') return;
  
    const delimitersList: string[] = Array.from(splitChars) 
    const escapedDelimiters = delimitersList.map(d => 
      d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    ).join('');
    const regex = new RegExp(`[${escapedDelimiters}]`);
    const splitValues = cellValue.split(regex).map(value => value.trim());
  
    // If no actual splitting occurs, just close the dialog and return
    if (splitValues.length <= 1) {
      closeDialog();
      return;
    }
  
    // Calculate how many new cells we need for the split values
    const cellsNeeded = splitValues.length - 1;
    
    // Check if there are enough empty cells to the right of the current cell
    let emptyCellsCount = 0;
    const totalCols = hotInstance.countCols();
    
    for (let checkCol = col + 1; checkCol < totalCols; checkCol++) {
      const cellContent = hotInstance.getDataAtCell(row, checkCol);
      if (cellContent === null || cellContent === '' || cellContent === undefined) {
        emptyCellsCount++;
      } else {
        // Stop counting as soon as we encounter a non-empty cell
        break;
      }
    }
    
    // Calculate how many new columns we need to add
    const newColumnsNeeded = Math.max(0, cellsNeeded - emptyCellsCount);
    
    // Insert new columns if needed
    if (newColumnsNeeded > 0) {
      hotInstance.alter('insert_col_end', col + emptyCellsCount, newColumnsNeeded);
    }
  
    // Place split values in the cells
    splitValues.forEach((value, index) => {
      hotInstance.setDataAtCell(row, col + index, value);
    });
  } 

  const applySplit = () => {
    if (!splitCellCoords || !splitChars) return;
  
    const hotInstance = hotTableRef.current?.hotInstance;
    if (!hotInstance) return;
  
    splitCellCoords.forEach(cell => {
      const [row, col] = cell;
      splitSingleCell(row, col)
    });

    handleTableUpdate();
    closeDialog();
  };

  const contextMenuOptions = {
    items: {
      mergeText: {
        name: 'Merge Text',
        callback: mergeSelectedCellsText
      },
      splitCell: {
        name: 'Split Cell',
        callback: openSplitDialog
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
        autoWrapRow={true}
        autoWrapCol={true}
        contextMenu={contextMenuOptions}
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
      <Dialog 
          open={isDialogOpen} 
          onClose={closeDialog}
          maxWidth="xs"
          fullWidth
      >
          <DialogTitle>Split Cell</DialogTitle>
          <DialogContent>
              <TextField
                  autoFocus
                  margin="dense"
                  label="Split Character"
                  type="text"
                  fullWidth
                  value={splitChars}
                  onChange={(e) => setSplitChar(e.target.value)}
              />
          </DialogContent>
          <DialogActions>
              <Button onClick={applySplit} variant="contained" color="primary">
                  Split
              </Button>
              <Button onClick={closeDialog} variant="outlined" color="inherit">
                  Cancel
              </Button>
          </DialogActions>
      </Dialog>
    </div>
  );
}

export default SingleTable;