import React, { useEffect, useState } from 'react';
import '../styles/ReadSellersPage.css';
import Header from "../components/ui/header";
import Navbar from "../components/ui/navbar";
import { Trash2, Pencil, MoreVertical, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/axiosConfig';

interface Address {
  street: string;
  number: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Seller {
  id: number;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string | null;
  address: Address;
}

interface ApiResponse {
  results: Seller[];
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

function ReadSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editError, setEditError] = useState<string>('');
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string>('');
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState<boolean>(false);
  const [sellerToDelete, setSellerToDelete] = useState<Seller | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/seller/pages`);
        const data: ApiResponse = response.data;
        console.log("Dados da API:", data);
        const formattedSellers = data.results.map(seller => {
          const [name, ...lastNameParts] = seller.name.split(' ');
          return { ...seller, name, lastName: lastNameParts.join(' ') };
        });
        setSellers(formattedSellers);
        setTotalPages(data.pagination.lastPage + 1);
      } catch (error: any) {
        console.error('Erro ao buscar vendedores:', error);
      }
    };
    fetchData();
  }, [page]);

  const openEditModal = async (sellerId: number) => {
    try {
      const response = await api.get(`/seller/${sellerId}`);
      const sellerData: Seller = response.data;
      const [name, ...lastNameParts] = sellerData.name.split(' ');
      setEditingSeller({ ...sellerData, name, lastName: lastNameParts.join(' ') });
      setIsEditModalOpen(true);
      setEditError('');
    } catch (error: any) {
      console.error('Erro ao carregar dados do vendedor para edição:', error);
      alert('Erro ao carregar dados do vendedor para edição.');
    }
  };

  const closeEditModal = () => {
    setEditingSeller(null);
    setIsEditModalOpen(false);
    setEditError('');
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'name' || name === 'lastName' || name === 'address.city') {
      if (!/^[a-zA-Z\s\u00C0-\u00FF]*$/.test(value)) return;
      formattedValue = value;
    } else if (name === 'cpf') {
      if (/\D/.test(value.replace(/\D/g, ''))) return;
      formattedValue = formatInput(value, '999.999.999-99');
    } else if (name === 'phone') {
      if (/\D/.test(value.replace(/\D/g, ''))) return;
      formattedValue = formatInput(value, '(99) 99999-9999');
    } else if (name === 'address.zipCode') {
      if (/\D/.test(value.replace(/\D/g, ''))) return;
      formattedValue = formatInput(value, '99999-999');
    } else if (name === 'address.state') {
      if (/\d/.test(value)) return;
      formattedValue = value.toUpperCase();
    } else if (name === 'address.number') {
      if (/\D/.test(value)) return;
      formattedValue = value;
    } else if (name === 'birthDate') {
      formattedValue = value; // Mantém o formato de data
    }

    setEditingSeller(prev => {
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

  const handleSaveEdit = async () => {
    if (editingSeller) {
      setEditError('');

      if (!estadosBrasileiros.includes(editingSeller.address.state)) {
        setEditError("Por favor, selecione um estado válido (sigla de 2 letras)");
        return;
      }

      if ((editingSeller.name + " " + editingSeller.lastName).length > 100) {
        setEditError("Nome completo não pode exceder 100 caracteres");
        return;
      }

      try {
        const payload = {
          name: `${editingSeller.name} ${editingSeller.lastName}`.trim(),
          email: editingSeller.email,
          phone: editingSeller.phone.replace(/\D/g, ""),
          cpf: editingSeller.cpf.replace(/\D/g, ""),
          birthDate: editingSeller.birthDate,
          address: {
            zipCode: editingSeller.address.zipCode.replace(/\D/g, ""),
            street: editingSeller.address.street,
            number: editingSeller.address.number,
            city: editingSeller.address.city,
            state: editingSeller.address.state.toUpperCase()
          }
        };

        const response = await api.patch(`/seller/${editingSeller.id}`, payload);

        if (response.status === 200) {
          const [updatedName, ...updatedLastNameParts] = payload.name.split(' ');
          const updatedLastName = updatedLastNameParts.join(' ');

          const updatedSellers = sellers.map(seller =>
            seller.id === editingSeller.id
              ? { ...seller, name: updatedName, lastName: updatedLastName }
              : seller
          );
          setSellers(updatedSellers);
          closeEditModal();
          alert('Vendedor atualizado com sucesso!');
        } else {
          console.error('Erro ao atualizar vendedor:', response.data);
          setEditError(response.data?.message || 'Erro ao atualizar vendedor.');
        }
      } catch (error: any) {
        console.error('Erro ao enviar atualização:', error);
        setEditError(error.message || 'Erro ao atualizar vendedor.');
      }
    }
  };

  const openDeleteConfirmation = (seller: Seller) => {
    setSellerToDelete(seller);
    setIsDeleteConfirmationOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setSellerToDelete(null);
    setIsDeleteConfirmationOpen(false);
  };

  const handleDeleteSeller = async () => {
    if (sellerToDelete) {
      try {
        const response = await api.delete(`/seller/${sellerToDelete.id}`);

        if (response.status === 204 || response.status === 200) {
          const updatedSellers = sellers.filter(s => s.id !== sellerToDelete.id);
          setSellers(updatedSellers);
          setDeleteSuccessMessage('Vendedor excluído com sucesso!');
          setTimeout(() => setDeleteSuccessMessage(''), 3000);
        } else {
          console.error('Erro ao excluir vendedor:', response.data);
          alert('Erro ao excluir vendedor.');
        }
      } catch (error: any) {
        console.error('Erro ao enviar exclusão:', error);
        alert('Erro ao excluir vendedor.');
      } finally {
        closeDeleteConfirmation();
      }
    }
  };

  return (
    <div className="read-sellers-container">
      <Header />
      <Navbar />

      <div className="sellers-header">
        <Link to="/sellers/create" className="sellers-tab">Cadastrar Vendedor</Link>
        <Link to="/sellers" className="sellers-tab active">Visualizar Vendedor</Link>
      </div>

      {deleteSuccessMessage && <div className="success-message">{deleteSuccessMessage}</div>}

      <div className="sellers-list-container">
        <div className="sellers-list-header">
          <div>Nome</div>
          <div>Status</div> {/* Você precisará determinar de onde vem esse dado */}
          <div>CPF</div>
          <div>Última Venda</div>
          <div>Total Vendas</div>
          <div>Ações</div>
        </div>
        {sellers.length > 0 ? (
          sellers.map((seller) => (
            <div key={seller.id} className="sellers-list-item">
              <div>
                <Link to={`/seller/${seller.id}`} className="seller-name-link">
                  {seller.name} {seller.lastName}
                </Link>
              </div>
              <div>N/A</div> {/* Status não está diretamente na resposta */}
              <div>{seller.cpf}</div>
              <div>N/A</div>
              <div>N/A</div>
              <div className="actions-cell">
                <button className="icon-button delete" onClick={() => openDeleteConfirmation(seller)}><Trash2 size={16} /></button>
                <button className="icon-button edit" onClick={() => openEditModal(seller.id)}><Pencil size={16} /></button>
                <button className="icon-button more"><MoreVertical size={16} /></button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-sellers">Nenhum vendedor cadastrado.</div>
        )}
      </div>

      {isEditModalOpen && editingSeller && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <div className="edit-modal-header">
              <h2>Editar Vendedor</h2>
              <button className="close-button" onClick={closeEditModal}><X size={20} /></button>
            </div>
            <div className="edit-modal-body">
              {editError && <div className="error-message">{editError}</div>}
              <div className="form-group">
                <label htmlFor="name">Nome:</label>
                <input type="text" id="name" name="name" value={editingSeller.name} onChange={handleEditInputChange} maxLength={50} />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Sobrenome:</label>
                <input type="text" id="lastName" name="lastName" value={editingSeller.lastName} onChange={handleEditInputChange} maxLength={50} />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" value={editingSeller.email} onChange={handleEditInputChange} maxLength={100} />
              </div>
              <div className="form-group">
                <label htmlFor="cpf">CPF:</label>
                <input type="text" id="cpf" name="cpf" value={formatInput(editingSeller.cpf, '999.999.999-99')} onChange={handleEditInputChange} maxLength={14} />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Telefone:</label>
                <input type="text" id="phone" name="phone" value={formatInput(editingSeller.phone, '(99) 99999-9999')} onChange={handleEditInputChange} maxLength={16} />
              </div>
              <div className="form-group">
                <label htmlFor="birthDate">Data de Nascimento:</label>
                <input type="date" id="birthDate" name="birthDate" value={editingSeller.birthDate ? editingSeller.birthDate.split('T')[0] : ''} onChange={handleEditInputChange} />
              </div>
              <div className="form-group address-group">
                <label>Endereço:</label>
                <input
                  type="text"
                  name="address.zipCode"
                  placeholder="CEP (99999-999)"
                  value={formatInput(editingSeller.address.zipCode, '99999-999')}
                  onChange={handleEditInputChange}
                  maxLength={9}
                />
                <input
                  type="text"
                  name="address.state"
                  placeholder="Estado (sigla)"
                  value={editingSeller.address.state}
                  onChange={handleEditInputChange}
                  maxLength={2}
                />
                <input
                  type="text"
                  name="address.street"
                  placeholder="Rua"
                  value={editingSeller.address.street}
                  onChange={handleEditInputChange}
                  maxLength={100}
                />
                <input
                  type="text"
                  name="address.number"
                  placeholder="Número"
                  value={editingSeller.address.number}
                  onChange={handleEditInputChange}
                  maxLength={10}
                />
                <input
                  type="text"
                  name="address.city"
                  placeholder="Cidade"
                  value={editingSeller.address.city}
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

      {isDeleteConfirmationOpen && sellerToDelete && (
        <div className="delete-confirmation-overlay">
          <div className="delete-confirmation-modal">
            <h2>Você realmente deseja excluir este vendedor?</h2>
            <p><strong>Nome:</strong> {sellerToDelete.name} {sellerToDelete.lastName}</p>
            <p><strong>Status:</strong> N/A</p>
            <p><strong>CPF:</strong> {sellerToDelete.cpf}</p>
            <p><strong>Email:</strong> {sellerToDelete.email}</p>
            <p><strong>Telefone:</strong> {sellerToDelete.phone}</p>
            <div className="delete-confirmation-buttons">
              <button className="cancel-button" onClick={closeDeleteConfirmation}>Cancelar</button>
              <button className="delete-button" onClick={handleDeleteSeller}>Excluir</button>
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

export default ReadSellersPage;