import React, { useState, useEffect } from 'react';
import SingleTable from "./SingleTable";
import TableTabs from "./TableTabs";
import { useTableData } from '../../custom-context/TableContext';
import { Box } from '@mui/material';

const TablesViewer: React.FC = () => {
  const tablesContext = useTableData();
  
  // Active tab state
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  
  // Set active tab when tables change
  useEffect(() => {
    if (tablesContext.selectedRectangleId && tablesContext.extractedTables.includes(tablesContext.selectedRectangleId)) {
      setActiveTabId(tablesContext.selectedRectangleId);
    }
    // no rectangle is currently selected
    else {
      if (tablesContext.extractedTables.length > 0) {
        if (activeTabId != null) {
          if (!tablesContext.extractedTables.includes(activeTabId)) {
            const newActiveTabId = tablesContext.extractedTables[tablesContext.extractedTables.length - 1];
            setActiveTabId(newActiveTabId);
          }
        }
      }
      else {
        setActiveTabId(null)
      }
    }
  }, [tablesContext.selectedRectangleId, tablesContext.extractedTables]);

  useEffect(() => {
    if (activeTabId !== tablesContext.selectedRectangleId) {
      tablesContext.setSelectedRectangle(activeTabId)
    }
  }, [activeTabId])

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
    tablesContext.setSelectedRectangle(tabId)
  };

  // Handle empty state
  if (tablesContext.extractedTables.length === 0) {
    return (
      <Box sx={{ 
        height: '95%', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '16px',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#666',
        borderRadius: 1,
        bgcolor: '#f5f5f5'
      }}>
        <p>No tables with extracted data available.</p>
        <p>Draw rectangles over tables and extract data to view them here.</p>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '95%', 
      display: 'flex', 
      flexDirection: 'column',
      borderRadius: 1,
      bgcolor: '#f5f5f5',
      overflow: 'hidden' // Prevent outer scrolling
    }}>
      {/* Tab headers */}
      <Box sx={{ 
        padding: '8px 16px 0 16px', 
        // mt: 2 // Keep margin-top for tabs to separate from toolbar
      }}>
        <TableTabs 
          activeTabId={activeTabId} 
          onTabClick={handleTabClick} 
        />
      </Box>
      
      {/* Tab content */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', // make the content scrollable
        padding: '0 16px 16px 16px'
      }}>
        {/* Only render the SingleTable component for the active tab */}
        {activeTabId && (
          <SingleTable 
            id={activeTabId}
            isActive={true}
            rectangleId={activeTabId}
          />
        )}
      </Box>
    </Box>
  );
};

export default TablesViewer;