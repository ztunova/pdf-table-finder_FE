import { useState } from "react";
import SingleTable from "./SingleTable";

const TablesViewer: React.FC = () => {
    // Initial tabs
    const [tabs] = useState([
    { id: '1', label: 'Tab 1', content: 'This is the content for Tab 1' },
    { id: '2', label: 'Tab 2', content: 'This is the content for Tab 2' },
    { id: '3', label: 'Tab 3', content: 'This is the content for Tab 3' },
    { id: '4', label: 'Tab 4', content: 'This is the content for Tab 4' },
    ]);

    // Current active tab
    const [activeTab, setActiveTab] = useState<string>(tabs[0].id);

    // Handler for tab change
    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Tab headers */}
            <div style={{ 
            display: 'flex', 
            borderBottom: '1px solid #ddd',
            overflowX: 'auto'
            }}>
            {tabs.map(tab => (
                <div
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                style={{
                    padding: '10px 15px',
                    cursor: 'pointer',
                    backgroundColor: activeTab === tab.id ? '#f5f5f5' : 'transparent',
                    borderBottom: activeTab === tab.id ? '2px solid #1976d2' : 'none',
                    whiteSpace: 'nowrap'
                }}
                >
                {tab.label}
                </div>
            ))}
            </div>
            
            {/* Tab content */}
            <div style={{ flex: 1, overflow: 'auto' }}>
            {tabs.map(tab => (
                <SingleTable key={tab.id} isActive={activeTab === tab.id}>
                <div style={{ 
                    border: '1px solid #eee', 
                    borderRadius: '4px', 
                    padding: '20px', 
                    minHeight: '200px' 
                }}>
                    {tab.content}
                </div>
                </SingleTable>
            ))}
            </div>
        </div>
    );
}

export default TablesViewer;