import { HotTable, HotTableRef } from '@handsontable/react-wrapper';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import { useTableData } from '../../custom-context/TableContext';
import { useRef, useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

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
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [splitChar, setSplitChar] = useState<string>('');
  const [splitCellCoords, setSplitCellCoords] = useState<[number, number] | null>(null);
  
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

    const selected = hotInstance.getSelected();
    if (!selected || selected.length === 0) return;

    const [row, col] = selected[0];

    setSplitCellCoords([row, col]);
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


  function categorizePositions(positions: [number, number, number, number][]): string {
    const allSameRow = positions.every(pos => pos[0] === positions[0][0]);
    const allSameColumn = positions.every(pos => pos[1] === positions[0][1]);
    
    if (allSameRow) { 
      return PositionCategory.SAME_ROW
    };
    if (allSameColumn) {
       return PositionCategory.SAME_COLUMN
    };

    return PositionCategory.MIXED
  }

  const applySplit = () => {
    if (!splitCellCoords || !splitChar) return;

    const hotInstance = hotTableRef.current?.hotInstance;
    if (!hotInstance) return;

    const [row, col] = splitCellCoords;
    const cellValue = hotInstance.getDataAtCell(row, col);
    if (!cellValue || typeof cellValue !== 'string' || cellValue.trim() === '') return;

    const splitValues = cellValue.split(splitChar).map(value => value.trim());

    if (splitValues.length === 1) {
        closeDialog();
        return;
    }

    const totalCols = hotInstance.countCols();
    const requiredCols = col + splitValues.length;
    if (requiredCols > totalCols) {
      hotInstance.alter('insert_col_end', totalCols, requiredCols - totalCols);
    }

    // Shift existing data only if there is something to shift
    const maxShift = splitValues.length - 1;
    for (let shiftCol = totalCols - 1; shiftCol >= col + maxShift; shiftCol--) {
        const shiftValue = hotInstance.getDataAtCell(row, shiftCol - maxShift);
        if (shiftValue !== null && shiftValue !== undefined) {
            hotInstance.setDataAtCell(row, shiftCol, shiftValue);
            hotInstance.setDataAtCell(row, shiftCol - maxShift, ''); // Clear old position
        }
    }

    // Insert split values into the row
    splitValues.forEach((value, index) => {
        hotInstance.setDataAtCell(row, col + index, value);
    });

    // Update table state
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
                  value={splitChar}
                  onChange={(e) => setSplitChar(e.target.value)}
                  slotProps={{ htmlInput: { maxLength: 1 } }}
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