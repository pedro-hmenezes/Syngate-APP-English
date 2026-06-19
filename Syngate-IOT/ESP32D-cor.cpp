#include <SPI.h>
#include <MFRC522.h>

// ===== Pinos do RFID =====
#define SS_PIN 5
#define RST_PIN 4
MFRC522 rfid(SS_PIN, RST_PIN);

// ===== Pinos dos LEDs =====
#define LED_VERDE 32
#define LED_VERMELHO 33

// ===== Pinos do Ultrassônico =====
const int TRIG_PIN = 12;
const int ECHO_PIN = 14;

// Coloque o UID da sua tag autorizada aqui
String uidAutorizado = "25 B2 95 02";

void setup() {
  Serial.begin(115200);
  while (!Serial);

  // Configura os Pinos
  pinMode(LED_VERDE, OUTPUT);
  pinMode(LED_VERMELHO, OUTPUT);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  // Inicializa o barramento SPI e o RFID
  SPI.begin();
  rfid.PCD_Init();

  // Estado Inicial: Tudo apagado esperando presença
  digitalWrite(LED_VERDE, LOW);
  digitalWrite(LED_VERMELHO, LOW);

  Serial.println("=========================================");
  Serial.println("  SISTEMA ECONOMICO DE PRESENCA INICIADO ");
  Serial.println("=========================================");
}

void loop() {
  // 1. Monitora a distância constantemente
  float distancia = lerDistancia();

  // Se NÃO houver ninguém perto (maior que 30cm)
  if (distancia > 30.0 || distancia == 0) {
    digitalWrite(LED_VERMELHO, LOW);
    digitalWrite(LED_VERDE, LOW);
    
    // Pequena pausa antes de ler o sensor de novo para estabilidade
    delay(100); 
    return; // Ignora o resto do código e recomeça o loop
  }

  // ===== SE CHEGOU AQUI, SIGNIFICA QUE ALGUÉM SE APROXIMOU (<= 30cm) =====
  
  // Acende o LED Vermelho indicando "Aguardando Cartão"
  digitalWrite(LED_VERMELHO, HIGH);

  // 2. Verifica se há um cartão sendo aproximado
  // Se não houver cartão no milissegundo atual, o loop roda de novo mantendo o vermelho aceso
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    delay(50);
    return; 
  }

  // 3. Se um cartão foi detectado, monta o UID dele
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) {
      uid += "0";
    }
    uid += String(rfid.uid.uidByte[i], HEX);
    if (i < rfid.uid.size - 1) {
      uid += " ";
    }
  }
  uid.toUpperCase();

  Serial.print("\nPresença detectada e Cartão Lido: ");
  Serial.println(uid);

  // 4. Lógica de validação do cartão
  if (uid == uidAutorizado) {
    Serial.println("ACESSO LIBERADO!");
    
    digitalWrite(LED_VERMELHO, LOW); // Apaga o vermelho
    digitalWrite(LED_VERDE, HIGH);   // Acende o verde
    
    delay(3000);                     // Mantém o verde aceso por 3 segundos
    
    digitalWrite(LED_VERDE, LOW);    // Apaga o verde após o tempo
  } else {
    Serial.println("ACESSO NEGADO!");
    
    // Pisca o LED Vermelho rapidamente para indicar erro
    for (int i = 0; i < 3; i++) {
      digitalWrite(LED_VERMELHO, LOW);
      delay(150);
      digitalWrite(LED_VERMELHO, HIGH);
      delay(150);
    }
  }

  // Finaliza a leitura da tag atual
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}

// ==========================================
//           FUNÇÃO DO ULTRASSÔNICO
// ==========================================
float lerDistancia() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Timeout de 20ms (se o som demorar mais que isso para voltar, o objeto está muito longe)
  long duracao = pulseIn(ECHO_PIN, HIGH, 20000); 
  
  if (duracao == 0) {
    return 999.0; // Retorna um valor fora do raio de 30cm
  }
  
  return (duracao * 0.0343) / 2.0;
}