# Syngate App

> **Abstract:** Syngate is an intelligent access control system leveraging IoT, Cloud Computing, and Edge processing. Designed to solve physical access limitations in academic environments, the MVP utilizes an ESP32 microcontroller, RFID authentication, and ultrasonic sensors to validate user entry. Connected to a RESTful Node.js API and a PostgreSQL database, the system ensures secure, automated, and fail-safe access management while adhering to data privacy principles.

## Links de Acesso

* **Repositório Back-End:** [Syngate-BackEnd](https://github.com/Molimpion/Syngate-BackEnd)
* **Repositório Front-End:** [syngate-frontend](https://github.com/Molimpion/syngate-frontend)
* **Repositório IoT:** [Syngate-IOT](https://github.com/Molimpion/Syngate-IOT)
* **Apresentação (Slides):** [Acessar Apresentação](https://github.com/Molimpion/Syngate-IOT/blob/main/docs/presentation/slide.pdf)
* **Solução em Execução:** [Acessar Plataforma Web](https://syngate-frontend.vercel.app/login)
* **Documentação e Gestão:** [Quadro Kanban (GitHub Projects)](https://github.com/users/Molimpion/projects/1)

---

## 1. Identificação

* **Nome do Projeto:** Syngate
* **Equipe:**
  * Pedro Menezes
  * Camilla Vieira
  * Manoel Olimpio
  * José Fernando
  * Maria Augusta
  * Dayanni Rodrigues
  * Muriel Bezerra
* **Turma / Período:** Turma 43 ADS
* **Unidades Curriculares (UCs) Integradas:**
  * IoT & Artefato — Arnott Caiado
  * Comportamento do Consumidor — Paulo Guimarães
  * Cloud Computing — Alisson Vinicius
  * Segurança da Informação & LGPD — Paulo Pimentel
  * Qualidade de Software — Paulo Pimentel
  * Análise e Projetos de Sistemas — Marcus Vinicius
  * Tech English — Leonardo Trevas

---

## 1.1 Marcas Formativas em Evidência

O desenvolvimento do Syngate mobilizou as seguintes marcas formativas:

* **Domínio técnico-científico:** Evidenciado na estruturação do firmware do ESP32, na integração entre sensores RFID e ultrassônico, na comunicação HTTP com a API e na modelagem relacional do banco de dados PostgreSQL utilizando Prisma ORM.
* **Resolução de problemas com autonomia digital:** Demonstrado na integração entre hardware e software, implementação de rotinas de reconexão automática ao Wi-Fi, tratamento de falhas de comunicação com a API e depuração dos payloads JSON trafegados entre os dispositivos e o backend.
* **Visão crítica, ética e segurança:** Aplicada na proteção de credenciais através de arquivos `.env`, autenticação dos dispositivos por meio de chaves exclusivas (`Device Key`) e adoção dos princípios de minimização de dados previstos pela LGPD.
* **Comunicação e colaboração:** Refletida na documentação técnica do projeto, na organização do repositório GitHub, na divisão de responsabilidades da equipe e na apresentação estruturada da solução.
* **Atitude empreendedora e inovadora:** Materializada na identificação de uma dor real relacionada ao controle de acesso acadêmico e na proposição de um MVP de baixo custo, escalável e baseado em tecnologias amplamente utilizadas pelo mercado.

---

## 2. Documento de Requisitos Simplificado

### 2.1 Descrição do Problema

Atualmente, o ambiente acadêmico apresenta limitações relacionadas ao controle e gerenciamento de acessos. A entrada principal não possui um mecanismo automatizado de identificação de alunos, professores ou visitantes, dificultando o controle de circulação de pessoas dentro da instituição.

Além disso, o acesso às salas de aula depende, em muitos casos, da presença de professores ou coordenadores para abertura dos ambientes, gerando atrasos, dependência operacional e impactos na experiência dos usuários.

Diante desse cenário, surge a necessidade de uma solução inteligente capaz de controlar acessos de forma segura, automatizada e contextual, considerando não apenas a identidade do usuário, mas também informações como local, horário e permissões associadas.

O projeto Syngate foi concebido para atender essa necessidade por meio da integração entre dispositivos IoT, computação em nuvem e aplicações web, proporcionando uma experiência de acesso mais segura, eficiente e moderna.

### 2.2 Escopo do MVP (Minimum Viable Product)

O MVP do Syngate tem como objetivo validar a viabilidade técnica e funcional de um sistema de controle de acesso inteligente utilizando IoT, Desenvolvimento Web e Cloud Computing. A versão inicial contempla:

* Leitura da identificação do usuário por meio de cartões RFID.
* Detecção de aproximação utilizando sensor ultrassônico HC-SR04.
* Processamento local embarcado utilizando ESP32.
* Comunicação via Wi-Fi com uma API desenvolvida em Node.js/TypeScript.
* Validação de acesso baseada em regras de autorização definidas no backend.
* Registro dos eventos de acesso em banco de dados PostgreSQL.
* Gerenciamento de dados através do Prisma ORM.
* Feedback visual local utilizando LEDs de status.
* Operação resiliente com mecanismos de reconexão automática e tratamento de falhas.

> **Fora do escopo do MVP:** reconhecimento facial, integração com sistemas acadêmicos oficiais, biometria e abertura física automatizada de portas (tranca eletrônica).

### 2.3 Requisitos Funcionais (RF)

| ID | Descrição |
| :--- | :--- |
| RF-001 | O sistema deve identificar usuários por meio de cartões RFID utilizando o módulo MFRC522. |
| RF-002 | O ESP32 deve realizar a leitura periódica dos dispositivos de identificação conectados ao sistema. |
| RF-003 | O firmware deve encapsular os dados coletados em formato JSON. |
| RF-004 | O ESP32 deve enviar os dados de acesso para a API através de requisições HTTP. |
| RF-005 | A API deve validar as permissões de acesso do usuário. |
| RF-006 | O sistema deve registrar os eventos de acesso no banco de dados PostgreSQL, incluindo data, horário e local. |
| RF-007 | O sistema deve indicar localmente o resultado da validação através de LEDs de status. |
| RF-008 | O dashboard em nuvem deve exibir os registros recebidos em tempo real. |
| RF-009 | O sistema deve permitir operação em modo degradado (Edge Computing) em caso de indisponibilidade temporária da internet. |

### 2.4 Requisitos Não Funcionais (RNF) Mensuráveis

| ID | Categoria | Descrição |
| :--- | :--- | :--- |
| RNF-001 | Tempo de Resposta | O tempo total entre a leitura da identificação e o retorno da validação não deve ultrapassar 2 segundos em condições normais de rede. |
| RNF-002 | Intervalo de Amostragem | O firmware deve verificar novas tentativas de acesso em intervalos máximos de 500 milissegundos. |
| RNF-003 | Confiabilidade de Rede | O ESP32 deve executar tentativas automáticas de reconexão ao Wi-Fi a cada 10 segundos em caso de perda de conectividade. |
| RNF-004 | Disponibilidade | O sistema deve permanecer operacional por pelo menos 95% do tempo durante os testes do MVP. |
| RNF-005 | Segurança | Credenciais de acesso, chaves de API e informações sensíveis não devem estar expostas diretamente no código-fonte versionado. |
| RNF-006 | Escalabilidade | A arquitetura deve permitir a adição de novos dispositivos ESP32 sem necessidade de alterações significativas na API. |

---

## 3. Mapeamento de Unidades Curriculares (UCs)

| Conceito / Competência | Unidade Curricular (UC) | Onde está evidenciado no projeto |
| :--- | :--- | :--- |
| Programação de Firmware para embarcados | IoT & Artefato | Firmware desenvolvido para ESP32, leitura dos dispositivos, processamento local e comunicação. |
| Edge Computing e sistemas resilientes | IoT & Artefato | Regras de operação local (fail-safe) e funcionamento degradado sem conexão. |
| Identificação da dor e Jornada do Usuário | Comportamento do Consumidor | Mapeamento do problema de acesso, definição da persona e fluxo de utilização do Syngate. |
| Integração Nuvem e Persistência | Cloud Computing | Comunicação ESP32 > API e utilização do PostgreSQL com Prisma ORM para histórico. |
| Proteção de credenciais e LGPD | Segurança da Info. & LGPD | Uso de `.env`, minimização de dados coletados para auditoria. |
| Confiabilidade e Requisitos | Qualidade de Software | Tratamento de erros, reconexão automática, documento de RFs e RNFs mensuráveis. |
| Arquitetura e Integração REST | Análise e Projetos de Sistemas | Modelagem lógica (IoT > API > DB > Dashboard) e requisições HTTP/JSON. |
| Documentação e Vocabulário Técnico | Tech English | Uso de nomenclaturas em inglês (API, Edge Computing, Payload, Endpoint) e estruturação do README. |

---

## 4. Esboços e Diagramas Técnicos

### 4.1 Diagrama de Arquitetura Lógica

| Camada | Componentes |
| :--- | :--- |
| **Percepção (Hardware)** | ESP32 DevKit V1, Leitor RFID MFRC522, Sensor Ultrassônico HC-SR04, LEDs de status |
| **Rede (Comunicação)** | Wi-Fi IEEE 802.11, HTTP/HTTPS, Payloads JSON, Autenticação por Device MAC/Key |
| **Nuvem (Aplicação)** | Backend Node.js/TypeScript, API REST, PostgreSQL, Prisma ORM, Hospedagem (Render) |

### 4.2 Fluxograma de Decisão do Firmware

```
Inicialização
     │
     ▼
Leitura do sensor ultrassônico
     │
     ▼
Aproximação detectada? ──NÃO──► Aguarda
     │ SIM
     ▼
Leitura do cartão RFID (UID)
     │
     ▼
Determina direção (Entrada / Saída)
     │
     ▼
Monta payload JSON e envia HTTP para API
     │
     ▼
Recebe resposta do backend
     │
     ▼
Autorizado? ──SIM──► LED Verde
     │ NÃO
     ▼
LED Vermelho
     │
     ▼
Retorna ao loop principal
```

### 4.3 Esquema Elétrico de Ligação

| Componente | Pino | ESP32 |
| :--- | :--- | :--- |
| **RFID MFRC522** | SDA | GPIO 5 |
| | RST | GPIO 4 |
| | MOSI | GPIO 23 |
| | MISO | GPIO 19 |
| | SCK | GPIO 18 |
| **HC-SR04** | TRIG | GPIO 12 |
| | ECHO | GPIO 14 |
| **LED Verde** | — | GPIO 32 |
| **LED Vermelho** | — | GPIO 33 |

> VCC/3.3V e GND conectados aos pinos de alimentação e terra correspondentes.

---

## 5. Dossiê de Evidências

### 5.1 Circuito Físico ou Ambiente Simulado

![Evidência do Circuito](Docs/Images/Circuito2.jpeg)

### 5.2 Serial Monitor e Payload JSON

![Evidência do Serial Monitor](Docs/Images/AmbienteSimulado2.jpeg)

### 5.3 Dashboards em Nuvem

![Evidência do Dashboard](Docs/Images/Dashboard.jpeg)

---

## 6. Instruções de Execução

### 6.1 Pré-requisitos

* ESP32 DevKit V1 + sensores (RFID MFRC522 e HC-SR04) + Arduino IDE 2.x
* Node.js 20+
* PostgreSQL + Prisma ORM
* Git

### 6.2 Executando o Backend

```bash
# Clone o repositório
git clone <repositorio>
cd backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais do banco e JWT

# Gere o client do Prisma e execute as migrations
npx prisma generate
npx prisma migrate deploy

# Inicie o servidor
npm run dev
```

### 6.3 Executando o Firmware (ESP32)

1. Abra o projeto na Arduino IDE.
2. Instale as bibliotecas necessárias: `MFRC522` e `ArduinoJson`.
3. Configure as credenciais de Wi-Fi (SSID e Senha) e a URL da API no código.
4. Compile e faça o upload para o ESP32.

---

## 7. Segurança e Integridade Acadêmica

### Gerenciamento de Credenciais e LGPD

As credenciais utilizadas não são armazenadas no código-fonte versionado (isoladas via `.gitignore`). O ambiente é configurado via `.env.example`. O projeto adota o princípio da minimização de dados da LGPD, armazenando apenas o estritamente necessário para auditoria de acessos.

### Uso de Inteligência Artificial

Ferramentas de IA Generativa foram utilizadas como apoio para pesquisa, formatação de documentação, brainstorming e revisão. Todo o código implementado foi analisado, compreendido e validado arquiteturalmente pela equipe.
```
