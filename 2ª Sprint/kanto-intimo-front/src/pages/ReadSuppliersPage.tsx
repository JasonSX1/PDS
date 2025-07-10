import React, { useEffect, useState } from 'react';
import '../styles/ReadSupp    try {
        const response = await api.get(`/supplier/pages`);
        const data: ApiResponse = response.data;
        setSellers(data.results);
        setTotalPages(data.pagination.lastPage + 1);
      } catch (error: any) {.css';
import Header from "../components/ui/header";
import Navbar from "../components/ui/navbar";
import { Trash2, Pencil, MoreVertical, X, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/axiosConfig';
import { useNotification } from '../components/ui/notification';

interface Address {
  street: string;
  number: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Supplier {
  id: number;
  name: string;
  cnpj: string;
  phones: string[];
  emails: string[];
  address: Address;
  status?: string;
}

interface ApiResponse {
  results: Supplier[];
  pagination: {
    length: number;
    size: number;
    lastPage: number;
    page: number;
    startIndex: number;
    endIndex: number;
  };
}

const estadosBrasileiros = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const formatInput = (value: string, pattern: string) => {
  if (!value) return '';
  const numbers = value.replace(/\D/g, '');
  let formatted = '';
  let numberIndex = 0;
  for (let i = 0; i < pattern.length && numberIndex < numbers.length; i++) {
    if (pattern[i] === '9') {
      formatted += numbers[numberIndex++];
    } else {
      formatted += pattern[i];
    }
  }
  return formatted;
};

function ReadSuppliersPage() {
  const { showSuccess, showError, NotificationContainer } = useNotification();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editError, setEditError] = useState<string>('');
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string>('');
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState<boolean>(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [supplierProducts, setSupplierProducts] = useState<any[]>([]);
  const [productsCount, setProductsCount] = useState<number>(0);
  const [deleteOption, setDeleteOption] = useState<string>('');
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Buscando fornecedores...');
        const response = await api.get(`/supplier/pages`);
        const data: ApiResponse = response.data;
        console.log("Dados da API:", data);
        console.log("Fornecedores com status:", data.results.map(s => ({ id: s.id, name: s.name, status: s.status })));
        setSuppliers(data.results);
        setTotalPages(data.pagination.lastPage + 1);
      } catch (error: any) {
        console.error('Erro ao buscar fornecedores:', error);
      }
    };
    fetchData();
  }, [page]);

  const openEditModal = async (supplierId: number) => {
    try {
      const response = await api.get(`/supplier/${supplierId}`);
      const supplierData: Supplier = response.data;
      setEditingSupplier(supplierData);
      setIsEditModalOpen(true);
      setEditError('');
    } catch (error: any) {
      console.error('Erro ao carregar dados do fornecedor para edição:', error);
      showError('Erro ao carregar dados do fornecedor para edição.');
    }
  };

  const closeEditModal = () => {
    setEditingSupplier(null);
    setIsEditModalOpen(false);
    setEditError('');
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'name' || name === 'address.city') {
      if (!/^[a-zA-Z\s\u00C0-\u00FF]*$/.test(value)) return;
      formattedValue = value;
    } else if (name === 'cnpj') {
      if (/\D/.test(value.replace(/\D/g, ''))) return;
      formattedValue = formatInput(value, '99.999.999/9999-99');
    } else if (name === 'address.zipCode') {
      if (/\D/.test(value.replace(/\D/g, ''))) return;
      formattedValue = formatInput(value, '99999-999');
    } else if (name === 'address.state') {
      if (/\d/.test(value)) return;
      formattedValue = value.toUpperCase();
    } else if (name === 'address.number') {
      if (/\D/.test(value)) return;
      formattedValue = value;
    }

    setEditingSupplier(prev => {
      if (!prev) return prev;
      if (name.startsWith('address.')) {
        const addressPart = name.split('.')[1];
        return {
          ...prev,
          address: {
            ...prev.address,
            [addressPart]: formattedValue,
          },
        };
      } else {
        return { ...prev, [name]: formattedValue };
      }
    });
  };

  const handlePhoneChange = (index: number, value: string) => {
    let formattedValue = value;
    if (/\D/.test(value.replace(/\D/g, ''))) return;
    formattedValue = formatInput(value, '(99) 99999-9999');

    setEditingSupplier(prev => {
      if (!prev) return prev;
      const newPhones = [...prev.phones];
      newPhones[index] = formattedValue;
      return { ...prev, phones: newPhones };
    });
  };

  const handleEmailChange = (index: number, value: string) => {
    setEditingSupplier(prev => {
      if (!prev) return prev;
      const newEmails = [...prev.emails];
      newEmails[index] = value;
      return { ...prev, emails: newEmails };
    });
  };

  const addPhone = () => {
    setEditingSupplier(prev => {
      if (!prev) return prev;
      return { ...prev, phones: [...prev.phones, ""] };
    });
  };

  const removePhone = (index: number) => {
    setEditingSupplier(prev => {
      if (!prev || prev.phones.length <= 1) return prev;
      const newPhones = prev.phones.filter((_, i) => i !== index);
      return { ...prev, phones: newPhones };
    });
  };

  const addEmail = () => {
    setEditingSupplier(prev => {
      if (!prev) return prev;
      return { ...prev, emails: [...prev.emails, ""] };
    });
  };

  const removeEmail = (index: number) => {
    setEditingSupplier(prev => {
      if (!prev || prev.emails.length <= 1) return prev;
      const newEmails = prev.emails.filter((_, i) => i !== index);
      return { ...prev, emails: newEmails };
    });
  };

  const handleSaveEdit = async () => {
    if (editingSupplier) {
      setEditError('');

      if (!estadosBrasileiros.includes(editingSupplier.address.state)) {
        setEditError("Por favor, selecione um estado válido (sigla de 2 letras)");
        return;
      }

      if (editingSupplier.name.length > 100) {
        setEditError("Nome não pode exceder 100 caracteres");
        return;
      }

      // Filtrar telefones e emails vazios
      const validPhones = editingSupplier.phones.filter(phone => phone.trim() !== "");
      const validEmails = editingSupplier.emails.filter(email => email.trim() !== "");

      if (validPhones.length === 0) {
        setEditError("Pelo menos um telefone é obrigatório");
        return;
      }

      try {
        const payload = {
          name: editingSupplier.name.trim(),
          cnpj: editingSupplier.cnpj.replace(/\D/g, ""),
          phones: validPhones.map(phone => phone.replace(/\D/g, "")),
          emails: validEmails.length > 0 ? validEmails : undefined,
          address: {
            zipCode: editingSupplier.address.zipCode.replace(/\D/g, ""),
            street: editingSupplier.address.street,
            number: editingSupplier.address.number,
            city: editingSupplier.address.city,
            state: editingSupplier.address.state.toUpperCase()
          }
        };

        const response = await api.patch(`/supplier/${editingSupplier.id}`, payload);

        if (response.status === 200) {
          const updatedSuppliers = suppliers.map(supplier =>
            supplier.id === editingSupplier.id
              ? { ...supplier, ...payload, phones: validPhones, emails: validEmails }
              : supplier
          );
          setSuppliers(updatedSuppliers);
          closeEditModal();
          showSuccess('Fornecedor atualizado com sucesso!');
        } else {
          console.error('Erro ao atualizar fornecedor:', response.data);
          setEditError(response.data?.message || 'Erro ao atualizar fornecedor.');
        }
      } catch (error: any) {
        console.error('Erro ao enviar atualização:', error);
        setEditError(error.response?.data?.message || error.message || 'Erro ao atualizar fornecedor.');
      }
    }
  };

  const openDeleteConfirmation = async (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setDeleteOption('');
    
    try {
      // Busca a contagem de produtos do fornecedor
      const countResponse = await api.get(`/supplier/${supplier.id}/products/count`);
      setProductsCount(countResponse.data.count);
      
      // Se há produtos, busca a lista deles
      if (countResponse.data.count > 0) {
        const productsResponse = await api.get(`/product`, {
          params: { supplierId: supplier.id }
        });
        setSupplierProducts(productsResponse.data.results || []);
      } else {
        setSupplierProducts([]);
      }
    } catch (error: any) {
      console.error('Erro ao buscar produtos do fornecedor:', error);
      setProductsCount(0);
      setSupplierProducts([]);
    }
    
    setIsDeleteConfirmationOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setSupplierToDelete(null);
    setIsDeleteConfirmationOpen(false);
    setDeleteOption('');
    setProductsCount(0);
    setSupplierProducts([]);
  };

  const handleDeleteSupplier = async () => {
    if (supplierToDelete && deleteOption) {
      try {
        let response;
        let successMessage = '';

        switch (deleteOption) {
          case 'disable':
            response = await api.patch(`/supplier/${supplierToDelete.id}/disable`);
            successMessage = 'Fornecedor desabilitado com sucesso!';
            break;
          case 'deleteWithProducts':
            response = await api.delete(`/supplier/${supplierToDelete.id}/force`);
            successMessage = 'Fornecedor e produtos excluídos com sucesso!';
            break;
          case 'deleteAndDissociate':
            response = await api.delete(`/supplier/${supplierToDelete.id}/dissociate`);
            successMessage = 'Fornecedor excluído e produtos desassociados com sucesso!';
            break;
          default:
            showError('Por favor, selecione uma opção.');
            return;
        }

        if (response.status === 204 || response.status === 200) {
          if (deleteOption === 'disable') {
            // Atualiza o fornecedor na lista (adiciona status inativo se necessário)
            const updatedSuppliers = suppliers.map(s => 
              s.id === supplierToDelete.id 
                ? { ...s, status: 'INATIVO' } 
                : s
            );
            setSuppliers(updatedSuppliers);
          } else {
            // Remove o fornecedor da lista
            const updatedSuppliers = suppliers.filter(s => s.id !== supplierToDelete.id);
            setSuppliers(updatedSuppliers);
          }
          
          setDeleteSuccessMessage(successMessage);
          setTimeout(() => setDeleteSuccessMessage(''), 3000);
        } else {
          console.error('Erro ao processar operação:', response.data);
          showError(response.data?.message || 'Erro ao processar operação.');
        }
      } catch (error: any) {
        console.error('Erro ao processar operação:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Erro ao processar operação.';
        showError(errorMessage);
      } finally {
        closeDeleteConfirmation();
      }
    }
  };

  const handleReactivateSupplier = async (supplier: Supplier) => {
    try {
      console.log('Tentando reabilitar fornecedor:', supplier.id);
      const response = await api.patch(`/supplier/${supplier.id}/enable`);
      console.log('Resposta do servidor:', response);
      
      if (response.status === 200 || response.status === 204) {
        const updatedSuppliers = suppliers.map(s => 
          s.id === supplier.id 
            ? { ...s, status: 'ATIVO' } 
            : s
        );
        setSuppliers(updatedSuppliers);
        setDeleteSuccessMessage('Fornecedor reabilitado com sucesso!');
        setTimeout(() => setDeleteSuccessMessage(''), 3000);
      } else {
        console.error('Erro ao reabilitar fornecedor:', response.data);
        showError('Erro ao reabilitar fornecedor.');
      }
    } catch (error: any) {
      console.error('Erro ao reabilitar fornecedor:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao reabilitar fornecedor.';
      showError(errorMessage);
    }
  };

  // Filtro de fornecedores pelo nome ou CNPJ
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(search.toLowerCase()) ||
    supplier.cnpj.includes(search)
  );

  return (
    <div className="read-suppliers-container">
      <Header />
      <Navbar />

      <div className="suppliers-header">
        <Link to="/suppliers/create" className="suppliers-tab">Cadastrar Fornecedor</Link>
        <Link to="/suppliers" className="suppliers-tab active">Visualizar Fornecedor</Link>
      </div>

      {/* Input de pesquisa */}
      <div style={{ margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
        <input
          type="text"
          placeholder="Pesquisar fornecedor pelo nome ou CNPJ..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 320, padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 15 }}
        />
      </div>

      {deleteSuccessMessage && <div className="success-message">{deleteSuccessMessage}</div>}

      <div className="suppliers-list-container">
        <div className="suppliers-list-header">
          <div>Nome</div>
          <div>CNPJ</div>
          <div>Status</div>
          <div>Telefones</div>
          <div>E-mails</div>
          <div>Ações</div>
        </div>
        {filteredSuppliers.length > 0 ? (
          filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className="suppliers-list-item">
              <div>
                <Link to={`/supplier/${supplier.id}`} className="supplier-name-link">
                  {supplier.name}
                </Link>
              </div>
              <div>{formatInput(supplier.cnpj, '99.999.999/9999-99')}</div>
              <div>
                <span className={`status-badge ${supplier.status === 'INATIVO' ? 'status-inactive' : 'status-active'}`}>
                  {supplier.status === 'INATIVO' ? 'Desabilitado' : 'Habilitado'}
                </span>
              </div>
              <div>{supplier.phones.map(phone => formatInput(phone, '(99) 99999-9999')).join(', ')}</div>
              <div>{supplier.emails.join(', ') || 'N/A'}</div>
              <div className="actions-cell">
                {supplier.status === 'INATIVO' ? (
                  <>
                    <button 
                      className="icon-button reactivate" 
                      onClick={() => handleReactivateSupplier(supplier)}
                      title="Reabilitar fornecedor"
                    >
                      <Plus size={16} />
                    </button>
                    <button className="icon-button edit" onClick={() => openEditModal(supplier.id)}><Pencil size={16} /></button>
                  </>
                ) : (
                  <>
                    <button className="icon-button delete" onClick={() => openDeleteConfirmation(supplier)}><Trash2 size={16} /></button>
                    <button className="icon-button edit" onClick={() => openEditModal(supplier.id)}><Pencil size={16} /></button>
                  </>
                )}
                <button className="icon-button more"><MoreVertical size={16} /></button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-suppliers">Nenhum fornecedor cadastrado.</div>
        )}
      </div>

      {isEditModalOpen && editingSupplier && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <div className="edit-modal-header">
              <h2>Editar Fornecedor</h2>
              <button className="close-button" onClick={closeEditModal}><X size={20} /></button>
            </div>
            <div className="edit-modal-body">
              {editError && <div className="error-message">{editError}</div>}
              <div className="form-group">
                <label htmlFor="name">Nome:</label>
                <input type="text" id="name" name="name" value={editingSupplier.name} onChange={handleEditInputChange} maxLength={100} />
              </div>
              <div className="form-group">
                <label htmlFor="cnpj">CNPJ:</label>
                <input type="text" id="cnpj" name="cnpj" value={formatInput(editingSupplier.cnpj, '99.999.999/9999-99')} onChange={handleEditInputChange} maxLength={18} />
              </div>
              
              <div className="form-group">
                <label>Telefones:</label>
                {editingSupplier.phones.map((phone, index) => (
                  <div key={index} className="input-with-button">
                    <input
                      type="text"
                      placeholder="Telefone ((99) 99999-9999)"
                      value={formatInput(phone, '(99) 99999-9999')}
                      onChange={(e) => handlePhoneChange(index, e.target.value)}
                      maxLength={16}
                      required={index === 0}
                    />
                    {editingSupplier.phones.length > 1 && (
                      <button
                        type="button"
                        className="remove-button"
                        onClick={() => removePhone(index)}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="add-button" onClick={addPhone}>
                  <Plus size={16} /> Adicionar Telefone
                </button>
              </div>

              <div className="form-group">
                <label>E-mails (opcional):</label>
                {editingSupplier.emails.map((email, index) => (
                  <div key={index} className="input-with-button">
                    <input
                      type="email"
                      placeholder="E-mail"
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      maxLength={100}
                    />
                    {editingSupplier.emails.length > 1 && (
                      <button
                        type="button"
                        className="remove-button"
                        onClick={() => removeEmail(index)}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="add-button" onClick={addEmail}>
                  <Plus size={16} /> Adicionar E-mail
                </button>
              </div>

              <div className="form-group address-group">
                <label>Endereço:</label>
                <input
                  type="text"
                  name="address.zipCode"
                  placeholder="CEP (99999-999)"
                  value={formatInput(editingSupplier.address.zipCode, '99999-999')}
                  onChange={handleEditInputChange}
                  maxLength={9}
                />
                <input
                  type="text"
                  name="address.state"
                  placeholder="Estado (sigla)"
                  value={editingSupplier.address.state}
                  onChange={handleEditInputChange}
                  maxLength={2}
                />
                <input
                  type="text"
                  name="address.street"
                  placeholder="Rua"
                  value={editingSupplier.address.street}
                  onChange={handleEditInputChange}
                  maxLength={100}
                />
                <input
                  type="text"
                  name="address.number"
                  placeholder="Número"
                  value={editingSupplier.address.number}
                  onChange={handleEditInputChange}
                  maxLength={10}
                />
                <input
                  type="text"
                  name="address.city"
                  placeholder="Cidade"
                  value={editingSupplier.address.city}
                  onChange={handleEditInputChange}
                  maxLength={50}
                />
              </div>
            </div>
            <div className="edit-modal-footer">
              <button className="cancel-button" onClick={closeEditModal}>Cancelar</button>
              <button className="save-button" onClick={handleSaveEdit}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {isDeleteConfirmationOpen && supplierToDelete && (
        <div className="delete-confirmation-overlay">
          <div className="delete-confirmation-modal advanced">
            <div className="modal-header">
              <h2>Gerenciar Fornecedor</h2>
              <button className="close-button" onClick={closeDeleteConfirmation}>
                <X size={20} />
              </button>
            </div>
            
            <div className="supplier-info">
              <p><strong>Fornecedor:</strong> {supplierToDelete.name}</p>
              <p><strong>CNPJ:</strong> {formatInput(supplierToDelete.cnpj, '99.999.999/9999-99')}</p>
              <p><strong>Produtos cadastrados:</strong> {productsCount}</p>
            </div>

            {productsCount > 0 && (
              <div className="products-list">
                <h4>Produtos associados:</h4>
                <div className="products-container">
                  {supplierProducts.slice(0, 5).map((product, index) => (
                    <div key={index} className="product-item">
                      • {product.name} - Estoque: {product.quantity}
                    </div>
                  ))}
                  {supplierProducts.length > 5 && (
                    <div className="more-products">
                      ... e mais {supplierProducts.length - 5} produto(s)
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="delete-options">
              <h3>Escolha uma opção:</h3>
              
              <div className="option-group">
                <label className="option-label">
                  <input
                    type="radio"
                    name="deleteOption"
                    value="disable"
                    checked={deleteOption === 'disable'}
                    onChange={(e) => setDeleteOption(e.target.value)}
                  />
                  <div className="option-content">
                    <strong>Desabilitar fornecedor</strong>
                    <span>O fornecedor será marcado como inativo, mas os dados serão preservados</span>
                  </div>
                </label>
              </div>

              {productsCount > 0 && (
                <>
                  <div className="option-group">
                    <label className="option-label">
                      <input
                        type="radio"
                        name="deleteOption"
                        value="deleteAndDissociate"
                        checked={deleteOption === 'deleteAndDissociate'}
                        onChange={(e) => setDeleteOption(e.target.value)}
                      />
                      <div className="option-content">
                        <strong>Excluir fornecedor e desassociar produtos</strong>
                        <span>O fornecedor será excluído e os {productsCount} produto(s) ficarão sem fornecedor</span>
                      </div>
                    </label>
                  </div>

                  <div className="option-group warning">
                    <label className="option-label">
                      <input
                        type="radio"
                        name="deleteOption"
                        value="deleteWithProducts"
                        checked={deleteOption === 'deleteWithProducts'}
                        onChange={(e) => setDeleteOption(e.target.value)}
                      />
                      <div className="option-content">
                        <strong>Excluir fornecedor e todos os produtos</strong>
                        <span className="warning-text">⚠️ ATENÇÃO: Isso excluirá permanentemente o fornecedor e todos os {productsCount} produto(s) associados</span>
                      </div>
                    </label>
                  </div>
                </>
              )}

              {productsCount === 0 && (
                <div className="option-group">
                  <label className="option-label">
                    <input
                      type="radio"
                      name="deleteOption"
                      value="deleteWithProducts"
                      checked={deleteOption === 'deleteWithProducts'}
                      onChange={(e) => setDeleteOption(e.target.value)}
                    />
                    <div className="option-content">
                      <strong>Excluir fornecedor</strong>
                      <span>O fornecedor será excluído permanentemente (sem produtos associados)</span>
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
                className={`confirm-button ${deleteOption === 'deleteWithProducts' ? 'danger' : ''}`}
                onClick={handleDeleteSupplier}
                disabled={!deleteOption}
              >
                {deleteOption === 'disable' && 'Desabilitar'}
                {deleteOption === 'deleteAndDissociate' && 'Excluir e Desassociar'}
                {deleteOption === 'deleteWithProducts' && 'Excluir Tudo'}
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

export default ReadSuppliersPage; 