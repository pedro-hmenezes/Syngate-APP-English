#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <map>

// ===== Pinos do RFID =====
#define SS_PIN  5
#define RST_PIN 4
MFRC522 rfid(SS_PIN, RST_PIN);

// ===== Pinos dos LEDs =====
#define LED_VERDE    32
#define LED_VERMELHO 33

// ===== Pinos do Ultrassônico =====
const int TRIG_PIN = 12;
const int ECHO_PIN = 14;

// ===== Credenciais WiFi =====
const char* WIFI_SSID     = "SENAC-Mesh";
const char* WIFI_PASSWORD = "09080706";

// ===== Configuração da API Syngate =====
const char* API_URL    = "https://syngate-api.onrender.com/api/v1/access";
const char* DEVICE_MAC = "80:F3:DA:A9:A3:6C";
const char* DEVICE_KEY = "c25da19ddf56e9222f61038388d461398b61179fe237d3eba6e7ebe55a31bde2";

// ===== Timeouts =====
const int HTTP_TIMEOUT_MS = 8000;
const int WIFI_TIMEOUT_MS = 15000;

// ===== Controle de direção por usuário =====
// true  = próxima leitura será ENTRADA
// false = próxima leitura será SAÍDA
std::map<String, bool> estadoUsuario;

// =========================================
//               SETUP
// =========================================
void setup() {
  Serial.begin(115200);
  while (!Serial);

  pinMode(LED_VERDE,    OUTPUT);
  pinMode(LED_VERMELHO, OUTPUT);
  pinMode(TRIG_PIN,     OUTPUT);
  pinMode(ECHO_PIN,     INPUT);

  digitalWrite(LED_VERDE,    LOW);
  digitalWrite(LED_VERMELHO, LOW);

  SPI.begin();
  rfid.PCD_Init();

  Serial.println("=========================================");
  Serial.println("       SYNGATE IoT - Iniciando...        ");
  Serial.println("=========================================");

  conectarWiFi();
}

// =========================================
//               LOOP PRINCIPAL
// =========================================
void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Conexão perdida. Reconectando...");
    conectarWiFi();
  }

  float distancia = lerDistancia();

  if (distancia > 30.0 || distancia == 0) {
    digitalWrite(LED_VERMELHO, LOW);
    digitalWrite(LED_VERDE,    LOW);
    delay(100);
    return;
  }

  // ===== Alguém se aproximou (<= 30cm) =====
  digitalWrite(LED_VERMELHO, HIGH);

  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    delay(50);
    return;
  }

  // Monta o UID
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(rfid.uid.uidByte[i], HEX);
    if (i < rfid.uid.size - 1) uid += ":";
  }
  uid.toUpperCase();

  Serial.print("\n[RFID] Cartão lido: ");
  Serial.println(uid);

  // Determina direção para este usuário
  // Se nunca foi visto antes, começa como ENTRADA
  if (estadoUsuario.find(uid) == estadoUsuario.end()) {
    estadoUsuario[uid] = true; // true = ENTRADA
  }

  bool isEntrada = estadoUsuario[uid];
  String direcao = isEntrada ? "ENTRADA" : "SAIDA";

  Serial.print("[DIR] Direção: ");
  Serial.println(direcao);

  bool acesso = validarAcessoAPI(uid, direcao);

  if (acesso) {
    // Só alterna a direção se o acesso foi concedido
    estadoUsuario[uid] = !isEntrada;

    Serial.println("[API] ACESSO CONCEDIDO");
    digitalWrite(LED_VERMELHO, LOW);
    digitalWrite(LED_VERDE,    HIGH);
    delay(3000);
    digitalWrite(LED_VERDE,    LOW);
  } else {
    Serial.println("[API] ACESSO NEGADO");
    // Direção NÃO alterna em caso de negação
    for (int i = 0; i < 3; i++) {
      digitalWrite(LED_VERMELHO, LOW);
      delay(150);
      digitalWrite(LED_VERMELHO, HIGH);
      delay(150);
    }
    digitalWrite(LED_VERMELHO, LOW);
  }

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}

// =========================================
//        CONEXÃO WiFi
// =========================================
void conectarWiFi() {
  Serial.print("[WiFi] Conectando em ");
  Serial.print(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long inicio = millis();
  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - inicio > WIFI_TIMEOUT_MS) {
      Serial.println("\n[WiFi] Timeout! Tentando novamente em 5s...");
      delay(5000);
      WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
      inicio = millis();
    }
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n[WiFi] Conectado!");
  Serial.print("[WiFi] IP: ");
  Serial.println(WiFi.localIP());
}

// =========================================
//        CHAMADA À API SYNGATE
// =========================================
bool validarAcessoAPI(String uidCartao, String direcao) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[API] Sem WiFi — acesso negado por segurança.");
    return false;
  }

  HTTPClient http;
  http.begin(API_URL);
  http.setTimeout(HTTP_TIMEOUT_MS);

  http.addHeader("Content-Type",  "application/json");
  http.addHeader("x-device-mac",  DEVICE_MAC);
  http.addHeader("x-device-key",  DEVICE_KEY);

  StaticJsonDocument<128> doc;
  doc["uidCartao"]  = uidCartao;
  doc["direcao"]    = direcao;
  doc["finalidade"] = "ENTRADA_PREDIO";

  String body;
  serializeJson(doc, body);

  Serial.println("[API] Enviando requisição...");
  int httpCode = http.POST(body);

  if (httpCode <= 0) {
    Serial.print("[API] Erro de conexão: ");
    Serial.println(http.errorToString(httpCode));
    http.end();
    return false;
  }

  Serial.print("[API] HTTP ");
  Serial.println(httpCode);

  String resposta = http.getString();
  http.end();

  StaticJsonDocument<256> resp;
  DeserializationError erro = deserializeJson(resp, resposta);

  if (erro) {
    Serial.print("[API] Erro ao parsear resposta: ");
    Serial.println(erro.c_str());
    return false;
  }

  bool granted = resp["granted"] | false;

  if (!granted) {
    const char* reason = resp["reason"];
    Serial.print("[API] Motivo da negação: ");
    Serial.println(reason ? reason : "desconhecido");
  }

  return granted;
}

// =========================================
//        SENSOR ULTRASSÔNICO
// =========================================
float lerDistancia() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duracao = pulseIn(ECHO_PIN, HIGH, 20000);
  if (duracao == 0) return 999.0;

  return (duracao * 0.0343) / 2.0;
}
