// ===== CODIGO TESTE =====

#include <SPI.h>
#include <MFRC522.h>

// ===== RFID =====
#define SS_PIN 5
#define RST_PIN 4

MFRC522 rfid(SS_PIN, RST_PIN);

// ===== LEDs =====
#define LED_VERDE 32
#define LED_VERMELHO 33

// UID autorizado
String uidAutorizado = "25 B2 95 02 ";

void setup() {

  Serial.begin(115200);

  // Configura LEDs
  pinMode(LED_VERDE, OUTPUT);
  pinMode(LED_VERMELHO, OUTPUT);

  // Estado inicial
  digitalWrite(LED_VERDE, LOW);
  digitalWrite(LED_VERMELHO, HIGH);

  // Inicializa RFID
  SPI.begin();
  rfid.PCD_Init();

  Serial.println("=== SISTEMA RFID ===");
  Serial.println("Aguardando tag...");
}

void loop() {

  // Mantém vermelho ligado esperando cartão
  digitalWrite(LED_VERMELHO, HIGH);

  // Verifica cartão
  if (!rfid.PICC_IsNewCardPresent()) {
    return;
  }

  // Lê cartão
  if (!rfid.PICC_ReadCardSerial()) {
    return;
  }

  // Monta UID
  String uid = "";

  for (byte i = 0; i < rfid.uid.size; i++) {

    if (rfid.uid.uidByte[i] < 0x10) {
      uid += "0";
    }

    uid += String(rfid.uid.uidByte[i], HEX);
    uid += " ";
  }

  uid.toUpperCase();

  Serial.print("UID da tag: ");
  Serial.println(uid);

  // ===== TAG AUTORIZADA =====
  if (uid == uidAutorizado) {

    Serial.println("ACESSO LIBERADO");

    // Apaga vermelho
    digitalWrite(LED_VERMELHO, LOW);

    // Acende verde
    digitalWrite(LED_VERDE, HIGH);

    delay(3000);

    // Apaga verde
    digitalWrite(LED_VERDE, LOW);

    // Volta vermelho
    digitalWrite(LED_VERMELHO, HIGH);
  }

  // ===== TAG NÃO AUTORIZADA =====
  else {

    Serial.println("ACESSO NEGADO");

    // Pisca vermelho
    digitalWrite(LED_VERMELHO, LOW);
    delay(200);

    digitalWrite(LED_VERMELHO, HIGH);
    delay(200);

    digitalWrite(LED_VERMELHO, LOW);
    delay(200);

    digitalWrite(LED_VERMELHO, HIGH);
  }

  // Finaliza leitura
  rfid.PICC_HaltA();

  delay(500);
}
