import { Box, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useDrawing } from "../custom-context/DrawingContext";
import { useState } from "react";
import axios from "axios";

enum TableDetectionMethods {
    PYMU = 'pymu',
    YOLO = 'yolo',
}

export const PdfToolbar: React.FC = () => {
    const {isDrawingEnabled, setIsDrawingEnabled} = useDrawing();
    const [tableDetectionMethod, setTableDetectionMethod] = useState<TableDetectionMethods>(TableDetectionMethods.PYMU);

    const menuItems = [
        { value: TableDetectionMethods.PYMU, label: 'pymu label' },
        { value: TableDetectionMethods.YOLO, label: 'yolo label' },
      ];
    
    const handleTableDetectionChange = (event: SelectChangeEvent) => {
        const selectedMethod = event.target.value as TableDetectionMethods
        setTableDetectionMethod(selectedMethod);
    };

    async function handleDetectTablesButtonClick() {
        console.log("table detection method", tableDetectionMethod)
        try {
            const response = axios.get(`http://127.0.0.1:8000/pdf/all_tables/${tableDetectionMethod}`);
            console.log("All tables: ", (await response).data.tables)
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
            gap: 2,
            p: 2,
            borderBottom: '1px solid #e0e0e0'
          }}
        >
            <Button 
            onClick={() => setIsDrawingEnabled(prev => !prev)}
            variant="outlined"
            sx={{
                bgcolor: isDrawingEnabled ? '#007FFF' : '#fff',
                color: isDrawingEnabled ? '#fff' : '#000',
                border: '1px solid #007FFF',
                '&:hover': {
                bgcolor: isDrawingEnabled ? '#0059B2' : '#F5F5F5',
                border: '1px solid #007FFF',
                }
            }}
            >
                {isDrawingEnabled ? 'Disable Drawing' : 'Enable Drawing'}
            </Button>
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="table-detection-method-select-label">Table Detection Method</InputLabel>
                <Select
                    labelId="table-detection-method-select-label"
                    id="table-detection-method-select"
                    value={tableDetectionMethod}
                    onChange={handleTableDetectionChange}
                    label="Age"
                >
                {menuItems.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                        {item.label}
                    </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Button 
                variant="contained"
                color="primary"
                onClick={handleDetectTablesButtonClick}
            >
                Detect Tables
            </Button>
        </Box>
    );
}
