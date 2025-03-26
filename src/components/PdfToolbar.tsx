import { Box, Button, ButtonGroup, CircularProgress, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Tooltip } from "@mui/material";
import { useDrawing } from "../custom-context/DrawingContext";
import { useState } from "react";
import axios from "axios";
import { useTableData } from "../custom-context/TableContext";
import { TableDetectionResponse } from "../shared-types";
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CreateIcon from '@mui/icons-material/Create';
import { toast } from "react-toastify";

enum TableDetectionMethods {
    PYMU = 'pymu',
    YOLO = 'yolo',
}

export const PdfToolbar: React.FC = () => {
    const drawingContext = useDrawing();
    const [tableDetectionMethod, setTableDetectionMethod] = useState<TableDetectionMethods>(TableDetectionMethods.PYMU);
    const tableDataContext = useTableData();
    const [loading, setLoading] = useState(false);

    const menuItems = [
        { value: TableDetectionMethods.PYMU, label: 'Detect in PDF content' },
        { value: TableDetectionMethods.YOLO, label: 'Detect with Image processing' },
    ];
    
    const handleTableDetectionChange = (event: SelectChangeEvent) => {
        const selectedMethod = event.target.value as TableDetectionMethods
        setTableDetectionMethod(selectedMethod);
    };

    const handleLockToggle = () => {
        // console.log("Lock/Unlock functionality toggled");
        drawingContext.setIsDrawingLocked(prev => !prev)
    };

    const handleDrawingToggle = () => {
        const newDrawingEnabled = !drawingContext.isDrawingEnabled;
        drawingContext.setIsDrawingEnabled(newDrawingEnabled);
        
        // If turning off drawing mode and lock is on, also turn off the lock
        if (!newDrawingEnabled && drawingContext.isDrawingLocked) {
            drawingContext.setIsDrawingLocked(false);
        }
    };

    async function handleDetectTablesButtonClick() {
        // console.log("table detection method", tableDetectionMethod)
        try {
            setLoading(true);
            const response = await axios.get(`http://127.0.0.1:8000/pdf/all_tables/${tableDetectionMethod}`);
            if (response.status === 200) {
                const allTables: TableDetectionResponse = {
                    allRectangles: response.data.tables
                }
                tableDataContext.setTableData(allTables)
                // console.log("All tables from context: ", tableDataContext.tableData)
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    if (error.response.status === 404) {
                        toast.error("No tables found in PDF file")
                    } 
                    else if (error.response.status === 500) {
                        toast.error('Server error');
                    }
                } 
                else {
                    toast.error('No response received');
                }
            } 
            else {
                toast.error('Error sending request');
            }
        }
        finally {
            setLoading(false);
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
                    <Tooltip title={drawingContext.isDrawingLocked ? "Unlock drawing mode" : "Lock drawing mode"}>
                        <Button 
                            onClick={handleLockToggle}
                            color={drawingContext.isDrawingLocked ? "primary" : "inherit"}
                            variant={drawingContext.isDrawingLocked ? "contained" : "outlined"}
                        >
                            {drawingContext.isDrawingLocked ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                        </Button>
                    </Tooltip>
                    <Tooltip title={drawingContext.isDrawingEnabled ? "Disable drawing mode" : "Enable drawing mode"}>
                        <Button 
                            onClick={handleDrawingToggle}
                            color={drawingContext.isDrawingEnabled ? "primary" : "inherit"}
                            variant={drawingContext.isDrawingEnabled ? "contained" : "outlined"}
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
                        disabled={loading} // Disable button while loading
                        sx={{ minWidth: "150px" }} // Ensures button width stays the same
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {loading && <CircularProgress size={20} color="inherit" />}
                            <span>Detect Tables</span>
                        </Box>
                    </Button>
                </Tooltip>
            </div>
        </Box>
    );
}