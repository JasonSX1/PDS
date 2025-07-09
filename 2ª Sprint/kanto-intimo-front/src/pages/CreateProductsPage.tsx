import React, { useState, useEffect } from "react";
import "../styles/CreateProductsPage.css";
import CreatableSelect from 'react-select/creatable';
import Header from "../components/ui/header";
import Navbar from "../components/ui/navbar";
import api from "../lib/axiosConfig";

interface Supplier { id: number; name: string; }
interface CategoryOption { value: number; label: string; }
interface SimpleOption { value: string; label: string; }

const INITIAL_SIZE_OPTIONS: SimpleOption[] = ["P", "M", "G", "GG", "XG"].map(s => ({ value: s, label: s }));
const INITIAL_COLOR_OPTIONS: SimpleOption[] = ["Preto", "Branco", "Vermelho", "Azul", "Rosa", "Bege", "Cinza", "Verde"].map(c => ({ value: c, label: c }));

// Função para formatar o preço como moeda brasileira
function formatarPreco(valor: string): string {
  const valorNumerico = valor.replace(/[^\d]/g, '');
  if (!valorNumerico) return '';
  const numero = parseFloat(valorNumerico) / 100;
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
    supplierId: "",
    categoryIds: [] as number[]
  });

  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [sizeOptions, setSizeOptions] = useState<SimpleOption[]>(INITIAL_SIZE_OPTIONS);
  const [colorOptions, setColorOptions] = useState<SimpleOption[]>(INITIAL_COLOR_OPTIONS);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/supplier/pages").then(res => setSuppliers(res.data.results || []));
    api.get("/category").then(res => {
      const apiCategories: CategoryOption[] = res.data.results.map(
        (cat: { id: number; name: string }) => ({
          value: cat.id,
          label: cat.name
        })
      );
      setCategoryOptions(apiCategories);
    });
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
    if (!formData.name || !formData.price || !formData.size || !formData.color || !formData.quantity || !formData.supplierId || formData.categoryIds.length === 0) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    try {
      const valorNumerico = formData.price.replace(/[^\d]/g, '');
      const price = parseFloat(valorNumerico) / 100;
      const payload = {
        name: formData.name,
        price: price,
        size: formData.size,
        color: formData.color,
        quantity: parseInt(formData.quantity, 10),
        supplierId: Number(formData.supplierId),
        categoryIds: formData.categoryIds
      };
      const response = await api.post("/product", payload);
      if (response.status !== 201 && response.status !== 200) throw new Error(response.data.message || "Erro ao cadastrar produto");
      alert("Produto cadastrado com sucesso!");
      setFormData({ name: "", price: "", size: "", color: "", quantity: "", supplierId: "", categoryIds: [] });
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
        <div className="form-group">
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Nome do Produto"
            value={formData.name}
            onChange={handleChange}
            required
            maxLength={100}
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            id="price"
            name="price"
            placeholder="Preço"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <CreatableSelect
            isClearable
            options={sizeOptions}
            onChange={(newValue) => {
              if (newValue) {
                setFormData(prev => ({ ...prev, size: newValue.value }));
                if (!sizeOptions.some(opt => opt.value === newValue.value)) {
                  setSizeOptions(prev => [...prev, newValue]);
                }
              } else {
                setFormData(prev => ({ ...prev, size: "" }));
              }
            }}
            value={formData.size ? { value: formData.size, label: formData.size } : null}
            placeholder="Selecione ou crie um tamanho"
          />
        </div>
        <div className="form-group">
          <CreatableSelect
            isClearable
            options={colorOptions}
            onChange={(newValue) => {
              if (newValue) {
                setFormData(prev => ({ ...prev, color: newValue.value }));
                if (!colorOptions.some(opt => opt.value === newValue.value)) {
                  setColorOptions(prev => [...prev, newValue]);
                }
              } else {
                setFormData(prev => ({ ...prev, color: "" }));
              }
            }}
            value={formData.color ? { value: formData.color, label: formData.color } : null}
            placeholder="Selecione ou crie uma cor"
          />
        </div>
        <div className="form-group">
          <CreatableSelect
            isMulti
            isClearable
            options={categoryOptions}
            classNamePrefix="select"
            onChange={(newValues) => {
              const values = (newValues || []) as CategoryOption[];
              setFormData(prev => ({
                ...prev,
                categoryIds: values.map(v => v.value)
              }));
            }}
            onCreateOption={async (inputValue) => {
              try {
                const res = await api.post("/category", {
                  name: inputValue,
                  description: "Categoria criada manualmente"
                });

                const newCategory = res.data;

                const newOption: CategoryOption = {
                  value: newCategory.id,
                  label: newCategory.name,
                };

                setCategoryOptions(prev => [...prev, newOption]);

                setFormData(prev => ({
                  ...prev,
                  categoryIds: [...prev.categoryIds, newCategory.id],
                }));
              } catch (err: any) {
                console.error("Erro ao criar categoria:", err);
                setError(err.response?.data?.message || "Erro ao criar categoria");
              }
            }}
            value={categoryOptions.filter(opt => formData.categoryIds.includes(opt.value))}

            placeholder="Selecione ou crie uma categoria"
          />

        </div>
        <div className="form-group">
          <input
            type="number"
            id="quantity"
            name="quantity"
            placeholder="Quantidade em Estoque"
            value={formData.quantity}
            onChange={handleChange}
            required
            min="0"
          />
        </div>
        <div className="form-group">
          <select
            id="supplierId"
            name="supplierId"
            value={formData.supplierId}
            onChange={handleChange}
            required
          >
            <option value="">Selecione o Fornecedor</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
        <button type="submit" className="submit-button">Cadastrar</button>
      </form>
    </div>
  );
}