import React, { useState, useEffect, useCallback } from "react";
import "../styles/CreateSuppliersPage.css";
import Header from "../components/ui/header";
import Navbar from "../components/ui/navbar";
import { Plus, X } from "lucide-react";
import api from "../lib/axiosConfig";
import { useNotification } from '../components/ui/notification';

// Lista de estados brasileiros
const estadosBrasileiros = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

// Função auxiliar para formatar inputs com máscara
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

export default function CreateSuppliersPage() {
  const { showSuccess, showError, NotificationContainer } = useNotification();
  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    phones: [""],
    emails: [""],
    address: {
      zipCode: "",
      street: "",
      number: "",
      city: "",
      state: ""
    },
  });

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState("");

  const fetchAddressByZipCode = useCallback(async (zipCode: string) => {
    const cleanZipCode = zipCode.replace(/\D/g, "");
    if (cleanZipCode.length === 8) {
      try {
        const response = await api.get(`https://viacep.com.br/ws/${cleanZipCode}/json/`);
        const data = response.data;

        if (data && !data.erro) {
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              street: data.logradouro || '',
              city: data.localidade || '',
              state: data.uf || ''
            }
          }));
        } else {
          setError("CEP não encontrado ou inválido.");
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              street: '',
              city: '',
              state: ''
            }
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
        setError("Erro ao buscar CEP. Tente novamente.");
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'name' || name === 'city') {
      if (!/^[a-zA-Z\s\u00C0-\u00FF]*$/.test(value)) return;
      formattedValue = value;
    } else if (name === 'cnpj') {
      if (/\D/.test(value.replace(/\D/g, ''))) return;
      formattedValue = formatInput(value, '99.999.999/9999-99');
    } else if (name === 'zipCode') {
      if (/\D/.test(value.replace(/\D/g, ''))) return;
      formattedValue = formatInput(value, '99999-999');
      if (formattedValue.length === 9) fetchAddressByZipCode(formattedValue);
    } else if (name === 'state') {
      if (/\d/.test(value)) return;
      formattedValue = value.toUpperCase();
      const filtered = estadosBrasileiros.filter(estado => estado.startsWith(formattedValue));
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else if (name === 'number') {
      if (/\D/.test(value)) return;
      formattedValue = value;
    } else if (name === 'street') {
      formattedValue = value;
    }

    if (name in formData.address || name === 'zipCode' || name === 'state' || name === 'street' || name === 'number' || name === 'city') {
      setFormData(prev => ({ ...prev, address: { ...prev.address, [name]: formattedValue } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    }
  };

  const handlePhoneChange = (index: number, value: string) => {
    let formattedValue = value;
    if (/\D/.test(value.replace(/\D/g, ''))) return;
    formattedValue = formatInput(value, '(99) 99999-9999');

    const newPhones = [...formData.phones];
    newPhones[index] = formattedValue;
    setFormData(prev => ({ ...prev, phones: newPhones }));
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...formData.emails];
    newEmails[index] = value;
    setFormData(prev => ({ ...prev, emails: newEmails }));
  };

  const addPhone = () => {
    setFormData(prev => ({ ...prev, phones: [...prev.phones, ""] }));
  };

  const removePhone = (index: number) => {
    if (formData.phones.length > 1) {
      const newPhones = formData.phones.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, phones: newPhones }));
    }
  };

  const addEmail = () => {
    setFormData(prev => ({ ...prev, emails: [...prev.emails, ""] }));
  };

  const removeEmail = (index: number) => {
    if (formData.emails.length > 1) {
      const newEmails = formData.emails.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, emails: newEmails }));
    }
  };

  const handleSuggestionClick = (estado: string) => {
    setFormData(prev => ({ ...prev, address: { ...prev.address, state: estado } }));
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!estadosBrasileiros.includes(formData.address.state)) {
      setError("Por favor, selecione um estado válido (sigla de 2 letras)");
      return;
    }

    if (formData.name.length > 100) {
      setError("Nome não pode exceder 100 caracteres");
      return;
    }

    // Filtrar telefones e emails vazios
    const validPhones = formData.phones.filter(phone => phone.trim() !== "");
    const validEmails = formData.emails.filter(email => email.trim() !== "");

    if (validPhones.length === 0) {
      setError("Pelo menos um telefone é obrigatório");
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        cnpj: formData.cnpj.replace(/\D/g, ""),
        phones: validPhones.map(phone => phone.replace(/\D/g, "")),
        emails: validEmails.length > 0 ? validEmails : undefined,
        address: {
          zipCode: formData.address.zipCode.replace(/\D/g, ""),
          street: formData.address.street,
          number: formData.address.number,
          city: formData.address.city,
          state: formData.address.state.toUpperCase()
        }
      };

      const response = await api.post("/supplier", payload);

      if (response.status !== 201) {
        throw new Error(response.data.message || "Erro ao cadastrar");
      }

      showSuccess("Fornecedor cadastrado com sucesso!");
      setFormData({
        name: "",
        cnpj: "",
        phones: [""],
        emails: [""],
        address: {
          zipCode: "",
          street: "",
          number: "",
          city: "",
          state: ""
        },
      });
    } catch (error: any) {
      console.error("Erro:", error);
      setError(error.response?.data?.message || error.message || "Erro desconhecido");
    }
  };

  return (
    <div className="suppliers-container">
      <Header />
      <Navbar />

      <div className="suppliers-header">
        <h2 style={{ fontWeight: 700 }}>Cadastrar Fornecedor</h2>
        <h3>
          <a href="/suppliers" style={{ color: 'black', textDecoration: 'none' }}>Visualizar Fornecedor</a>
        </h3>
      </div>

      <form className="supplier-form" onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Nome do Fornecedor"
          value={formData.name}
          onChange={handleChange}
          required
          maxLength={100}
        />

        <input
          name="cnpj"
          placeholder="CNPJ (99.999.999/9999-99)"
          value={formData.cnpj}
          onChange={handleChange}
          maxLength={18}
          required
        />

        <div className="phones-section">
          <label>Telefones</label>
          {formData.phones.map((phone, index) => (
            <div key={index} className="input-with-button">
              <input
                placeholder="Telefone ((99) 99999-9999)"
                value={phone}
                onChange={(e) => handlePhoneChange(index, e.target.value)}
                maxLength={16}
                required={index === 0}
              />
              {formData.phones.length > 1 && (
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

        <div className="emails-section">
          <label>E-mails (opcional)</label>
          {formData.emails.map((email, index) => (
            <div key={index} className="input-with-button">
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => handleEmailChange(index, e.target.value)}
                maxLength={100}
              />
              {formData.emails.length > 1 && (
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

        <label style={{ marginTop: 16, textAlign: 'center', display: 'block' }}>Endereço</label>
        <div className="address-group">
          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <input
              name="zipCode"
              placeholder="CEP (99999-999)"
              value={formData.address.zipCode}
              onChange={handleChange}
              maxLength={9}
              required
              style={{ flex: 1, minWidth: '0' }}
            />
            <div style={{ position: 'relative', flex: 2, minWidth: '0' }}>
              <input
                name="state"
                placeholder="Estado (sigla)"
                value={formData.address.state}
                onChange={handleChange}
                maxLength={2}
                required
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                style={{ flex: 2, minWidth: '0' }}
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul style={{ position: 'absolute', zIndex: 1000, listStyle: 'none', padding: 0, margin: 0, backgroundColor: 'white', border: '1px solid #ddd', width: '100%', maxHeight: '200px', overflowY: 'auto' }}>
                  {suggestions.map((estado, index) => (
                    <li
                      key={index}
                      style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                      onMouseDown={() => handleSuggestionClick(estado)}
                    >
                      {estado}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <input
            name="street"
            placeholder="Rua"
            value={formData.address.street}
            onChange={handleChange}
            required
            maxLength={100}
          />
          <input
            name="number"
            placeholder="Número"
            value={formData.address.number}
            onChange={handleChange}
            required
            maxLength={10}
          />
          <input
            name="city"
            placeholder="Cidade"
            value={formData.address.city}
            onChange={handleChange}
            required
            maxLength={50}
          />
        </div>

        {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}

        <button type="submit" className="submit-button">
          Cadastrar
        </button>
      </form>
      <NotificationContainer />
    </div>
  );
}