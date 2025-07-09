import {
  UserCircle,
  Bell,
  Moon,
  Sun,
  Cog,
  HelpCircle,
} from "lucide-react";
import '../../styles/HomePage.css';
import { useEffect, useState } from "react";

const Header = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Inicializa pelo localStorage ou padrão claro
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <header className="homepage-header">
      <h1 className="homepage-title">ERP Kanto Intimo</h1>
      <div className="homepage-icons">
        <HelpCircle className="icon" />
        <Cog className="icon" />
        {darkMode ? (
          <Moon className="icon" onClick={() => setDarkMode(false)} style={{ cursor: 'pointer' }} />
        ) : (
          <Sun className="icon" onClick={() => setDarkMode(true)} style={{ cursor: 'pointer' }} />
        )}
        <Bell className="icon" />
        <UserCircle className="icon" />
      </div>
    </header>
  );
};

export default Header;
