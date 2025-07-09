import React, { useEffect, useState } from 'react';
import '../styles/ReadSalesPage.css';
import Header from "../components/ui/header";
import Navbar from "../components/ui/navbar";
import { Trash2, Pencil, X, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/axiosConfig';
import { useNotification } from '../components/ui/notification';

interface SaleItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  product: {
    id: number;
    name: string;
    price: number;
    size: string;
    color: string;
  };
}

interface Sale {
  id: number;
  clientId: number;
  sellerId: number;
  date: string;
  total: number;
  observations?: string;
  client: {
    id: number;
    name: string;
    email: string;
  };
  seller: {
    id: number;
    name: string;
    email: string;
  };
  items: SaleItem[];
}

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

interface ApiResponse {
  results: Sale[];
  pagination: {
    length: number;
    size: number;
    lastPage: number;
    page: number;
    startIndex: number;
    endIndex: number;
  };
}

export default function ReadSalesPage() {
  const { showSuccess, showError, NotificationContainer } = useNotification();
  const [sales, setSales] = useState<Sale[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editError, setEditError] = useState<string>('');
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string>('');
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState<boolean>(false);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
  const [search, setSearch] = useState<string>("");
  
  // Dados para edição
  const [clients, setClients] = useState<Client[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/sale/pages`);
        const data: ApiResponse = response.data;
        setSales(data.results);
        setTotalPages(data.pagination.lastPage + 1);
      } catch (error: any) {
        console.error('Erro ao buscar vendas:', error);
      }
    };
    fetchData();
  }, [page]);

  useEffect(() => {
    // Buscar dados para edição
    api.get("/client/pages").then(res => setClients(res.data.results || []));
    api.get("/seller/pages").then(res => setSellers(res.data.results || []));
    api.get("/product/pages").then(res => setProducts(res.data.results || []));
  }, []);

  // Filtro de vendas pelo nome do cliente
  const filteredSales = sales.filter(sale =>
    sale.client.name.toLowerCase().includes(search.toLowerCase())
  );

  const openDetailsModal = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setSelectedSale(null);
    setIsDetailsModalOpen(false);
  };

  const openEditModal = async (sale: Sale) => {
    try {
      const response = await api.get(`/sale/${sale.id}`);
      setEditingSale(response.data);
      setIsEditModalOpen(true);
      setEditError('');
    } catch (error: any) {
      showError('Erro ao carregar dados da venda para edição.');
    }
  };

  const closeEditModal = () => {
    setEditingSale(null);
    setIsEditModalOpen(false);
    setEditError('');
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditingSale(prev => prev ? { ...prev, [name]: value } : prev);
  };

  const handleSaveEdit = async () => {
    if (editingSale) {
      setEditError('');
      if (!editingSale.clientId || !editingSale.sellerId || !editingSale.date) {
        setEditError("Preencha todos os campos obrigatórios");
        return;
      }
      try {
        const payload = {
          clientId: Number(editingSale.clientId),
          sellerId: Number(editingSale.sellerId),
          total: editingSale.total,
          date: editingSale.date,
          observations: editingSale.observations,
          items: editingSale.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }))
        };
        const response = await api.patch(`/sale/${editingSale.id}`, payload);
        if (response.status === 200) {
          const updatedSales = sales.map(sale =>
            sale.id === editingSale.id ? { ...sale, ...editingSale } : sale
          );
          setSales(updatedSales);
          closeEditModal();
          showSuccess('Venda atualizada com sucesso!');
        } else {
          setEditError(response.data?.message || 'Erro ao atualizar venda.');
        }
      } catch (error: any) {
        setEditError(error.response?.data?.message || error.message || 'Erro ao atualizar venda.');
      }
    }
  };

  const openDeleteConfirmation = (sale: Sale) => {
    setSaleToDelete(sale);
    setIsDeleteConfirmationOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setSaleToDelete(null);
    setIsDeleteConfirmationOpen(false);
  };

  const handleDeleteSale = async () => {
    if (saleToDelete) {
      try {
        const response = await api.delete(`/sale/${saleToDelete.id}`);
        if (response.status === 204 || response.status === 200) {
          const updatedSales = sales.filter(s => s.id !== saleToDelete.id);
          setSales(updatedSales);
          
          // Usar a mensagem detalhada do backend se disponível
          let successMessage = 'Venda excluída com sucesso!';
          
          if (response.data?.alert) {
            successMessage = `Venda excluída com sucesso! ${response.data.alert}`;
          } else {
            // Fallback para cálculo manual se o backend não retornar informações detalhadas
            const totalItems = saleToDelete.items.reduce((sum, item) => sum + item.quantity, 0);
            successMessage = `Venda excluída com sucesso! ${totalItems} produto(s) retornaram ao estoque.`;
          }
          
          showSuccess(successMessage);
          setDeleteSuccessMessage(successMessage);
          setTimeout(() => setDeleteSuccessMessage(''), 5000);
        } else {
          showError('Erro ao excluir venda.');
        }
      } catch (error: any) {
        console.error('Erro ao excluir venda:', error);
        showError('Erro ao excluir venda.');
      } finally {
        closeDeleteConfirmation();
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="read-sales-container">
      <Header />
      <Navbar />

      <div className="sales-header">
        <Link to="/sales/create" className="sales-tab">Cadastrar Venda</Link>
        <Link to="/sales" className="sales-tab active">Visualizar Vendas</Link>
      </div>

      {/* Input de pesquisa */}
      <div style={{ margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
        <input
          type="text"
          placeholder="Pesquisar venda pelo nome do cliente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 320, padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 15 }}
        />
      </div>

      {deleteSuccessMessage && <div className="success-message">{deleteSuccessMessage}</div>}

      <div className="sales-list-container">
        <div className="sales-list-header">
          <div>ID</div>
          <div>Data</div>
          <div>Cliente</div>
          <div>Vendedor</div>
          <div>Total</div>
          <div>Itens</div>
          <div>Ações</div>
        </div>
        {filteredSales.length > 0 ? (
          filteredSales.map((sale) => (
            <div key={sale.id} className="sales-list-item">
              <div>#{sale.id}</div>
              <div>{formatDate(sale.date)}</div>
              <div>{sale.client.name}</div>
              <div>{sale.seller.name}</div>
              <div>R$ {sale.total.toFixed(2)}</div>
              <div>{sale.items.length}</div>
              <div className="actions-cell">
                <button className="icon-button view" onClick={() => openDetailsModal(sale)}>
                  <Eye size={16} />
                </button>
                <button className="icon-button edit" onClick={() => openEditModal(sale)}>
                  <Pencil size={16} />
                </button>
                <button className="icon-button delete" onClick={() => openDeleteConfirmation(sale)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-sales">Nenhuma venda encontrada.</div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {isDetailsModalOpen && selectedSale && (
        <div className="details-modal-overlay">
          <div className="details-modal">
            <div className="details-modal-header">
              <h2>Detalhes da Venda #{selectedSale.id}</h2>
              <button className="close-button" onClick={closeDetailsModal}>
                <X size={20} />
              </button>
            </div>
            <div className="details-modal-body">
              <div className="sale-info">
                <div className="info-row">
                  <strong>Data:</strong> {formatDate(selectedSale.date)}
                </div>
                <div className="info-row">
                  <strong>Cliente:</strong> {selectedSale.client.name} ({selectedSale.client.email})
                </div>
                <div className="info-row">
                  <strong>Vendedor:</strong> {selectedSale.seller.name} ({selectedSale.seller.email})
                </div>
                <div className="info-row">
                  <strong>Total:</strong> R$ {selectedSale.total.toFixed(2)}
                </div>
                {selectedSale.observations && (
                  <div className="info-row">
                    <strong>Observações:</strong> {selectedSale.observations}
                  </div>
                )}
              </div>

              <div className="items-section">
                <h3>Produtos da Venda</h3>
                <div className="items-table">
                  <div className="items-header">
                    <div>Produto</div>
                    <div>Tamanho</div>
                    <div>Cor</div>
                    <div>Qtd</div>
                    <div>Preço Unit.</div>
                    <div>Subtotal</div>
                  </div>
                  {selectedSale.items.map((item, index) => (
                    <div key={index} className="item-row">
                      <div>{item.product.name}</div>
                      <div>{item.product.size}</div>
                      <div>{item.product.color}</div>
                      <div>{item.quantity}</div>
                      <div>R$ {item.unitPrice.toFixed(2)}</div>
                      <div>R$ {(item.quantity * item.unitPrice).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {isEditModalOpen && editingSale && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <div className="edit-modal-header">
              <h2>Editar Venda #{editingSale.id}</h2>
              <button className="close-button" onClick={closeEditModal}>
                <X size={20} />
              </button>
            </div>
            <div className="edit-modal-body">
              {editError && <div className="error-message">{editError}</div>}
              
              <div className="form-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <select name="clientId" value={editingSale.clientId} onChange={handleEditInputChange} required style={{ flex: 1, minWidth: 180 }}>
                  <option value="">Selecione o Cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name} - {c.email}</option>)}
                </select>
                <select name="sellerId" value={editingSale.sellerId} onChange={handleEditInputChange} required style={{ flex: 1, minWidth: 180 }}>
                  <option value="">Selecione o Vendedor</option>
                  {sellers.map(s => <option key={s.id} value={s.id}>{s.name} - {s.email}</option>)}
                </select>
              </div>

              <div className="form-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
                <input
                  type="date"
                  name="date"
                  value={editingSale.date ? editingSale.date.slice(0, 10) : ''}
                  onChange={handleEditInputChange}
                  required
                  style={{ flex: 1, minWidth: 180 }}
                />
              </div>

              <textarea
                name="observations"
                placeholder="Observações da venda (opcional)"
                value={editingSale.observations || ''}
                onChange={handleEditInputChange}
                rows={3}
                style={{ width: '100%', marginTop: 12 }}
              />

              <div className="items-section">
                <h3>Produtos da Venda</h3>
                {editingSale.items.map((item, index) => (
                  <div key={index} className="item-row">
                    <select
                      value={item.productId}
                      onChange={(e) => {
                        const newItems = [...editingSale.items];
                        newItems[index] = { ...newItems[index], productId: Number(e.target.value) };
                        setEditingSale(prev => prev ? { ...prev, items: newItems } : prev);
                      }}
                      required
                    >
                      <option value={0}>Selecione o Produto</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} - {p.size} - {p.color} - R$ {p.price.toFixed(2)}
                        </option>
                      ))}
                    </select>
                    
                    <input
                      type="number"
                      placeholder="Quantidade"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...editingSale.items];
                        newItems[index] = { ...newItems[index], quantity: Number(e.target.value) };
                        setEditingSale(prev => prev ? { ...prev, items: newItems } : prev);
                      }}
                      min="1"
                      required
                    />
                    
                    <input
                      type="number"
                      placeholder="Preço Unitário"
                      value={item.unitPrice}
                      onChange={(e) => {
                        const newItems = [...editingSale.items];
                        newItems[index] = { ...newItems[index], unitPrice: Number(e.target.value) };
                        setEditingSale(prev => prev ? { ...prev, items: newItems } : prev);
                      }}
                      min="0"
                      step="0.01"
                      required
                    />
                    
                    <span className="item-total">
                      R$ {(item.quantity * item.unitPrice).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="total-section">
                <label>Total da Venda:</label>
                <span className="total-value">
                  R$ {editingSale.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="edit-modal-footer">
              <button className="cancel-button" onClick={closeEditModal}>Cancelar</button>
              <button className="save-button" onClick={handleSaveEdit}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {isDeleteConfirmationOpen && saleToDelete && (
        <div className="delete-confirmation-overlay">
          <div className="delete-confirmation-modal">
            <h2>Você realmente deseja excluir esta venda?</h2>
            <p><strong>Cliente:</strong> {saleToDelete.client.name}</p>
            <p><strong>Vendedor:</strong> {saleToDelete.seller.name}</p>
            <p><strong>Total:</strong> R$ {saleToDelete.total.toFixed(2)}</p>
            
            <div className="stock-return-info">
              <h3>⚠️ Produtos que voltarão ao estoque:</h3>
              <div className="products-list">
                {saleToDelete.items.map((item, index) => (
                  <div key={index} className="product-item">
                    <span className="product-name">• {item.product.name}</span>
                    <span className="product-details"> ({item.product.size} - {item.product.color})</span>
                    <span className="quantity-return"> - <strong>{item.quantity} unidade(s)</strong> voltarão ao estoque</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="delete-confirmation-buttons">
              <button className="cancel-button" onClick={closeDeleteConfirmation}>
                Cancelar
              </button>
              <button className="delete-button" onClick={handleDeleteSale}>
                Excluir e Retornar ao Estoque
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pagination">
        <button onClick={() => setPage(1)} disabled={page === 1}>«</button>
        <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>‹</button>
        <span>
          Página <strong>{page}</strong> de {totalPages}
        </span>
        <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>›</button>
        <button onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
        <button className="update-button" onClick={() => window.location.reload()}>Atualizar</button>
      </div>
      <NotificationContainer />
    </div>
  );
} 