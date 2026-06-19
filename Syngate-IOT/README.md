# Syngate — Hardware IoT (ESP32)

**Repositório do Firmware IoT da Aplicação Syngate**
*Sistema de Controle de Acesso Físico com Validação em Nuvem*

---

*Projeto Integrador da Turma 43 da Faculdade Senac Pernambuco.*

### Plataforma e Linguagem
![C++](https://img.shields.io/badge/C++-00599C?style=for-the-badge&logo=c%2B%2B&logoColor=white) ![Arduino](https://img.shields.io/badge/Arduino-00979D?style=for-the-badge&logo=Arduino&logoColor=white) ![ESP32](https://img.shields.io/badge/ESP32-000000?style=for-the-badge&logo=espressif&logoColor=white)

### Comunicação e Bibliotecas
![Wi-Fi](https://img.shields.io/badge/Wi--Fi-000000?style=for-the-badge&logo=wi-fi&logoColor=white) ![JSON](https://img.shields.io/badge/ArduinoJson-000000?style=for-the-badge&logo=json&logoColor=white) ![SPI](https://img.shields.io/badge/SPI-Bus-blue?style=for-the-badge)

---

## Visão Geral

Este repositório contém o firmware em C++ desenvolvido para a placa **ESP32 DevKit**, que atua como o terminal físico (Edge/IoT) do sistema **Syngate**.

O dispositivo é responsável por detectar a presença de usuários, realizar a leitura segura de cartões RFID/NFC (MFRC522), determinar o sentido do fluxo (Entrada ou Saída) e validar o acesso em tempo real através de comunicação HTTP direta com a API RESTful do Syngate.

---

## Ecossistema Syngate

A aplicação está dividida em três componentes modulares e integrados. Navegue pelos repositórios para explorar cada camada do sistema:

| Componente | Repositório | Escopo Técnico |
|------------|-------------|----------------|
| **API Backend** | [syngate-backend](https://github.com/Molimpion/syngate-backend) | API RESTful, regras de negócio (RBAC), WebSockets e persistência. |
| **Frontend Web** | [syngate-frontend](https://github.com/Molimpion/syngate-frontend) | Interface administrativa, gráficos de consumo e monitoramento em tempo real. |
| **Hardware IoT** | [syngate-iot](https://github.com/Molimpion/syngate-iot) | Firmware em C++ para ESP32, sensor ultrassônico e leitura segura de RFID. |

---

## Lógica de Funcionamento e Edge Computing

Para otimizar o consumo de energia e evitar leituras acidentais no módulo RFID, o firmware implementa uma **Máquina de Estados de Presença**:

1. **Modo Ocioso:** Os LEDs permanecem apagados. O sensor ultrassônico varre o ambiente. O leitor RFID fica passivo.
2. **Detecção (Raio de 30cm):** Quando um usuário entra no raio de ação do ultrassônico (`< 30cm`), o sistema desperta, acende o LED Vermelho (modo de espera) e ativa a antena do RFID.
3. **Leitura e Direção:** O cartão é lido e seu UID é extraído. O dispositivo mantém um mapa em memória (`std::map`) para alternar logicamente a direção de cada usuário (a primeira leitura é registrada como `ENTRADA`, a subsequente como `SAIDA`, e assim sucessivamente).
4. **Validação Cloud:** O ESP32 envia um payload JSON para a API via POST HTTP com os *headers* de segurança da máquina.
5. **Feedback Visual:** - **Concedido:** LED Verde acende por 3 segundos. A direção lógica do usuário é alternada.
* **Negado:** LED Vermelho pisca rapidamente 3 vezes. A direção lógica não é alterada.



---

## Hardware e Pinout (Diagrama de Ligação)

O projeto foi construído para utilizar os seguintes pinos na ESP32:

| Componente | Pino ESP32 | Função |
| --- | --- | --- |
| **RFID MFRC522** | `GPIO 5` | SS / SDA (Slave Select) |
| **RFID MFRC522** | `GPIO 4` | RST (Reset) |
| **RFID MFRC522** | `GPIO 23` | MOSI (SPI padrão) |
| **RFID MFRC522** | `GPIO 19` | MISO (SPI padrão) |
| **RFID MFRC522** | `GPIO 18` | SCK (SPI padrão) |
| **HC-SR04** | `GPIO 12` | TRIG (Emissor de pulso) |
| **HC-SR04** | `GPIO 14` | ECHO (Receptor de retorno) |
| **LED Indicador** | `GPIO 32` | LED Verde (Sucesso) |
| **LED Indicador** | `GPIO 33` | LED Vermelho (Espera / Erro) |

---

## Segurança e Autenticação (Zero Trust)

O dispositivo **não** utiliza tokens JWT convencionais, pois são vulneráveis caso extraídos do firmware. A autenticação é baseada em credenciais imutáveis geradas no provisionamento pelo Painel Web:

Nas requisições HTTP para a API, os seguintes *headers* são obrigatórios:

```http
x-device-mac: 80:F3:DA:A9:A3:6C
x-device-key: <chave_sha256_gerada_no_painel>

```

*Qualquer requisição com MAC incompatível com a chave, ou vinda de um dispositivo com status `INATIVO` no banco de dados, será negada pela API na camada de middleware (antes mesmo de avaliar o cartão).*

---

## Como Executar e Gravar o Firmware

### Pré-requisitos

* Arduino IDE (v2.x recomendada) ou VS Code com PlatformIO.
* Suporte a placas ESP32 instalado no Gerenciador de Placas.

### Bibliotecas Necessárias

Instale as seguintes bibliotecas através do Gerenciador de Bibliotecas da IDE:

1. `MFRC522` by GithubCommunity
2. `ArduinoJson` by Benoit Blanchon (v6.x)

### Configuração Inicial

Antes de compilar e fazer o *upload* (`ESP32D_devkit_Syngate.cpp`), ajuste as constantes de ambiente no topo do código:

```cpp
// ===== Credenciais WiFi =====
const char* WIFI_SSID     = "SUA_REDE_WIFI";
const char* WIFI_PASSWORD = "SUA_SENHA_WIFI";

// ===== Configuração da API Syngate =====
const char* API_URL    = "https://syngate-api.onrender.com/api/v1/access";
const char* DEVICE_MAC = "MAC_ADDRESS_DA_SUA_ESP32";
const char* DEVICE_KEY = "CHAVE_GERADA_NO_PAINEL_WEB";

```

### Modos de Teste (Offline)

A pasta do projeto inclui versões de debug que não dependem da nuvem para funcionar. Ideais para testar as soldas e jumpers:

* `ESP32D.cpp`: Teste base do RFID com hardcode de um UID autorizado e controle de LEDs.
* `ESP32D-cor.cpp`: Integração do RFID com o HC-SR04, poupando energia, mas ainda com validação local.

---

## Tratamento de Falhas (Resiliência)

* **Auto-Reconnect Wi-Fi:** Se a conexão cair, a *main loop* bloqueia a operação, acende o LED vermelho para evitar falso controle de fluxo, e tenta reconectar em intervalos de 5 segundos (`WIFI_TIMEOUT_MS`).
* **Timeouts HTTP:** Para evitar que o dispositivo "congele" aguardando resposta caso a API demore, um limite de resposta rígido de 8 segundos (`HTTP_TIMEOUT_MS`) foi estabelecido. Falhas resultam em negação de acesso imediata.

---

## 7. Licença

Este projeto está sob a Licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
