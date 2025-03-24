import { Box, Button, ButtonGroup, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Tooltip } from "@mui/material";
import { useDrawing } from "../custom-context/DrawingContext";
import { useState } from "react";
import axios from "axios";
import { useTableData } from "../custom-context/TableContext";
import { TableDetectionResponse } from "../shared-types";
import LockIcon from '@mui/icons-material/Lock';
import CreateIcon from '@mui/icons-material/Create';

enum TableDetectionMethods {
    PYMU = 'pymu',
    YOLO = 'yolo',
}

export const PdfToolbar: React.FC = () => {
    const {isDrawingEnabled, setIsDrawingEnabled} = useDrawing();
    const [tableDetectionMethod, setTableDetectionMethod] = useState<TableDetectionMethods>(TableDetectionMethods.PYMU);
    const tableDataContext = useTableData();

    const menuItems = [
        { value: TableDetectionMethods.PYMU, label: 'pymu label' },
        { value: TableDetectionMethods.YOLO, label: 'yolo label' },
    ];
    
    const handleTableDetectionChange = (event: SelectChangeEvent) => {
        const selectedMethod = event.target.value as TableDetectionMethods
        setTableDetectionMethod(selectedMethod);
    };

    const handleLockToggle = () => {
        console.log("Lock/Unlock functionality toggled");
        // Add your lock functionality here
    };

    const handleDrawingToggle = () => {
        setIsDrawingEnabled(prev => !prev);
    };

    async function handleDetectTablesButtonClick() {
        console.log("table detection method", tableDetectionMethod)
        try {
            const response = axios.get(`http://127.0.0.1:8000/pdf/all_tables/${tableDetectionMethod}`);
            const allTables: TableDetectionResponse = {
                allRectangles: (await response).data.tables
            }
            tableDataContext.setTableData(allTables)
            console.log("All tables from context: ", tableDataContext.tableData)
        }
        catch (error) {
            console.error('Error processing tables:', error);
            throw error;
        }
    }

    return (
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid #e0e0e0'
          }}
        >
            <div>
                <ButtonGroup size="large" aria-label="drawing control button group">
                    <Tooltip title="Lock/Unlock PDF">
                        <Button 
                            onClick={handleLockToggle}
                            color={isDrawingEnabled ? "primary" : "inherit"}
                        >
                            <LockIcon fontSize="small" />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Enable/Disable Drawing Mode">
                        <Button 
                            onClick={handleDrawingToggle}
                            color={isDrawingEnabled ? "primary" : "inherit"}
                            variant={isDrawingEnabled ? "contained" : "outlined"}
                        >
                            <CreateIcon fontSize="small" />
                        </Button>
                    </Tooltip>
                </ButtonGroup>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <FormControl variant="standard" sx={{ width: 'auto' }}>
                    <InputLabel id="table-detection-method-select-label">Table Detection Method</InputLabel>
                    <Select
                        labelId="table-detection-method-select-label"
                        id="table-detection-method-select"
                        value={tableDetectionMethod}
                        onChange={handleTableDetectionChange}
                        label="Table Detection Method"
                        size="medium"
                        sx={{ minWidth: '12ch' }}
                    >
                    {menuItems.map((item) => (
                        <MenuItem key={item.value} value={item.value}>
                            {item.label}
                        </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                
                <Tooltip title="Detect tables in the document">
                    <Button 
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleDetectTablesButtonClick}
                    >
                        Detect Tables
                    </Button>
                </Tooltip>
            </div>
        </Box>
    );
}