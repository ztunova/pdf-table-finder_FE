import PdfViewer from "../components/PdfViewer";
import TablesViewer from "../components/table-components/TablesViewer";

const MainPage: React.FC = () => {
    return (
        <div style={{ 
          display: 'flex', 
          height: '100vh', 
          width: '100%' 
        }}>
          {/* Left side - PDF Viewer */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            <PdfViewer />
          </div>
    
          {/* Right side - Minimalistic Tabbed Panel */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            <TablesViewer />
          </div>
        </div>
    );
};

export default MainPage;