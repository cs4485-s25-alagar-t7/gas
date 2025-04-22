import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface LayoutProps {
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ onLogout, children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onLogout={onLogout} />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout; 