import { Link } from "react-router-dom";
import "../../styles/HomePage.css";

const Navbar = () => {
  const navItems = [
    { label: "Tela Inicial", path: "/" },
    { label: "Vendas", path: "/sales" },
    { label: "Vendedores", path: "/sellers" },
    { label: "Produtos", path: "/products" },
    { label: "Estoque", path: "#" },
    { label: "Fornecedores", path: "/suppliers" },
    { label: "Pedidos", path: "#" },
    { label: "Clientes", path: "/clients" },
    { label: "Despesas", path: "#" },
  ];

  return (
    <nav className="homepage-nav">
      {navItems.map(({ label, path }) => (
        <Link key={label} to={path} className="nav-item">
          {label}
        </Link>
      ))}
    </nav>
  );
};

export default Navbar;
