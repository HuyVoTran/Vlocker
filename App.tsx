import { useState } from 'react';
import { Home, User, FileText, Phone, LogOut, Package, PlusCircle, LayoutDashboard, BoxIcon } from 'lucide-react';
import LandingPage from './components/LandingPage';
import ResidentDashboard from './components/ResidentDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import MyLockers from './components/MyLockers';
import RegisterLocker from './components/RegisterLocker';
import ManagerLockers from './components/ManagerLockers';
import AvailableLockers from './components/AvailableLockers';
import Profile from './components/Profile';
import Report from './components/Report';
import Contact from './components/Contact';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

type Page = 
  | 'landing'
  | 'resident-dashboard'
  | 'manager-dashboard'
  | 'my-lockers'
  | 'register-locker'
  | 'manager-lockers'
  | 'available-lockers'
  | 'profile'
  | 'report'
  | 'contact';

type UserRole = 'resident' | 'manager' | null;

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    if (role === 'resident') {
      setCurrentPage('resident-dashboard');
    } else if (role === 'manager') {
      setCurrentPage('manager-dashboard');
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentPage('landing');
  };

  const residentMenuItems = [
    { id: 'resident-dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'my-lockers', label: 'Tủ của tôi', icon: <Package className="w-5 h-5" /> },
    { id: 'register-locker', label: 'Đăng ký tủ mới', icon: <PlusCircle className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    { id: 'report', label: 'Báo cáo', icon: <FileText className="w-5 h-5" /> },
    { id: 'contact', label: 'Liên hệ', icon: <Phone className="w-5 h-5" /> },
  ];

  const managerMenuItems = [
    { id: 'manager-dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'manager-lockers', label: 'Tủ đã đặt & đã dùng', icon: <Package className="w-5 h-5" /> },
    { id: 'available-lockers', label: 'Tủ trống', icon: <BoxIcon className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    { id: 'report', label: 'Báo cáo', icon: <FileText className="w-5 h-5" /> },
    { id: 'contact', label: 'Liên hệ', icon: <Phone className="w-5 h-5" /> },
  ];

  const menuItems = userRole === 'resident' ? residentMenuItems : userRole === 'manager' ? managerMenuItems : [];

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onLogin={handleLogin} />;
      case 'resident-dashboard':
        return <ResidentDashboard onNavigate={setCurrentPage} />;
      case 'manager-dashboard':
        return <ManagerDashboard />;
      case 'my-lockers':
        return <MyLockers />;
      case 'register-locker':
        return <RegisterLocker />;
      case 'manager-lockers':
        return <ManagerLockers />;
      case 'available-lockers':
        return <AvailableLockers />;
      case 'profile':
        return <Profile userRole={userRole} />;
      case 'report':
        return <Report />;
      case 'contact':
        return <Contact />;
      default:
        return <LandingPage onLogin={handleLogin} />;
    }
  };

  if (!userRole) {
    return renderPage();
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isOpen={isSidebarOpen}
        menuItems={menuItems}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          userRole={userRole}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
