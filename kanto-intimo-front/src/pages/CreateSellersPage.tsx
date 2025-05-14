import React, { useState, useEffect } from "react";
import "../styles/SellersPage.css";
import Header from "../components/ui/header";
import Navbar from "../components/ui/navbar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";

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

export default function CreateSellersPage() {
  const [dateInput, setDateInput] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    cpf: "",
    phone: "",
    birthDate: null as Date | null,
    address: {
      zipCode: "",
      street: "",
      number: "",
      city: "",
      state: ""
    },
  });

    // Efeito para sincronizar dateInput com birthDate
  useEffect(() => {
    if (formData.birthDate) {
      const day = String(formData.birthDate.getDate()).padStart(2, '0');
      const month = String(formData.birthDate.getMonth() + 1).padStart(2, '0');
      const year = formData.birthDate.getFullYear();
      setDateInput(`${day}/${month}/${year}`);
    } else {
      setDateInput("");
    }
  }, [formData.birthDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // Aplica máscara de data (dd/mm/yyyy)
    if (value.length > 2 && value.length <= 4) {
      value = value.replace(/^(\d{2})(\d{0,2})/, '$1/$2');
    } else if (value.length > 4) {
      value = value.replace(/^(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
    }
    
    setDateInput(value);
    
    // Converte para Date quando tiver data completa
    if (value.length === 10) {
      const [day, month, year] = value.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      
      // Valida se a data é válida
      if (
        date.getDate() === day &&
        date.getMonth() === month - 1 &&
        date.getFullYear() === year &&
        date <= new Date()
      ) {
        setFormData(prev => ({ ...prev, birthDate: date }));
      } else {
        // Data inválida, mantém o input mas não atualiza o formData
      }
    } else {
      setFormData(prev => ({ ...prev, birthDate: null }));
    }
  };

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    if (name === 'cpf') {
      formattedValue = formatInput(value, '999.999.999-99');
    } else if (name === 'phone') {
      formattedValue = formatInput(value, '(99) 99999-9999');
    } else if (name === 'zipCode') {
      formattedValue = formatInput(value, '99999-999');
    } else if (name === 'state') {
      formattedValue = value.toUpperCase();
      // Filtra sugestões
      const filtered = estadosBrasileiros.filter(estado => 
        estado.startsWith(formattedValue)
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    }
    
    if (name in formData.address || name === 'zipCode' || name === 'state') {
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: formattedValue,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue,
      }));
    }
  };

  const handleSuggestionClick = (estado: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        state: estado
      }
    }));
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validações
    if (!estadosBrasileiros.includes(formData.address.state)) {
      setError("Por favor, selecione um estado válido (sigla de 2 letras)");
      return;
    }

    if (formData.birthDate && isNaN(formData.birthDate.getTime())) {
      setError("Data de nascimento inválida");
      return;
    }

    if ((formData.name + " " + formData.lastName).length > 100) {
      setError("Nome completo não pode exceder 100 caracteres");
      return;
    }

    try {
      // Formata os dados para o padrão do backend
      const payload = {
        name: `${formData.name} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone.replace(/\D/g, ""),
        cpf: formData.cpf.replace(/\D/g, ""),
        birthDate: formData.birthDate?.toISOString().split("T")[0] || null,
        address: {
          zipCode: formData.address.zipCode.replace(/\D/g, ""),
          street: formData.address.street,
          number: formData.address.number,
          city: formData.address.city,
          state: formData.address.state.toUpperCase()
        }
      };

      const response = await fetch("http://localhost:3000/seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Erro ao cadastrar");
      }

      alert("Vendedor cadastrado com sucesso!");
      // Reset form
      setFormData({
        name: "",
        lastName: "",
        email: "",
        cpf: "",
        phone: "",
        birthDate: null,
        address: {
          zipCode: "",
          street: "",
          number: "",
          city: "",
          state: ""
        },
      });
    } catch (err) {
      console.error("Erro:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    }
  };

  return (
    <div className="sellers-container">
      <Header />
      <Navbar />

      <div className="sellers-header">
        <h2 style={{ fontWeight: 700 }}>Cadastrar Vendedor</h2>
        <h3>
          <a href="/sellers">Visualizar Vendedor</a>
        </h3>
      </div>

      <form className="seller-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <input 
            name="name" 
            placeholder="Nome" 
            value={formData.name} 
            onChange={handleChange} 
            required 
            maxLength={50}
          />
          <input 
            name="lastName" 
            placeholder="Sobrenome" 
            value={formData.lastName} 
            onChange={handleChange} 
            required 
            maxLength={50}
          />
        </div>
        
        <input 
          type="email" 
          name="email" 
          placeholder="E-mail" 
          value={formData.email} 
          onChange={handleChange} 
          required 
          maxLength={100}
        />

        <input
          name="cpf"
          placeholder="CPF (999.999.999-99)"
          value={formData.cpf}
          onChange={handleChange}
          maxLength={14}
          required
        />

        <input
          name="phone"
          placeholder="Telefone ((99) 99999-9999)"
          value={formData.phone}
          onChange={handleChange}
          maxLength={16}
          required
        />

        <label style={{ marginTop: 12 }}>Data de nascimento</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="text"
            placeholder="dd/mm/aaaa"
            value={dateInput}
            onChange={handleDateChange}
            maxLength={10}
            style={{ padding: '8px', width: '100%' }}
          />
          <DatePicker
            selected={formData.birthDate}
            onChange={(date) => setFormData(prev => ({ ...prev, birthDate: date }))}
            dateFormat="dd/MM/yyyy"
            placeholderText="Ou selecione"
            className="datepicker-input"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            maxDate={new Date()}
            customInput={<button type="button" style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer' 
            }}>
              <Calendar size={20} />
            </button>}
          />
        </div>

        <label style={{ marginTop: 16 }}>Endereço</label>
        <input
          name="zipCode"
          placeholder="CEP (99999-999)"
          value={formData.address.zipCode}
          onChange={handleChange}
          maxLength={9}
          required
        />
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
        
        <div style={{ position: 'relative' }}>
          <input
            name="state"
            placeholder="Estado (sigla)"
            value={formData.address.state}
            onChange={handleChange}
            maxLength={2}
            required
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul style={{
              position: 'absolute',
              zIndex: 1000,
              listStyle: 'none',
              padding: 0,
              margin: 0,
              backgroundColor: 'white',
              border: '1px solid #ddd',
              width: '100%',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
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

        {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}

        <button type="submit" className="submit-button">
          Cadastrar
        </button>
      </form>
    </div>
  );
}