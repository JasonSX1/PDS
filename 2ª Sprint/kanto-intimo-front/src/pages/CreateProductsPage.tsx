import React, { useState, useEffect } from "react";
import "../styles/CreateProductsPage.css";
import Header from "../components/ui/header";
import Navbar from "../components/ui/navbar";
import api from "../lib/axiosConfig";

interface Supplier { id: number; name: string; }

const SIZE_OPTIONS = ["P", "M", "G", "GG", "XG"];
const COLOR_OPTIONS = ["Preto", "Branco", "Vermelho", "Azul", "Rosa", "Bege", "Cinza", "Verde"];

// Função para formatar o preço como moeda brasileira
function formatarPreco(valor: string): string {
  // Remove qualquer caractere que não seja número
  const valorNumerico = valor.replace(/[^\d]/g, '');
  if (!valorNumerico) return '';
  // Converte para número e divide por 100 para considerar os centavos
  const numero = parseFloat(valorNumerico) / 100;
  // Formata como moeda brasileira (R$)
  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function CreateProductsPage() {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    size: "",
    color: "",
    quantity: "",
    supplierId: ""
  });
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/supplier/pages").then(res => setSuppliers(res.data.results || []));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "price") {
      setFormData(prev => ({ ...prev, price: formatarPreco(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.name || !formData.price || !formData.size || !formData.color || !formData.quantity || !formData.supplierId) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    try {
      // Extrai apenas os números do valor formatado para enviar ao backend
      const valorNumerico = formData.price.replace(/[^\d]/g, '');
      const price = parseFloat(valorNumerico) / 100;
      const payload = {
        name: formData.name,
        price: price,
        size: formData.size,
        color: formData.color,
        quantity: parseInt(formData.quantity, 10),
        supplierId: Number(formData.supplierId)
      };
      const response = await api.post("/product", payload);
      if (response.status !== 201 && response.status !== 200) throw new Error(response.data.message || "Erro ao cadastrar produto");
      alert("Produto cadastrado com sucesso!");
      setFormData({ name: "", price: "", size: "", color: "", quantity: "", supplierId: "" });
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || "Erro desconhecido");
    }
  };

  return (
    <div className="products-container">
      <Header />
      <Navbar />
      <div className="products-header">
        <h2 style={{ fontWeight: 700 }}>Cadastrar Produto</h2>
        <h3>
          <a href="/products" style={{ color: 'black', textDecoration: 'none' }}>Visualizar Produtos</a>
        </h3>
      </div>
      <form className="product-form" onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Nome do Produto"
          value={formData.name}
          onChange={handleChange}
          required
          maxLength={100}
        />
        <input
          name="price"
          placeholder="Preço"
          value={formData.price}
          onChange={handleChange}
          required
          type="text"
          min="0"
          style={{ flex: 1 }}
        />
        <select name="size" value={formData.size} onChange={handleChange} required>
          <option value="">Selecione o Tamanho</option>
          {SIZE_OPTIONS.map(size => <option key={size} value={size}>{size}</option>)}
        </select>
        <select name="color" value={formData.color} onChange={handleChange} required>
          <option value="">Selecione a Cor</option>
          {COLOR_OPTIONS.map(color => <option key={color} value={color}>{color}</option>)}
        </select>
        <input
          name="quantity"
          placeholder="Quantidade em Estoque"
          value={formData.quantity}
          onChange={handleChange}
          required
          type="number"
          min="0"
        />
        <select name="supplierId" value={formData.supplierId} onChange={handleChange} required>
          <option value="">Selecione o Fornecedor</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
        <button type="submit" className="submit-button">Cadastrar</button>
      </form>
    </div>
  );
} 