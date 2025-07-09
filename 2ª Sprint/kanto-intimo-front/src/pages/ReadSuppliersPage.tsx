import React, { useEffect, useState } from 'react';
import '../styles/ReadSuppliersPage.css';
import Header from "../components/ui/header";
import Navbar from "../components/ui/navbar";
import { Trash2, Pencil, MoreVertical, X, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/axiosConfig';

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
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editError, setEditError] = useState<string>('');
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string>('');
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState<boolean>(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/supplier/pages`);
        const data: ApiResponse = response.data;
        console.log("Dados da API:", data);
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
      alert('Erro ao carregar dados do fornecedor para edição.');
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
      if (name.startsWith('address.')) {
        const addressPart = name.split('.')[1];
        return {
          ...prev,
          address: {
            ...prev!.address,
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
          alert('Fornecedor atualizado com sucesso!');
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

  const openDeleteConfirmation = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteConfirmationOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setSupplierToDelete(null);
    setIsDeleteConfirmationOpen(false);
  };

  const handleDeleteSupplier = async () => {
    if (supplierToDelete) {
      try {
        const response = await api.delete(`/supplier/${supplierToDelete.id}`);

        if (response.status === 204 || response.status === 200) {
          const updatedSuppliers = suppliers.filter(s => s.id !== supplierToDelete.id);
          setSuppliers(updatedSuppliers);
          setDeleteSuccessMessage('Fornecedor excluído com sucesso!');
          setTimeout(() => setDeleteSuccessMessage(''), 3000);
        } else {
          console.error('Erro ao excluir fornecedor:', response.data);
          alert('Erro ao excluir fornecedor.');
        }
      } catch (error: any) {
        console.error('Erro ao enviar exclusão:', error);
        alert('Erro ao excluir fornecedor.');
      } finally {
        closeDeleteConfirmation();
      }
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
              <div>{supplier.phones.map(phone => formatInput(phone, '(99) 99999-9999')).join(', ')}</div>
              <div>{supplier.emails.join(', ') || 'N/A'}</div>
              <div className="actions-cell">
                <button className="icon-button delete" onClick={() => openDeleteConfirmation(supplier)}><Trash2 size={16} /></button>
                <button className="icon-button edit" onClick={() => openEditModal(supplier.id)}><Pencil size={16} /></button>
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
          <div className="delete-confirmation-modal">
            <h2>Você realmente deseja excluir este fornecedor?</h2>
            <p><strong>Nome:</strong> {supplierToDelete.name}</p>
            <p><strong>CNPJ:</strong> {formatInput(supplierToDelete.cnpj, '99.999.999/9999-99')}</p>
            <p><strong>Telefones:</strong> {supplierToDelete.phones.map(phone => formatInput(phone, '(99) 99999-9999')).join(', ')}</p>
            <p><strong>E-mails:</strong> {supplierToDelete.emails.join(', ') || 'N/A'}</p>
            <div className="delete-confirmation-buttons">
              <button className="cancel-button" onClick={closeDeleteConfirmation}>Cancelar</button>
              <button className="delete-button" onClick={handleDeleteSupplier}>Excluir</button>
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
        <button className="update-button" onClick={() => setPage(page)}>Atualizar</button>
      </div>
    </div>
  );
}

export default ReadSuppliersPage; 