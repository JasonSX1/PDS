# 🏪 ERP Kanto Íntimo

Sistema de Gestão Empresarial (ERP) desenvolvido para a loja Kanto Íntimo, especializada em lingerie e moda íntima. O sistema oferece controle completo de vendas, estoque, clientes, fornecedores e vendedores.

<div align="center">
  <img src="https://private-user-images.githubusercontent.com/80845484/464476207-82918199-e31a-4b2d-8ba8-84f4901469a1.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NTY3Mzc2ODcsIm5iZiI6MTc1NjczNzM4NywicGF0aCI6Ii84MDg0NTQ4NC80NjQ0NzYyMDctODI5MTgxOTktZTMxYS00YjJkLThiYTgtODRmNDkwMTQ2OWExLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA5MDElMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwOTAxVDE0MzYyN1omWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTAzMjUxMGNhMzdiODU2YmY0OTM2MWQ2NDU2NmFiYTI4NDY1ZWU4ZGQyMGQxZWQ0YWY2MmQ2NTQ2MjZkZDVkZDMmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.VU6Y1Jb9TE686wqzMGWson3Cxyuj-56QfS7ga1_s-lw"/>
</div>

## 🎯 Visão Geral

O ERP Kanto Íntimo é uma solução completa de gestão empresarial desenvolvida durante a disciplina de **Análise e Modelagem de Sistemas** no 5º semestre. O projeto aplica conceitos de engenharia de software, arquitetura de sistemas e metodologias ágeis para criar uma solução robusta e escalável.

### Objetivos do Sistema
- Automatizar processos de vendas e controle de estoque
- Centralizar informações de clientes, fornecedores e vendedores
- Fornecer relatórios e estatísticas para tomada de decisão
- Implementar interface intuitiva e responsiva
- Garantir integridade e consistência dos dados

## ⚡ Funcionalidades

### 🛍️ Gestão de Vendas
- **Cadastro de Vendas**: Criação de vendas com múltiplos produtos
- **Edição Avançada**: Adicionar/remover produtos individualmente
- **Controle de Estoque**: Validação automática de disponibilidade
- **Histórico Completo**: Rastreamento de todas as transações
- **Exclusão Inteligente**: Retorno automático ao estoque

### 📦 Gestão de Produtos
- **Catálogo Completo**: Nome, preço, tamanho, cor e quantidade
- **Múltiplas Categorias**: Organização flexível por categorias
- **Controle de Estoque**: Monitoramento em tempo real
- **Validações**: Impedimento de vendas com estoque insuficiente
- **Exclusão Segura**: Verificação de produtos vinculados a vendas

### 👥 Gestão de Pessoas
- **Clientes**: Cadastro completo com dados pessoais e endereço
- **Vendedores**: Controle de performance e estatísticas
- **Fornecedores**: Gestão de parceiros comerciais
- **Validações**: CPF, telefone, CEP e outros dados

### 📊 Relatórios e Estatísticas
- **Dashboard de Vendedores**: Status, última venda, total de vendas
- **Atualizações Automáticas**: Refresh em tempo real
- **Histórico de Vendas**: Filtros e busca avançada
- **Controle de Estoque**: Alertas de produtos em baixa

### 🔔 Sistema de Notificações
- **Notificações Customizadas**: Substituição de alerts nativos
- **Feedback Visual**: Confirmações de sucesso e erro
- **Persistência**: Notificações com duração configurável
- **Responsividade**: Adaptação a diferentes telas

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** - Ambiente de execução JavaScript
- **NestJS** - Framework web progressivo
- **Prisma** - ORM moderno para TypeScript
- **PostgreSQL** - Banco de dados relacional
- **Docker** - Containerização do banco de dados
- **TypeScript** - Superset tipado do JavaScript

### Frontend
- **React** - Biblioteca para interfaces de usuário
- **TypeScript** - Tipagem estática
- **Vite** - Build tool moderno e rápido
- **Lucide React** - Ícones SVG
- **Axios** - Cliente HTTP
- **CSS3** - Estilização responsiva

### Ferramentas de Desenvolvimento
- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **Git** - Controle de versão
- **VS Code** - IDE principal

## 📁 Estrutura do Projeto

```
📦 ERP Kanto Íntimo
├── 📁 kanto-backend/          # API Backend
│   ├── 📁 src/
│   │   ├── 📁 client/         # Módulo de clientes
│   │   ├── 📁 product/        # Módulo de produtos
│   │   ├── 📁 sale/           # Módulo de vendas
│   │   ├── 📁 seller/         # Módulo de vendedores
│   │   ├── 📁 supplier/       # Módulo de fornecedores
│   │   └── 📁 prisma/         # Configuração do banco
│   ├── 📁 prisma/             # Schema e migrações
│   └── 📄 docker-compose.yml  # Configuração Docker
│
├── 📁 kanto-intimo-front/     # Frontend React
│   ├── 📁 src/
│   │   ├── 📁 components/     # Componentes reutilizáveis
│   │   ├── 📁 pages/          # Páginas da aplicação
│   │   ├── 📁 styles/         # Estilos CSS
│   │   └── 📁 lib/            # Configurações (Axios)
│   └── 📄 package.json
│
└── 📄 README.md              # Este arquivo
```

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js (v18+)
- Docker e Docker Compose
- Git

### 1. Clone o Repositório
```bash
git clone https://github.com/JasonSX1/PDS
cd "2ª Sprint"
```

### 2. Configuração do Backend
```bash
cd kanto-backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Crie um arquivo .env na raiz do projeto backend com:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/kanto_db"

# Subir banco de dados com Docker
docker-compose up -d

# Executar migrações do Prisma
npx prisma migrate deploy

# Gerar cliente Prisma
npx prisma generate

# Iniciar servidor de desenvolvimento
npm run start:dev
```

### 3. Configuração do Frontend
```bash
cd ../kanto-intimo-front

# Instalar dependências
npm install

# Iniciar aplicação
npm run dev
```

### 4. Acessar o Sistema
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Banco de Dados**: PostgreSQL na porta 5432

## 📖 Como Usar

### Primeiro Acesso
1. Acesse http://localhost:5173
2. Cadastre fornecedores primeiro
3. Cadastre produtos vinculados aos fornecedores
4. Cadastre clientes e vendedores
5. Comece a registrar vendas

### Fluxo de Vendas
1. **Criar Venda**: Navegue para "Cadastrar Venda"
2. **Selecionar Cliente e Vendedor**: Campos obrigatórios
3. **Adicionar Produtos**: Use o botão "+" para adicionar itens
4. **Verificar Estoque**: Sistema valida automaticamente
5. **Finalizar**: Confirme a venda

### Gestão de Estoque
1. **Produtos**: Visualize estoque atual na listagem
2. **Vendas**: Estoque é reduzido automaticamente
3. **Exclusões**: Produtos retornam ao estoque
4. **Alertas**: Sistema impede vendas sem estoque

### Relatórios
1. **Vendedores**: Veja performance e estatísticas
2. **Vendas**: Histórico completo com filtros
3. **Produtos**: Status de estoque e movimentação

## 🎓 Lições Aprendidas

### Análise e Modelagem de Sistemas

#### 1. **Levantamento de Requisitos**
- **Funcionais**: Identificação clara das operações do sistema
- **Não-funcionais**: Performance, usabilidade, segurança
- **Regras de Negócio**: Validações específicas do domínio
- **Casos de Uso**: Documentação detalhada dos fluxos

#### 2. **Modelagem de Dados**
- **Diagrama ER**: Relacionamentos entre entidades
- **Normalização**: Evitar redundância e inconsistências
- **Integridade Referencial**: Chaves estrangeiras e constraints
- **Migração de Schema**: Versionamento do banco de dados

#### 3. **Arquitetura de Software**
- **Separação de Responsabilidades**: Frontend e Backend
- **Padrão MVC**: Organização clara dos módulos
- **API RESTful**: Comunicação padronizada
- **Modularidade**: Código reutilizável e manutenível

#### 4. **Princípios de Design**
- **DRY (Don't Repeat Yourself)**: Evitar duplicação de código
- **SOLID**: Princípios de orientação a objetos
- **Clean Code**: Código legível e autodocumentado
- **Responsividade**: Interface adaptável

### Metodologia Ágil

#### 1. **Sprints de Desenvolvimento**
- **Sprint 1**: Estrutura básica e CRUD simples
- **Sprint 2**: Funcionalidades avançadas e refinamentos
- **Retrospectivas**: Melhoria contínua do processo

#### 2. **Product Backlog**
- **User Stories**: Funcionalidades do ponto de vista do usuário
- **Estimativas**: Planejamento coletivo e story points

#### 3. **Práticas Ágeis**
- **Code Review**: Revisão colaborativa do código
- **Refactoring**: Melhoria contínua da qualidade

### Desafios Técnicos Enfrentados

#### 1. **Integração Frontend-Backend**
- **CORS**: Configuração de políticas de origem cruzada
- **Serialização**: Padronização de dados JSON
- **Error Handling**: Tratamento consistente de erros
- **Validação**: Dupla validação (client e server)

#### 2. **Gestão de Estado**
- **Sincronização**: Atualização em tempo real
- **Persistência**: Armazenamento local e remoto
- **Cache**: Otimização de performance
- **Eventos**: Comunicação entre componentes

#### 3. **UX/UI Design**
- **Usabilidade**: Interface intuitiva e eficiente
- **Acessibilidade**: Suporte a diferentes usuários
- **Responsividade**: Adaptação a dispositivos móveis
- **Feedback Visual**: Confirmações e alertas

### Competências Desenvolvidas

#### Técnicas
- **Fullstack Development**: Frontend e Backend
- **Database Design**: Modelagem e otimização
- **API Development**: RESTful e documentação
- **Version Control**: Git e workflows colaborativos

#### Soft Skills
- **Trabalho em Equipe**: Colaboração e comunicação
- **Resolução de Problemas**: Análise e debugging
- **Gestão de Tempo**: Priorização e aplicação de metodologias ágeis
- **Adaptabilidade**: Mudanças de requisitos

## 🏗️ Metodologia de Desenvolvimento

### Processo de Desenvolvimento
1. **Análise de Requisitos**: Entrevista com Cliente Final
2. **Modelagem**: Diagramas UML e ER
3. **Prototipagem**: Wireframes e mockups
4. **Implementação**: Desenvolvimento iterativo
5. **Testes**: Validação funcional e usabilidade

### Controle de Qualidade
- **Code Review**: Revisão por pares
- **Documentation**: Comentários, documentação escrita (Especificação de Requisitos, Doc. de Visão, Diagramas) e README

### Ferramentas de Gestão
- **Kanban Board**: Visualização do progresso por meio da plataforma


## 🤝 Contribuidores

Este projeto foi desenvolvido como parte da disciplina de **Análise e Modelagem de Sistemas** no 5º semestre do curso de Sistemas de Informação.

### Professor Orientador
- **Crijina Chagas Flores** - Disciplina: Análise e Modelagem de Sistemas

*Este projeto representa a aplicação prática dos conceitos aprendidos em sala de aula, demonstrando a capacidade de análise, modelagem e implementação de sistemas complexos.*
