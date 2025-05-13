import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  UserCircle,
  Bell,
  Moon,
  Sun,
  Cog,
  HelpCircle,
  Tag,
  Users,
  Package,
  Boxes,
  Truck,
  FileText,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import '../styles/HomePage.css';

export default function HomePage() {
  const menuItems = [
    { label: "VENDAS", icon: Tag },
    { label: "VENDEDORES", icon: Users, route: "/sellers" },
    { label: "PRODUTOS", icon: Package },
    { label: "ESTOQUE", icon: Boxes },
    { label: "FORNECEDORES", icon: Truck },
    { label: "PEDIDOS", icon: FileText },
    { label: "CLIENTES", icon: ShoppingCart },
    { label: "DESPESAS", icon: Wallet },
  ];

  return (
    <div className="homepage">
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

      <nav className="homepage-nav">
        {[
          "Tela Inicial",
          "Vendas",
          "Vendedores",
          "Produtos",
          "Estoque",
          "Fornecedores",
          "Pedidos",
          "Clientes",
          "Despesas",
        ].map((item) => (
          <span key={item} className="nav-item">
            {item}
          </span>
        ))}
      </nav>

<main className="homepage-grid">
  {menuItems.map(({ label, icon: Icon, route }) => {
    const card = (
      <Card className="homepage-card">
        <CardContent className="card-content">
          <Icon className="card-icon" />
          <span className="card-label">{label}</span>
        </CardContent>
      </Card>
    );

    return route ? (
      <Link to={route} key={label} className="card-link">
        {card}
      </Link>
    ) : (
      <div key={label}>{card}</div>
    );
  })}
</main>
    </div>
  );
}