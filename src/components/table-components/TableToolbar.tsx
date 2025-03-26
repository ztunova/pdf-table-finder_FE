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

    const toolbarHeight = "50px"; // Adjust this value to match your desired height

    return (
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid #e0e0e0',
            minHeight: toolbarHeight, // Add explicit minimum height
            height: toolbarHeight // Add explicit height
          }}
        >
            {/* Left side - empty div with minimum dimensions to prevent collapse */}
            <div style={{ minWidth: '1px', minHeight: '1px' }}></div>
            
            {/* Right side - empty div with minimum dimensions to prevent collapse */}
            <div style={{ minWidth: '1px', minHeight: '1px' }}></div>
        </Box>
    );
}