import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ReadSellersPage from "./pages/ReadSellersPage";
import CreateSellersPage from "./pages/CreateSellersPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sellers" element={<ReadSellersPage />} /> 
        <Route path="/sellers/create" element={<CreateSellersPage />} />
      </Routes>
    </BrowserRouter>
  );
}
