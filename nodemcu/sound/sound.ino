#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <WebSocketsServer.h>

// Replace with your network credentials
const char *ssid = "M.A.S_Sheel_2.4ghZ";
const char *password = "masyamatlal";

// Replace with your microphone pin
const int microphonePin = A0;

WebSocketsServer webSocket = WebSocketsServer(81); // WebSocket server on port 81

const int sampleRate = 8000; // Sample rate for PCM encoding
const int numSamplesPerPacket = 256; // Number of samples to send per WebSocket packet

void setup() {
  Serial.begin(115200);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");
  pinMode(microphonePin, INPUT);

  // Start WebSocket server
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}

void loop() {
  webSocket.loop(); // Handle WebSocket events

  // Read samples from the microphone, encode as PCM, and send as WebSocket stream
  int16_t pcmData[numSamplesPerPacket];
  for (int i = 0; i < numSamplesPerPacket; i++) {
    pcmData[i] = analogRead(microphonePin); // Read sample from microphone
  }
  webSocket.broadcastBIN((uint8_t *)pcmData, numSamplesPerPacket * sizeof(int16_t)); // Broadcast PCM data as binary
  delay(5); // Adjust delay as needed
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t *payload, size_t length) {
}
