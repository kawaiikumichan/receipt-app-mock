import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Camera, Package, Utensils } from 'lucide-react';
import HomePage from './pages/HomePage';
import ScannerPage from './pages/ScannerPage';
import InventoryPage from './pages/InventoryPage';
import RecipesPage from './pages/RecipesPage';

function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Home, label: 'ホーム' },
    { path: '/inventory', icon: Package, label: '在庫' },
    { path: '/scanner', icon: Camera, label: '読取' },
    { path: '/recipes', icon: Utensils, label: 'レシピ' },
  ];

  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Icon size={24} className={isActive ? 'stroke-[2.5px]' : ''} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 pb-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/scanner" element={<ScannerPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default App;
