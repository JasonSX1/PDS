import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SellersPage from "./pages/SellersPage"; // exemplo

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sellers" element={<SellersPage />} /> 
      </Routes>
    </BrowserRouter>
  );
}
