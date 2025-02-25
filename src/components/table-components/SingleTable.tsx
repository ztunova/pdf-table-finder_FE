
interface SingleTableProps {
    isActive: boolean;
    children: React.ReactNode;
}

const SingleTable: React.FC<SingleTableProps> = ({ isActive, children }) => {
    if (!isActive) return null;
  
    return (
      <div style={{ padding: '10px', height: 'calc(100% - 40px)' }}>
        {children}
      </div>
    );
}

export default SingleTable;