import React, { useEffect, useState } from 'react';
import '../styles/ReadProductsPage.css';
import Header from "../components/ui/header";
import Navbar from "../components/ui/navbar";
import { Trash2, Pencil, MoreVertical, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/axiosConfig';
import { useNotification } from '../components/ui/notification';

const SIZE_OPTIONS = ["P", "M", "G", "GG", "XG"];
const COLOR_OPTIONS = ["Preto", "Branco", "Vermelho", "Azul", "Rosa", "Bege", "Cinza", "Verde"];

interface Product {
  id: number;
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  supplier: { id: number; name: string } | null;
  supplierId?: number | null;
  // Removido: category e promotion
}

interface ApiResponse {
  results: Product[];
  pagination: {
    length: number;
    size: number;
    lastPage: number;
    page: number;
    startIndex: number;
    endIndex: number;
  };
}

export default function ReadProductsPage() {
  const { showSuccess, showError, NotificationContainer } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editError, setEditError] = useState<string>('');
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string>('');
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productSales, setProductSales] = useState<any[]>([]);
  const [salesCount, setSalesCount] = useState<number>(0);
  const [deleteOption, setDeleteOption] = useState<string>('');
  const [search, setSearch] = useState<string>("");
  const [suppliers, setSuppliers] = useState<{id: number; name: string; status?: string}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/product/pages`);
        const data: ApiResponse = response.data;
        setProducts(data.results);
        setTotalPages(data.pagination.lastPage + 1);
      } catch (error: any) {
        console.error('Erro ao buscar produtos:', error);
      }
    };
    fetchData();
  }, [page]);

  useEffect(() => {
    // Buscar suppliers para edição
    api.get("/supplier/pages").then(res => setSuppliers(res.data.results || []));
  }, []);

  // Filtro de produtos pelo nome
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const openEditModal = async (productId: number) => {
    try {
      const response = await api.get(`/product/${productId}`);
      setEditingProduct(response.data);
      setIsEditModalOpen(true);
      setEditError('');
    } catch (error: any) {
      showError('Erro ao carregar dados do produto para edição.');
    }
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setIsEditModalOpen(false);
    setEditError('');
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditingProduct(prev => prev ? { ...prev, [name]: value } : prev);
  };

  const handleSaveEdit = async () => {
    if (editingProduct) {
      setEditError('');
      if (!editingProduct.name || !editingProduct.price || !editingProduct.size || !editingProduct.color || editingProduct.quantity === undefined) {
        setEditError("Preencha todos os campos obrigatórios");
        return;
      }
      
      // Validar quantidade
      if (editingProduct.quantity <= 0) {
        setEditError("A quantidade deve ser maior que zero");
        return;
      }
      
      // Validar preço
      if (editingProduct.price <= 0) {
        setEditError("O preço deve ser maior que zero");
        return;
      }
      
      try {
        const payload = {
          name: editingProduct.name,
          price: Number(editingProduct.price),
          size: editingProduct.size,
          color: editingProduct.color,
          quantity: Number(editingProduct.quantity),
          supplierId: editingProduct.supplierId || editingProduct.supplier?.id || null,
          // Removido: categoryId e promotionId
        };
        const response = await api.patch(`/product/${editingProduct.id}`, payload);
        if (response.status === 200) {
          const updatedProducts = products.map(product =>
            product.id === editingProduct.id ? { ...product, ...editingProduct } : product
          );
          setProducts(updatedProducts);
          closeEditModal();
          showSuccess('Produto atualizado com sucesso!');
        } else {
          setEditError(response.data?.message || 'Erro ao atualizar produto.');
        }
      } catch (error: any) {
        setEditError(error.response?.data?.message || error.message || 'Erro ao atualizar produto.');
      }
    }
  };

  const openDeleteConfirmation = async (product: Product) => {
    setProductToDelete(product);
    setDeleteOption('');
    
    try {
      // Busca vendas que contêm este produto
      const response = await api.get(`/product/${product.id}/sales`);
      const sales = response.data || [];
      setProductSales(sales);
      setSalesCount(sales.length);
    } catch (error: any) {
      console.error('Erro ao buscar vendas do produto:', error);
      setProductSales([]);
      setSalesCount(0);
    }
    
    setIsDeleteConfirmationOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setProductToDelete(null);
    setIsDeleteConfirmationOpen(false);
    setDeleteOption('');
    setProductSales([]);
    setSalesCount(0);
  };

  const handleDeleteProduct = async () => {
    if (productToDelete && deleteOption) {
      try {
        let response;
        let successMessage = '';

        switch (deleteOption) {
          case 'deleteOnly':
            response = await api.delete(`/product/${productToDelete.id}`);
            successMessage = 'Produto excluído com sucesso!';
            break;
          case 'deleteWithSales':
            response = await api.delete(`/product/${productToDelete.id}/force`);
            successMessage = 'Produto e vendas relacionadas excluídas com sucesso!';
            break;
          default:
            showError('Por favor, selecione uma opção.');
            return;
        }

        if (response.status === 204 || response.status === 200) {
          const updatedProducts = products.filter(p => p.id !== productToDelete.id);
          setProducts(updatedProducts);
          showSuccess(successMessage);
          setDeleteSuccessMessage(successMessage);
          setTimeout(() => setDeleteSuccessMessage(''), 5000);
        } else {
          showError('Erro ao excluir produto.');
        }
      } catch (error: any) {
        console.error('Erro ao excluir produto:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Erro ao excluir produto.';
        showError(errorMessage);
      } finally {
        closeDeleteConfirmation();
      }
    }
  };

  return (
    <div className="read-products-container">
      <Header />
      <Navbar />
      <div className="products-header">
        <Link to="/products/create" className="products-tab">Cadastrar Produto</Link>
        <Link to="/products" className="products-tab active">Visualizar Produtos</Link>
      </div>
      {/* Input de pesquisa */}
      <div style={{ margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
        <input
          type="text"
          placeholder="Pesquisar produto pelo nome..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 320, padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 15 }}
        />
      </div>
      {deleteSuccessMessage && <div className="success-message">{deleteSuccessMessage}</div>}
      <div className="products-list-container">
        <div className="products-list-header">
          <div>Nome</div>
          <div>Preço</div>
          <div>Tamanho</div>
          <div>Cor</div>
          <div>Quantidade</div>
          <div>Fornecedor</div>
          <div>Ações</div>
        </div>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.id} className="products-list-item">
              <div>{product.name}</div>
              <div>R$ {Number(product.price).toFixed(2)}</div>
              <div>{product.size}</div>
              <div>{product.color}</div>
              <div>{product.quantity}</div>
              <div>{product.supplier?.name || "Sem fornecedor"}</div>
              <div className="actions-cell">
                <button className="icon-button delete" onClick={() => openDeleteConfirmation(product)}><Trash2 size={16} /></button>
                <button className="icon-button edit" onClick={() => openEditModal(product.id)}><Pencil size={16} /></button>
                <button className="icon-button more"><MoreVertical size={16} /></button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-products">Nenhum produto cadastrado.</div>
        )}
      </div>
      {isEditModalOpen && editingProduct && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <div className="edit-modal-header">
              <h2>Editar Produto</h2>
              <button className="close-button" onClick={closeEditModal}><X size={20} /></button>
            </div>
            <div className="edit-modal-body">
              {editError && <div className="error-message">{editError}</div>}
              <div className="form-group">
                <label htmlFor="name">Nome:</label>
                <input type="text" id="name" name="name" value={editingProduct.name} onChange={handleEditInputChange} maxLength={100} />
              </div>
              <div className="form-group">
                <label htmlFor="price">Preço:</label>
                <input type="number" id="price" name="price" value={editingProduct.price} onChange={handleEditInputChange} min="0" step="0.01" />
              </div>
              <div className="form-group">
                <label htmlFor="size">Tamanho:</label>
                <select id="size" name="size" value={editingProduct.size} onChange={handleEditInputChange} required>
                  <option value="">Selecione o Tamanho</option>
                  {SIZE_OPTIONS.map(size => <option key={size} value={size}>{size}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="color">Cor:</label>
                <select id="color" name="color" value={editingProduct.color} onChange={handleEditInputChange} required>
                  <option value="">Selecione a Cor</option>
                  {COLOR_OPTIONS.map(color => <option key={color} value={color}>{color}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="quantity">Quantidade:</label>
                <input type="number" id="quantity" name="quantity" value={editingProduct.quantity} onChange={handleEditInputChange} min="0" />
              </div>
              <div className="form-group">
                <label htmlFor="supplierId">Fornecedor:</label>
                <select 
                  id="supplierId" 
                  name="supplierId" 
                  value={editingProduct.supplierId || editingProduct.supplier?.id || ""} 
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, supplierId: Number(e.target.value) || null } : prev)}
                >
                  <option value="" disabled>Selecione um fornecedor</option>
                  {suppliers.filter(supplier => supplier.status !== 'INATIVO').map(supplier => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="edit-modal-footer">
              <button className="cancel-button" onClick={closeEditModal}>Cancelar</button>
              <button className="save-button" onClick={handleSaveEdit}>Salvar</button>
            </div>
          </div>
        </div>
      )}
      {isDeleteConfirmationOpen && productToDelete && (
        <div className="delete-confirmation-overlay">
          <div className="delete-confirmation-modal advanced">
            <div className="modal-header">
              <h2>Gerenciar Produto</h2>
              <button className="close-button" onClick={closeDeleteConfirmation}>
                <X size={20} />
              </button>
            </div>
            
            <div className="product-info">
              <p><strong>Produto:</strong> {productToDelete.name}</p>
              <p><strong>Preço:</strong> R$ {Number(productToDelete.price).toFixed(2)}</p>
              <p><strong>Estoque:</strong> {productToDelete.quantity} unidade(s)</p>
              <p><strong>Fornecedor:</strong> {productToDelete.supplier?.name || 'Sem fornecedor'}</p>
              <p><strong>Vendas relacionadas:</strong> {salesCount}</p>
            </div>

            {salesCount > 0 && (
              <div className="sales-warning">
                <h4>⚠️ Este produto está presente em {salesCount} venda(s)!</h4>
                <p>Se você excluir este produto, as vendas relacionadas podem ser afetadas.</p>
              </div>
            )}

            <div className="delete-options">
              <h3>Escolha uma opção:</h3>
              
              <div className="option-group">
                <input
                  type="radio"
                  id="deleteOnly"
                  name="deleteOption"
                  value="deleteOnly"
                  checked={deleteOption === 'deleteOnly'}
                  onChange={(e) => setDeleteOption(e.target.value)}
                />
                <label htmlFor="deleteOnly" className="option-label">
                  <div className="option-content">
                    <strong>Excluir apenas o produto</strong>
                    <span>
                      {salesCount > 0 
                        ? `As ${salesCount} venda(s) manterão a referência ao produto excluído` 
                        : 'O produto será excluído (sem vendas relacionadas)'
                      }
                    </span>
                  </div>
                </label>
              </div>

              {salesCount > 0 && (
                <div className="option-group warning">
                  <input
                    type="radio"
                    id="deleteWithSales"
                    name="deleteOption"
                    value="deleteWithSales"
                    checked={deleteOption === 'deleteWithSales'}
                    onChange={(e) => setDeleteOption(e.target.value)}
                  />
                  <label htmlFor="deleteWithSales" className="option-label">
                    <div className="option-content">
                      <strong>Excluir produto e vendas relacionadas</strong>
                      <span className="warning-text">⚠️ ATENÇÃO: Isso excluirá permanentemente o produto e todas as {salesCount} venda(s) associadas</span>
                    </div>
                  </label>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="cancel-button" onClick={closeDeleteConfirmation}>
                Cancelar
              </button>
              <button 
                className={`confirm-button ${deleteOption === 'deleteWithSales' ? 'danger' : ''}`}
                onClick={handleDeleteProduct}
                disabled={!deleteOption}
              >
                {deleteOption === 'deleteOnly' && 'Excluir Produto'}
                {deleteOption === 'deleteWithSales' && 'Excluir Tudo'}
                {!deleteOption && 'Selecione uma opção'}
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