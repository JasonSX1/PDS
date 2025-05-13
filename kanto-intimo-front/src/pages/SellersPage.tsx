import React, { useEffect, useState } from 'react';
import '../styles/SellersPage.css';
import Header from "../components/ui/header";
import Navbar from "../components/ui/navbar";
import { Trash2, Pencil, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Seller {
  id: number;
  nome: string;
  status: string;
  cpf: string;
  ultimaVenda: string;
  totalVendas: number;
}

function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    fetch(`http://localhost:3000/seller/pages?page=${page}`)
      .then(res => res.json())
      .then((data: Seller[]) => setSellers(data))
      .catch(err => console.error('Erro ao buscar vendedores:', err));
  }, [page]);

  return (
    <div className="sellers-container">
      <Header />
      <Navbar />

      <div className="sellers-header">
        <h2>Cadastrar Vendedor</h2>
        <h3>Visualizar Vendedor</h3>
      </div>

      <table className="sellers-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Status</th>
            <th>CPF</th>
            <th>Última venda</th>
            <th>Total Vendas</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sellers.length > 0 ? (
            sellers.map((seller) => (
              <tr key={seller.id}>
                <td>
                  <Link to={`/seller/${seller.id}`} className="seller-name-link">
                    {seller.nome}
                  </Link>
                </td>
                <td>{seller.status}</td>
                <td>{seller.cpf}</td>
                <td>{seller.ultimaVenda}</td>
                <td>{seller.totalVendas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td className="actions-cell">
                  <button className="icon-button delete"><Trash2 size={16} /></button>
                  <button className="icon-button edit"><Pencil size={16} /></button>
                  <button className="icon-button more"><MoreVertical size={16} /></button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="no-sellers">Nenhum vendedor cadastrado.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={() => setPage(1)} disabled={page === 1}>«</button>
        <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>‹</button>
        <span>
          Página <strong>{page}</strong> de 1
        </span>
        <button disabled>›</button>
        <button disabled>»</button>
        <button className="update-button">Atualizar</button>
      </div>
    </div>
  );
}

export default SellersPage;
