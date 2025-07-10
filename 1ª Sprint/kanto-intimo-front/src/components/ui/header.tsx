import { Input } from "@/components/ui/input";
import {
  Search,
  UserCircle,
  Bell,
  Moon,
  Sun,
  Cog,
  HelpCircle,
} from "lucide-react";
import '../../styles/HomePage.css';


const Header = () => {
  return (
    <header className="homepage-header">
      <h1 className="homepage-title">ERP Kanto Intimo</h1>
      <div className="homepage-search">
        <Input placeholder="Pesquisa" className="search-input" />
        <Search className="search-icon" />
      </div>
      <div className="homepage-icons">
        <HelpCircle className="icon" />
        <Cog className="icon" />
        <Sun className="icon" />
        <Moon className="icon" />
        <Bell className="icon" />
        <UserCircle className="icon" />
      </div>
    </header>
  );
};

export default Header;
