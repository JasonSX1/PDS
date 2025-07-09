import React, { useEffect, useState } from 'react';
import '../styles/ReadClientsPage.css';
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

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  address: Address;
}

interface ApiResponse {
  results: Client[];
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

function ReadClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editError, setEditError] = useState<string>('');
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string>('');
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState<boolean>(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/client/pages`);
        const data: ApiResponse = response.data;
        setClients(data.results);
        setTotalPages(data.pagination.lastPage + 1);
      } catch (error: any) {
        console.error('Erro ao buscar clientes:', error);
      }
    };
    fetchData();
  }, [page]);

  const openEditModal = async (clientId: number) => {
    try {
      const response = await api.get(`/client/${clientId}`);
      setEditingClient(response.data);
      setIsEditModalOpen(true);
      setEditError('');
    } catch (error: any) {
      alert('Erro ao carregar dados do cliente para edição.');
    }
  };

  const closeEditModal = () => {
    setEditingClient(null);
    setIsEditModalOpen(false);
    setEditError('');
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'name' || name === 'address.city') {
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
      formattedValue = value;
    }
    setEditingClient(prev => {
      if (name.startsWith('address.')) {
        const addressPart = name.split('.')[1];
        return {
          ...prev!,
          address: {
            ...prev!.address,
            [addressPart]: formattedValue,
          },
        };
      } else {
        return { ...prev!, [name]: formattedValue };
      }
    });
  };

  const handleSaveEdit = async () => {
    if (editingClient) {
      setEditError('');
      if (!estadosBrasileiros.includes(editingClient.address.state)) {
        setEditError("Por favor, selecione um estado válido (sigla de 2 letras)");
        return;
      }
      try {
        const payload = {
          name: editingClient.name,
          email: editingClient.email,
          phone: editingClient.phone.replace(/\D/g, ""),
          cpf: editingClient.cpf.replace(/\D/g, ""),
          address: {
            zipCode: editingClient.address.zipCode.replace(/\D/g, ""),
            street: editingClient.address.street,
            number: editingClient.address.number,
            city: editingClient.address.city,
            state: editingClient.address.state.toUpperCase()
          }
        };
        const response = await api.patch(`/client/${editingClient.id}`, payload);
        if (response.status === 200) {
          const updatedClients = clients.map(client =>
            client.id === editingClient.id ? { ...client, ...editingClient } : client
          );
          setClients(updatedClients);
          closeEditModal();
          alert('Cliente atualizado com sucesso!');
        } else {
          setEditError(response.data?.message || 'Erro ao atualizar cliente.');
        }
      } catch (error: any) {
        setEditError(error.response?.data?.message || error.message || 'Erro ao atualizar cliente.');
      }
    }
  };

  const openDeleteConfirmation = (client: Client) => {
    setClientToDelete(client);
    setIsDeleteConfirmationOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setClientToDelete(null);
    setIsDeleteConfirmationOpen(false);
  };

  const handleDeleteClient = async () => {
    if (clientToDelete) {
      try {
        const response = await api.delete(`/client/${clientToDelete.id}`);
        if (response.status === 204 || response.status === 200) {
          const updatedClients = clients.filter(c => c.id !== clientToDelete.id);
          setClients(updatedClients);
          setDeleteSuccessMessage('Cliente excluído com sucesso!');
          setTimeout(() => setDeleteSuccessMessage(''), 3000);
        } else {
          alert('Erro ao excluir cliente.');
        }
      } catch (error: any) {
        alert('Erro ao excluir cliente.');
      } finally {
        closeDeleteConfirmation();
      }
    }
  };

  return (
    <div className="read-clients-container">
      <Header />
      <Navbar />
      <div className="clients-header">
        <Link to="/clients/create" className="clients-tab">Cadastrar Cliente</Link>
        <Link to="/clients" className="clients-tab active">Visualizar Clientes</Link>
      </div>
      {deleteSuccessMessage && <div className="success-message">{deleteSuccessMessage}</div>}
      <div className="clients-list-container">
        <div className="clients-list-header">
          <div>Nome</div>
          <div>Email</div>
          <div>Telefone</div>
          <div>CPF</div>
          <div>Cidade</div>
          <div>Estado</div>
          <div>Ações</div>
        </div>
        {clients.length > 0 ? (
          clients.map((client) => (
            <div key={client.id} className="clients-list-item">
              <div>{client.name}</div>
              <div>{client.email}</div>
              <div>{formatInput(client.phone, '(99) 99999-9999')}</div>
              <div>{formatInput(client.cpf, '999.999.999-99')}</div>
              <div>{client.address.city}</div>
              <div>{client.address.state}</div>
              <div className="actions-cell">
                <button className="icon-button delete" onClick={() => openDeleteConfirmation(client)}><Trash2 size={16} /></button>
                <button className="icon-button edit" onClick={() => openEditModal(client.id)}><Pencil size={16} /></button>
                <button className="icon-button more"><MoreVertical size={16} /></button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-clients">Nenhum cliente cadastrado.</div>
        )}
      </div>
      {isEditModalOpen && editingClient && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <div className="edit-modal-header">
              <h2>Editar Cliente</h2>
              <button className="close-button" onClick={closeEditModal}><X size={20} /></button>
            </div>
            <div className="edit-modal-body">
              {editError && <div className="error-message">{editError}</div>}
              <div className="form-group">
                <label htmlFor="name">Nome:</label>
                <input type="text" id="name" name="name" value={editingClient.name} onChange={handleEditInputChange} maxLength={100} />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" value={editingClient.email} onChange={handleEditInputChange} maxLength={100} />
              </div>
              <div className="form-group">
                <label htmlFor="cpf">CPF:</label>
                <input type="text" id="cpf" name="cpf" value={formatInput(editingClient.cpf, '999.999.999-99')} onChange={handleEditInputChange} maxLength={14} />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Telefone:</label>
                <input type="text" id="phone" name="phone" value={formatInput(editingClient.phone, '(99) 99999-9999')} onChange={handleEditInputChange} maxLength={16} />
              </div>
              <div className="form-group address-group">
                <label>Endereço:</label>
                <input
                  type="text"
                  name="address.zipCode"
                  placeholder="CEP (99999-999)"
                  value={formatInput(editingClient.address.zipCode, '99999-999')}
                  onChange={handleEditInputChange}
                  maxLength={9}
                />
                <input
                  type="text"
                  name="address.state"
                  placeholder="Estado (sigla)"
                  value={editingClient.address.state}
                  onChange={handleEditInputChange}
                  maxLength={2}
                />
                <input
                  type="text"
                  name="address.street"
                  placeholder="Rua"
                  value={editingClient.address.street}
                  onChange={handleEditInputChange}
                  maxLength={100}
                />
                <input
                  type="text"
                  name="address.number"
                  placeholder="Número"
                  value={editingClient.address.number}
                  onChange={handleEditInputChange}
                  maxLength={10}
                />
                <input
                  type="text"
                  name="address.city"
                  placeholder="Cidade"
                  value={editingClient.address.city}
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
      {isDeleteConfirmationOpen && clientToDelete && (
        <div className="delete-confirmation-overlay">
          <div className="delete-confirmation-modal">
            <h2>Você realmente deseja excluir este cliente?</h2>
            <p><strong>Nome:</strong> {clientToDelete.name}</p>
            <p><strong>Email:</strong> {clientToDelete.email}</p>
            <p><strong>CPF:</strong> {clientToDelete.cpf}</p>
            <div className="delete-confirmation-buttons">
              <button className="cancel-button" onClick={closeDeleteConfirmation}>Cancelar</button>
              <button className="delete-button" onClick={handleDeleteClient}>Excluir</button>
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

export default ReadClientsPage; 