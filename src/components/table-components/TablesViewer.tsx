// TablesViewer.tsx
import React, { useState, useEffect } from 'react';
import SingleTable from "./SingleTable";
import TableTabs from "./TableTabs"; // Import the new TableTabs component
import TableToolbar from "./TableToolbar"; // Import the new TableToolbar component
import { useTableData } from '../../custom-context/TableContext';

const TablesViewer: React.FC = () => {
  const tablesContext = useTableData();
  
  // Active tab state
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  
  // Set active tab when tables change
  useEffect(() => {
    console.log("SELECTED TAB CHANGE")
    if (tablesContext.selectedRectangleId && tablesContext.extractedTables.includes(tablesContext.selectedRectangleId)) {
      console.log("SET SELECTED TAB TO SELECTED RECT")
      setActiveTabId(tablesContext.selectedRectangleId);
    }
    // no rectangle is currently selected
    else {
      if (tablesContext.extractedTables.length > 0) {
        if (activeTabId != null) {
          if (!tablesContext.extractedTables.includes(activeTabId)) {
            console.log("ACTIVE TAB NOT IN EXTR TABLES => SELECT OTHER TAB")
            const newActiveTabId = tablesContext.extractedTables[tablesContext.extractedTables.length - 1];
            setActiveTabId(newActiveTabId);
          }
          else {
            console.log("KEEP CURRENT TAB")
          }
        }
        else {
          console.log("NO RECT AND NO TAB SELECTED")
        }
      }
      else {
        console.log("TAB NULL")
        setActiveTabId(null)
      }
    }
  }, [tablesContext.selectedRectangleId, tablesContext.extractedTables]);

  useEffect(() => {
    if (activeTabId !== tablesContext.selectedRectangleId) {
      console.log("DIFFERENT ACTIVE TAB AND RECT")
      tablesContext.setSelectedRectangle(activeTabId)
    }
  }, [activeTabId])

  // Handle tab click
  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
    tablesContext.setSelectedRectangle(tabId)
  };

  // Handle empty state
  if (tablesContext.extractedTables.length === 0) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '16px',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#666'
      }}>
        <p>No tables with extracted data available.</p>
        <p>Draw rectangles over tables and extract data to view them here.</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar section - above the tabs */}
      <div style={{ padding: '16px 16px 0 16px' }}>
        <TableToolbar />
      </div>
      
      {/* Tab headers - now using the TableTabs component */}
      <div style={{ padding: '8px 16px 0 16px' }}>
        <TableTabs 
          activeTabId={activeTabId} 
          onTabClick={handleTabClick} 
        />
      </div>
      
      {/* Tab content - now in a separate scrollable container */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto', 
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
      </div>
    </div>
  );
};

export default TablesViewer;