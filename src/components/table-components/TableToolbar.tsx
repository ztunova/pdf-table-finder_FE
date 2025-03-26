import { Box, Button, ButtonGroup, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Tooltip } from "@mui/material";
import { useState } from "react";
import LockIcon from '@mui/icons-material/Lock';
import CreateIcon from '@mui/icons-material/Create';

enum TableDetectionMethods {
    PYMU = 'pymu',
    YOLO = 'yolo',
}

export const TableToolbar: React.FC = () => {
    const [tableDetectionMethod, setTableDetectionMethod] = useState<TableDetectionMethods>(TableDetectionMethods.PYMU);

    const menuItems = [
        { value: TableDetectionMethods.PYMU, label: 'pymu label' },
        { value: TableDetectionMethods.YOLO, label: 'yolo label' },
    ];

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
                            onClick={() => {}}
                            color="primary"
                        >
                            <LockIcon fontSize="small" />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Enable/Disable Drawing Mode">
                        <Button 
                            onClick={() => {}}
                            color="primary"
                            variant="contained"
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
                        onChange={() => {}}
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
                        onClick={() => {}}
                    >
                        Detect Tables
                    </Button>
                </Tooltip>
            </div>
        </Box>
    );
}