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
