# 🏨 Belavista Frontend

Sistema de Gerenciamento Hoteleiro desenvolvido em Angular 18 com Material Design.

## 🚀 Visão Geral

Aplicação web para gerenciamento hoteleiro com interface moderna e responsiva. Inclui autenticação JWT, dashboard em tempo real e gerenciamento de hóspedes.

## ⚡ Funcionalidades

- 🔐 **Login seguro** com JWT
- 📊 **Dashboard** com métricas do hotel
- 👥 **Gerenciamento de hóspedes** com busca
  - 📄 **Tipos de documento suportados**: RG, CPF, PASSPORT, CNH
- 🎨 **Interface responsiva** Material Design
- 🛡️ **Rotas protegidas** com guards

## 🛠 Tecnologias

- **Angular 18** - Framework principal
- **Angular Material** - Componentes UI
- **TypeScript** - Linguagem
- **RxJS** - Programação reativa
- **SCSS** - Estilos

## 📋 Pré-requisitos

- Node.js 18+
- npm 9+
- Angular CLI 18+
- API Spring Boot rodando em `http://localhost:8080`

## 🔧 Instalação

```bash
# Clonar repositório
git clone https://github.com/cabralbrcwb/belavista-frontend.git
cd belavista-frontend

# Instalar dependências
npm install

# Executar aplicação
npm start
```

A aplicação estará disponível em `http://localhost:4200/`

## 📁 Estrutura

```
src/app/
├── core/                    # Serviços principais
│   ├── guards/             # Proteção de rotas
│   ├── interceptors/       # HTTP interceptors
│   ├── layout/             # Layout principal
│   └── services/           # Serviços de autenticação
├── features/               # Funcionalidades
│   ├── login/             # Tela de login
│   ├── dashboard/         # Dashboard
│   └── hospedes/          # Gerenciamento de hóspedes
└── shared/                # Componentes compartilhados
```

## 🔑 Configuração

### Variáveis de Ambiente
Criar `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

### API Endpoints
- `POST /api/auth/login` - Autenticação
- `GET /api/dashboard/stats` - Estatísticas
- `GET /api/hospedes` - Lista de hóspedes

## 📋 Gerenciamento de Documentos

### Tipos de Documento Suportados
O sistema suporta os seguintes tipos de documento para cadastro de hóspedes:

- **RG** - Registro Geral
- **CPF** - Cadastro de Pessoa Física
- **PASSPORT** - Passaporte
- **CNH** - Carteira Nacional de Habilitação

O campo de documento na interface é exibido como "DOC. (RG, CPF, PASSPORT, CNH)" para orientar o usuário sobre os tipos aceitos.

## 📜 Scripts

```bash
npm start          # Servidor desenvolvimento
npm run build      # Build produção
npm test           # Testes unitários
npm run lint       # Verificar código
```

### 👨‍💻 Autor

Desenvolvido com ❤️ por **Daniel Silva**.

## 🚀 Endpoints da API

A seguir, a lista de endpoints disponíveis na aplicação.

### 🧍‍♂️ Módulo de Hóspedes

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/api/hospedes` | Cria um novo hóspede. Requer um corpo de requisição com os dados do hóspede. |
| `GET` | `/api/hospedes` | Lista todos os hóspedes ou busca por `nome`, `documento`, ou `telefone`. |
| `GET` | `/api/hospedes/{id}` | Busca um hóspede específico pelo seu ID. |
| `PUT` | `/api/hospedes/{id}` | Atualiza os dados de um hóspede existente. |
| `DELETE` | `/api/hospedes/{id}` | Remove um hóspede. A operação é bloqueada se o hóspede tiver reservas ativas. |

### 🛏️ Módulo de Reservas

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/api/reservas` | Cria uma nova reserva para um hóspede. Requer o ID do hóspede e as datas de entrada/saída. |
| `POST` | `/api/reservas/{id}/check-in` | Realiza o check-in de uma reserva `PENDENTE`. |
| `POST` | `/api/reservas/{id}/check-out` | Realiza o check-out de uma reserva com status `CHECK_IN` e retorna a fatura detalhada. |
| `GET` | `/api/reservas` | Lista todas as reservas ou filtra por status (`PENDENTE`, `CHECK_IN`, `CHECK_OUT`, `CANCELADA`). |
| `DELETE` | `/api/reservas/{id}` | Cancela uma reserva que ainda está com o status `PENDENTE`. |

