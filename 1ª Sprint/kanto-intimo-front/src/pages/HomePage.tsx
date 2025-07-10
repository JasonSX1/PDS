import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import Header from "../components/ui/header";
import Navbar from "../components/ui/navbar";
import {
  Tag,
  Users,
  Package,
  Boxes,
  Truck,
  FileText,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import "../styles/HomePage.css";

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
      <Header />
      <Navbar />

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
