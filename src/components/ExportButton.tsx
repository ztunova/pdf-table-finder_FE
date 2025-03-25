import { useState, MouseEvent } from "react";
import {
  Button,
  ButtonGroup,
  Tooltip,
  Box,
  Menu,
  MenuItem,
} from "@mui/material";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

enum ExportFormat {
    EXCEL = "excel",
    CSV = "csv",
}

export default function ExportButton() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const [exportFormat, setExportFormat] = useState<ExportFormat>(ExportFormat.EXCEL);

    const handleMenuClick = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleExport = (format: ExportFormat) => {
        setExportFormat(format);
        // Implement your export logic here
        console.log(`Exporting to ${format}`);
        
        // Close the menu
        handleClose();
    };

    const menuItems = [
        { value: ExportFormat.EXCEL, label: 'Excel (.xlsx)' },
        { value: ExportFormat.CSV, label: 'CSV (.csv)' },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <ButtonGroup variant="outlined" color="primary" size="large">
            <Tooltip title="Export data">
              <Button
                startIcon={<UploadFileIcon />}
                onClick={() => handleExport(exportFormat)} // Default export format
              >
                Export to {menuItems.find(item => item.value === exportFormat)?.label}
              </Button>
            </Tooltip>
            <Tooltip title="Select export format">
              <Button 
                size="small"
                aria-label="select export format"
                aria-haspopup="menu"
                aria-expanded={open ? 'true' : undefined}
                aria-controls={open ? 'export-menu' : undefined}
                onClick={handleMenuClick}
              >
                <ArrowDropDownIcon />
              </Button>
            </Tooltip>
          </ButtonGroup>
    
          <Menu
            id="export-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
          >
            {menuItems.map((item) => (
              <MenuItem 
                key={item.value} 
                onClick={() => handleExport(item.value)}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>
    
    
        </Box>
    );
}