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
import axios from "axios";
import { useTableData } from "../custom-context/TableContext";
import { data } from "react-router-dom";

enum ExportFormat {
    EXCEL = "excel",
    CSV = "csv",
}

export default function ExportButton() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const [exportFormat, setExportFormat] = useState<ExportFormat>(ExportFormat.EXCEL);
    const { getExtractedTableData } = useTableData();

    const handleMenuClick = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenuItemClick = (format: ExportFormat) => {
        setExportFormat(format);
        handleClose();
    };

    const handleExport = async (format: ExportFormat) => {
        setExportFormat(format);
        // Implement your export logic here
        console.log(`Exporting to ${format}`);
        const tableData = getExtractedTableData()

        try {
            const response = await axios.post(`http://127.0.0.1:8000/exports/${exportFormat}`, 
                { data: tableData},
                { responseType: "blob" },
            );

            if (response.status === 200) {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const a = document.createElement("a");
                a.href = url;
                a.download = exportFormat === ExportFormat.EXCEL ? "exported_tables.xlsx" : "exported_tables.zip";
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    console.error(`Error status: ${error.response.status}`);
                    console.error('Error data:', error.response.data);
                    
                    // Handle specific status codes
                    if (error.response.status === 404) {
                        console.error('Resource not found');
                    } 
                    else if (error.response.status === 401) {
                        console.error('Unauthorized access');
                    } 
                    else if (error.response.status === 500) {
                        console.error('Server error');
                    }
                } 
                else {
                    console.error('No response received:', error.message);
                }
            } 
            else {
                console.error('Error sending coordinates:', error);
            }
        }
        finally {
            // Close the menu
            handleClose();
        }
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
                onClick={() => handleMenuItemClick(item.value)}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>
    
    
        </Box>
    );
}