import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ReadSellersPage from "./pages/ReadSellersPage";
import CreateSellersPage from "./pages/CreateSellersPage";
import ReadSuppliersPage from "./pages/ReadSuppliersPage";
import CreateSuppliersPage from "./pages/CreateSuppliersPage";
import ReadProductsPage from "./pages/ReadProductsPage";
import CreateProductsPage from "./pages/CreateProductsPage";
import ReadSalesPage from "./pages/ReadSalesPage";
import CreateSalesPage from "./pages/CreateSalesPage";
import ReadClientsPage from "./pages/ReadClientsPage";
import CreateClientsPage from "./pages/CreateClientsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sellers" element={<ReadSellersPage />} /> 
        <Route path="/sellers/create" element={<CreateSellersPage />} />
        <Route path="/suppliers" element={<ReadSuppliersPage />} />
        <Route path="/suppliers/create" element={<CreateSuppliersPage />} />
        <Route path="/products" element={<ReadProductsPage />} />
        <Route path="/products/create" element={<CreateProductsPage />} />
        <Route path="/sales" element={<ReadSalesPage />} />
        <Route path="/sales/create" element={<CreateSalesPage />} />
        <Route path="/clients" element={<ReadClientsPage />} />
        <Route path="/clients/create" element={<CreateClientsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
