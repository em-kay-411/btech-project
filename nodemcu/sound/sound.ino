#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <SocketIOClient.h>
#include <ArduinoJson.h>
#include <Adafruit_MCP3008.h>
#include <Wire.h>
#include <Adafruit_INA219.h>

// Replace with your network credentials
const char *ssid = "M.A.S_Sheel_2.4ghZ";
const char *password = "masyamatlal";

// Replace with your Socket.IO server details
const char* socketIOHost = "http://192.168.0.118";
const int socketIOPort = 5000;

// Replace with your microphone pin
const int microphonePin = A0;
SocketIOClient socketIO;

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

  // Initialize Socket.IO
  socketIO.begin(socketIOHost, socketIOPort);

  // Initialize microphone pin
  pinMode(microphonePin, INPUT);

  // Start Socket.IO event listener
  socketIO.on("connect", handleConnect);
  socketIO.on("disconnect", handleDisconnect);

  // Connect to Socket.IO
  socketIO.connect();
}

void loop() {
  socketIO.loop();

  // Read sound from microphone and send it to the web browser
  int soundValue = analogRead(microphonePin);
  socketIO.emit("soundData", String(soundValue));
  delay(100); // Adjust delay as needed
}

void handleConnect(uint8_t* payload, size_t length) {
  Serial.println("Connected to Socket.IO server");
}

void handleDisconnect(uint8_t* payload, size_t length) {
  Serial.println("Disconnected from Socket.IO server");
}
