import { useState, MouseEvent } from "react";
import {
  Button,
  ButtonGroup,
  Tooltip,
  Box,
  Menu,
  MenuItem,
} from "@mui/material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import axios from "axios";
import { useTableData } from "../custom-context/TableContext";
import { usePdf } from "../custom-context/PdfContext";
import { API_BASE_URL } from "../constants";

enum ExportFormat {
    EXCEL = "excel",
    CSV = "csv",
}

export default function ExportButton() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const [exportFormat, setExportFormat] = useState<ExportFormat>(ExportFormat.EXCEL);
    const { getExtractedTableData } = useTableData();
    const { pdfName } = usePdf();

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

    const getBaseName = () => {
      if (!pdfName) {
        return "exported_tables"
      };
      // Remove .pdf extension if present
      return pdfName.toLowerCase().endsWith('.pdf') 
          ? pdfName.slice(0, -4) 
          : pdfName;
    };

    const handleExport = async (format: ExportFormat) => {
        setExportFormat(format);
        const tableData = getExtractedTableData()

        try {
            const response = await axios.post(`${API_BASE_URL}/exports/${pdfName}/${exportFormat}`, 
                { data: tableData},
                { responseType: "blob" },
            );

            if (response.status === 200) {
              const url = window.URL.createObjectURL(new Blob([response.data]));
              const a = document.createElement("a");
              a.href = url;
              
              const baseName = getBaseName();
              if (exportFormat === ExportFormat.EXCEL) {
                  a.download = `${baseName}.xlsx`;
              } else {
                  a.download = `${baseName}.zip`;
              }
              
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url); // Clean up the URL object
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
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
                startIcon={<FileDownloadIcon />}
                onClick={() => handleExport(exportFormat)}
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