import React, { useEffect, useState } from 'react';
import '../styles/ReadSellersPage.css';
import Header from "../components/ui/header";
import Navbar from "../components/ui/navbar";
import { Trash2, Pencil, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Seller {
  id: number;
  name: string; // A API usa 'name'
  status: string; // Você precisará determinar de onde vem esse dado
  cpf: string;
  address?: { // O endereço está aninhado
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  // Outras propriedades que você pode querer exibir
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

function ReadSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1); // Inicialize com 1

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/seller/pages`);
        const data: ApiResponse = await response.json();
        console.log("Dados da API:", data);
        setSellers(data.results);
        console.log("Estado sellers:", sellers);
        setTotalPages(data.pagination.lastPage + 1);
      } catch (err) {
        console.error('Erro ao buscar vendedores:', err);
      }
    };
    fetchData();
  }, [page]);

  return (
    <div className="read-sellers-container">
      <Header />
      <Navbar />

      <div className="sellers-header">
        <Link to="/sellers/create" className="sellers-tab">Cadastrar Vendedor</Link>
        <Link to="/sellers" className="sellers-tab active">Visualizar Vendedor</Link>
      </div>

      <div className="sellers-list-container">
        <div className="sellers-list-header">
          <div>Nome</div>
          <div>Status</div> {/* N/A por enquanto */}
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
                  {seller.name} {/* Use 'name' */}
                </Link>
              </div>
              <div>N/A</div> {/* Status não está diretamente na resposta */}
              <div>{seller.cpf}</div>
              <div>N/A</div>
              <div>N/A</div>
              <div className="actions-cell">
                <button className="icon-button delete"><Trash2 size={16} /></button>
                <button className="icon-button edit"><Pencil size={16} /></button>
                <button className="icon-button more"><MoreVertical size={16} /></button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-sellers">Nenhum vendedor cadastrado.</div>
        )}
      </div>

      <div className="pagination">
        <button onClick={() => setPage(1)} disabled={page === 1}>«</button>
        <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>‹</button>
        <span>
          Página <strong>{page}</strong> de {totalPages}
        </span>
        <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>›</button>
        <button onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
        <button className="update-button">Atualizar</button>
      </div>
    </div>
  );
}

export default ReadSellersPage;