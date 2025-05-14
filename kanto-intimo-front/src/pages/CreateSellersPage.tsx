import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/ui/header';
import Navbar from '../components/ui/navbar';
import '../styles/SellersPage.css';

function CreateSellersPage() {
  const [form, setForm] = useState({
    nome: '',
    sobrenome: '',
    email: '',
    cpf: '',
    telefone: '',
    dia: '',
    mes: '',
    ano: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Formulário enviado:', form);
    // Aqui você pode fazer o POST pro backend
  };

  return (
    <div className="sellers-container">
      <Header />
      <Navbar />

      <div className="sellers-header">
        <span className="sellers-tab active">Cadastrar Vendedor</span>
        <Link to="/sellers" className="sellers-tab">Visualizar Vendedor</Link>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-row">
          <input type="text" name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} />
          <input type="text" name="sobrenome" placeholder="Sobrenome" value={form.sobrenome} onChange={handleChange} />
        </div>

        <input type="email" name="email" placeholder="E-mail" value={form.email} onChange={handleChange} />
        <input type="text" name="cpf" placeholder="CPF" value={form.cpf} onChange={handleChange} />
        <input type="text" name="telefone" placeholder="Telefone" value={form.telefone} onChange={handleChange} />

        <label className="birth-label">Data de nascimento</label>
        <div className="form-row">
          <input type="text" name="dia" placeholder="Dia" value={form.dia} onChange={handleChange} />
          <input type="text" name="mes" placeholder="Mês" value={form.mes} onChange={handleChange} />
          <input type="text" name="ano" placeholder="Ano" value={form.ano} onChange={handleChange} />
        </div>

        <div className="form-footer">
          <button type="submit" className="submit-button">Cadastrar</button>
        </div>
      </form>
    </div>
  );
}

export default CreateSellersPage;
