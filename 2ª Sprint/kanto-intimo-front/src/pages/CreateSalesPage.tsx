import React, { useState, useEffect } from "react";
import "../styles/CreateSalesPage.css";
import Header from "../components/ui/header";
import Navbar from "../components/ui/navbar";
import { Plus, X, Calendar } from "lucide-react";
import api from "../lib/axiosConfig";
import { useNotification } from '../components/ui/notification';

interface Client {
  id: number;
  name: string;
  email: string;
}

interface Seller {
  id: number;
  name: string;
  email: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  size: string;
  color: string;
  stock?: {
    quantity: number;
  };
}

interface SaleItem {
  productId: number;
  quantity: number;
  unitPrice: number;
  productName: string;
}

export default function CreateSalesPage() {
  const { showSuccess, NotificationContainer } = useNotification();
  const [formData, setFormData] = useState({
    clientId: "",
    sellerId: "",
    total: 0,
    date: new Date().toISOString().split('T')[0], // Data atual como padrão
    observations: ""
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // Buscar clientes
    api.get("/client/pages").then(res => setClients(res.data.results || []));
    // Buscar vendedores
    api.get("/seller/pages").then(res => setSellers(res.data.results || []));
    // Buscar produtos
    api.get("/product/pages").then(res => setProducts(res.data.results || []));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addItem = () => {
    setSaleItems(prev => [...prev, {
      productId: 0,
      quantity: 1,
      unitPrice: 0,
      productName: ""
    }]);
  };

  const removeItem = (index: number) => {
    setSaleItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof SaleItem, value: any) => {
    setSaleItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Se o produto foi selecionado, buscar o preço
      if (field === 'productId') {
        const product = products.find(p => p.id === Number(value));
        if (product) {
          newItems[index].unitPrice = product.price;
          newItems[index].productName = product.name;
        }
      }
      
      return newItems;
    });
  };

  // Calcular total sempre que os itens mudarem
  useEffect(() => {
    const total = saleItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    setFormData(prev => ({ ...prev, total }));
  }, [saleItems]);

  const handleCalendarClick = () => {
    const dateInput = document.querySelector('input[name="date"]') as HTMLInputElement;
    if (dateInput) {
      dateInput.showPicker();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.clientId || !formData.sellerId) {
      setError("Selecione cliente e vendedor.");
      return;
    }

    if (saleItems.length === 0) {
      setError("Adicione pelo menos um produto à venda.");
      return;
    }

    if (saleItems.some(item => item.productId === 0)) {
      setError("Todos os itens devem ter um produto selecionado.");
      return;
    }

    // Validar estoque
    for (const item of saleItems) {
      const product = products.find(p => p.id === item.productId);
      if (product && product.stock) {
        if (product.stock.quantity < item.quantity) {
          setError(`Estoque insuficiente para o produto "${product.name}". Disponível: ${product.stock.quantity}, Solicitado: ${item.quantity}`);
          return;
        }
      } else if (product) {
        setError(`Produto "${product.name}" não possui estoque cadastrado.`);
        return;
      }
    }

    try {
      const payload = {
        clientId: Number(formData.clientId),
        sellerId: Number(formData.sellerId),
        total: formData.total,
        date: formData.date,
        observations: formData.observations,
        items: saleItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      };

      const response = await api.post("/sale", payload);
      if (response.status !== 201) throw new Error(response.data.message || "Erro ao cadastrar venda");
      
      // Disparar evento para atualizar estatísticas de vendedores
      const updateEvent = new CustomEvent('saleCreated', {
        detail: { sellerId: formData.sellerId }
      });
      window.dispatchEvent(updateEvent);
      
      // Também usar localStorage como fallback
      localStorage.setItem('lastSaleUpdate', Date.now().toString());
      localStorage.setItem('lastSaleSellerId', formData.sellerId);
      
      showSuccess("Venda cadastrada com sucesso!");
      setFormData({ 
        clientId: "", 
        sellerId: "", 
        total: 0, 
        date: new Date().toISOString().split('T')[0],
        observations: ""
      });
      setSaleItems([]);
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || "Erro desconhecido");
    }
  };

  return (
    <div className="sales-container">
      <Header />
      <Navbar />

      <div className="sales-header">
        <h2 style={{ fontWeight: 700 }}>Cadastrar Venda</h2>
        <h3>
          <a href="/sales" style={{ color: 'black', textDecoration: 'none' }}>Visualizar Vendas</a>
        </h3>
      </div>

      <form className="sale-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <select name="clientId" value={formData.clientId} onChange={handleChange} required>
            <option value="">Selecione o Cliente</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name} - {c.email}</option>)}
          </select>

          <select name="sellerId" value={formData.sellerId} onChange={handleChange} required>
            <option value="">Selecione o Vendedor</option>
            {sellers.map(s => <option key={s.id} value={s.id}>{s.name} - {s.email}</option>)}
          </select>
        </div>

        <div className="form-row">
          <div className="date-input-container">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
            <Calendar size={20} className="calendar-icon" onClick={handleCalendarClick} />
          </div>
        </div>

        <textarea
          name="observations"
          placeholder="Observações da venda (opcional)"
          value={formData.observations}
          onChange={handleChange}
          rows={3}
        />

        <div className="items-section">
          <label>Produtos da Venda</label>
          
          {/* Cabeçalhos das colunas */}
          <div className="items-header">
            <div>Produto</div>
            <div>Quantidade</div>
            <div>Preço Unitário</div>
            <div>Preço Total</div>
            <div>Ações</div>
          </div>
          
          {saleItems.map((item, index) => (
            <div key={index} className="item-row">
              <select
                value={item.productId}
                onChange={(e) => updateItem(index, 'productId', Number(e.target.value))}
                required
              >
                <option value={0}>Selecione o Produto</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {p.size} - {p.color} - R$ {p.price.toFixed(2)}
                    {p.stock && ` (Estoque: ${p.stock.quantity})`}
                  </option>
                ))}
              </select>
              
              <input
                type="number"
                className="quantity-input"
                placeholder="Qtd"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                min="1"
                required
              />
              
              <div className="unit-price">
                R$ {item.unitPrice.toFixed(2)}
              </div>
              
              <div className="item-total">
                R$ {(item.quantity * item.unitPrice).toFixed(2)}
              </div>
              
              <button
                type="button"
                className="remove-button"
                onClick={() => removeItem(index)}
              >
                <X size={16} />
              </button>
            </div>
          ))}
          
          <button type="button" className="add-button" onClick={addItem}>
            <Plus size={16} /> Adicionar Produto
          </button>
        </div>

        <div className="total-section">
          <label>Total da Venda:</label>
          <span className="total-value">R$ {formData.total.toFixed(2)}</span>
        </div>

        {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}

        <button type="submit" className="submit-button">
          Cadastrar Venda
        </button>
      </form>
      <NotificationContainer />
    </div>
  );
} 