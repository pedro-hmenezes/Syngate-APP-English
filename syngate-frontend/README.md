# Syngate — Frontend Web

**Repositório do Frontend da Aplicação Syngate:**
*Painel de Gestão Administrativa e Monitoramento de Acesso Físico*

---

*Projeto Integrador da Turma 43 da Faculdade Senac Pernambuco.*


### Ecossistema e UI
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) ![Shadcn UI](https://img.shields.io/badge/Shadcn_UI-000000?style=for-the-badge&logo=shadcnui&logoColor=white)

### Gerenciamento de Estado e Dados
![TanStack Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white) ![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white) ![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)

### Ferramentas e Observabilidade
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white) ![Recharts](https://img.shields.io/badge/Recharts-22B573?style=for-the-badge&logo=recharts&logoColor=white)

---

## Visão Geral

Este repositório contém o código-fonte do painel web da aplicação **Syngate**. Ele serve como a interface principal para coordenadores e gestores administrarem usuários, dispositivos IoT, salas, turnos acadêmicos e monitorarem o fluxo de acessos físicos em tempo real.

O sistema foi desenvolvido utilizando o **Next.js (App Router)** e consome os dados da API RESTful do Syngate, operando sob uma arquitetura de proxy interno para maximizar a segurança.

---

## Ecossistema Syngate

A aplicação está dividida em três componentes modulares e integrados. Navegue pelos repositórios para explorar cada camada do sistema:

| Componente | Repositório | Escopo Técnico |
|------------|-------------|----------------|
| **API Backend** | [syngate-backend](https://github.com/Molimpion/syngate-backend) | API RESTful, regras de negócio (RBAC), WebSockets e persistência. |
| **Frontend Web** | [syngate-frontend](https://github.com/Molimpion/syngate-frontend) | Interface administrativa, gráficos de consumo e monitoramento em tempo real. |
| **Hardware IoT** | [syngate-iot](https://github.com/Molimpion/syngate-iot) | Firmware em C++ para ESP32, sensor ultrassônico e leitura segura de RFID. |

---

## Arquitetura e Decisões de Segurança (BFF)

Para mitigar vulnerabilidades como XSS (Cross-Site Scripting) e roubo de tokens, esta aplicação implementa o padrão **BFF (Backend For Frontend)**.

1. **Isolamento de Credenciais:** O token JWT (`syngate_token`) nunca é armazenado no `localStorage` do navegador. Ele reside exclusivamente em um cookie `HttpOnly` e `Secure`.
2. **Rotas de Proxy:** O cliente (React) não faz requisições diretas para a API externa. Todas as chamadas (via `apiFetch`) são direcionadas para as *API Routes* do Next.js em `src/app/api/...`.
3. **Injeção Transparente:** O servidor Node.js (Next.js) intercepta a chamada, anexa o JWT do cookie no header `Authorization` e encaminha (faz o proxy) para o backend real (`API_URL`), devolvendo a resposta para o frontend.

### Estrutura de Diretórios

```
src/
├── actions/         # Server Actions (Autenticação, Login, Logout)
├── app/             # Rotas da aplicação (App Router)
│   ├── (auth)/      # Telas públicas (Login, Verificação de Email)
│   ├── (dashboard)/ # Painel administrativo protegido
│   └── api/         # Rotas de Proxy (BFF) para o backend
├── components/      # Componentes UI (Shadcn) e fragmentos de domínio
├── hooks/           # Custom Hooks (useSession, useSocket, useDashboardStats)
├── lib/             # Clientes utilitários (Fetch wrapper, QueryClient)
├── services/        # Abstração de chamadas HTTP organizadas por domínio
└── types/           # Tipos TypeScript e Enums

```

---

## Funcionalidades e Controle de Acesso (RBAC)

O menu de navegação e as rotas são protegidos ativamente com base no papel (`PapelUsuario`) decodificado no JWT:

| Funcionalidade | Descrição | Níveis de Acesso Permitidos |
| --- | --- | --- |
| **Dashboard** | Métricas consolidadas, gráficos (Recharts) e feed de acessos em tempo real via WebSocket. | Todos |
| **Perfil** | Visualização de dados pessoais e alteração de senha. | Todos |
| **Usuários** | CRUD de usuários, *soft delete* e vínculo de tags/cartões RFID ao perfil. | `GESTOR`, `COORDENADOR` |
| **Turnos** | Definição de horários de bloqueio/liberação e regras de dias da semana. | `GESTOR`, `COORDENADOR` |
| **Salas** | Gestão de blocos e ambientes físicos integrados ao hardware. | `GESTOR`, `COORDENADOR` |
| **Dispositivos** | Cadastro de ESP32s (Catracas/Leitores) e provisionamento de chave criptográfica (`rawKey`). | `GESTOR`, `COORDENADOR` |
| **Relatórios** | Filtros avançados de auditoria e exportação de logs em formato `.csv`. | `GESTOR`, `COORDENADOR` |

---

## Como Executar Localmente

### Pré-requisitos

* Node.js v18 ou superior
* Backend do Syngate rodando localmente (ou apontamento para a URL de staging)

### Inicialização

1. Clone o repositório
  
2. Instale as dependências:

```bash
npm install

```

3. Crie o arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# URL da API Node.js (Backend) - Usada pelas rotas de Proxy no servidor
API_URL="http://localhost:3333/api/v1"

# Opcional caso use rewrites do next.config.ts
NEXT_PUBLIC_API_URL="http://localhost:3333/api/v1"

# URL do servidor Socket.io para monitoramento em tempo real
NEXT_PUBLIC_SOCKET_URL="http://localhost:3333"

```

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev

```

A aplicação estará disponível em `http://localhost:3000`.

---

## Integração em Tempo Real (WebSocket)

A comunicação em tempo real para alimentar o **Fluxo de Acessos** do Dashboard é feita através do hook customizado `useSocket.ts`.

* A conexão é estabelecida via transbordo de pacotes com `socket.io-client`.
* O cliente escuta o evento `access:new` para popular a interface (AnimatePresence com Framer Motion).
* **Importante:** A conexão socket usa `withCredentials: true` para que o cookie `syngate_token` seja lido pelo gateway do backend, permitindo apenas conexões autenticadas.

---

## Guias de Contribuição e Qualidade (DX)

### Padronização de Commits

Este projeto utiliza **Husky** e **Commitlint** para garantir a clareza e rastreabilidade do histórico do Git. Todos os commits devem ser escritos seguindo o padrão [Conventional Commits](https://www.conventionalcommits.org/):

> **Exemplos válidos:**
> `feat: adiciona mascara de entrada no formulario de turnos`
> `fix: corrige validacao cruzada de senhas no perfil`
> `ui: atualiza cor primaria do tema escuro`

### Estilização e Design System

A estilização é baseada inteiramente no **Tailwind CSS v4** (via plugin `@tailwindcss/postcss`) com variáveis de design controladas no `src/styles/globals.css`.
A componentização visual segue a filosofia do **Shadcn UI** (presente na pasta `src/components/ui`), focando em acessibilidade (Radix UI) e controle direto sobre o código do componente.

---

## Licença

Este projeto está sob a Licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
