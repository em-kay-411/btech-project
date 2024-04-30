#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>

// Replace with your network credentials
const char *ssid = "M.A.S_Sheel_2.4ghZ";
const char *password = "masyamatlal";

// Replace with your microphone pin
const int microphonePin = A0;
// SocketIoClient socketIO;

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
}

void loop() {
  int soundValue = analogRead(microphonePin);
  Serial.println(soundValue);
  delay(5); // Adjust delay as needed
}
