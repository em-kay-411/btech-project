#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <WebSocketsServer.h>
#include <Base64.h>
#include "PubSubClient.h"

WiFiClient wifiClient;
const char  * busID = "12345";
const char * clientID = busID;
String busIDString = "12345";
String busToAdminTopic = "busToAdmin/" + busIDString;
bool flag = false;


// Replace with your network credentials
const char *ssid = "M.A.S_Sheel_2.4ghZ";
const char *password = "masyamatlal";
const char *server = "192.168.0.118";

PubSubClient client(server, 1883, wifiClient);


// Replace with your microphone pin
const int microphonePin = A0;
const int buttonPin = D7;

int prev_button_state = LOW;
int button_state;

WebSocketsServer webSocket = WebSocketsServer(81);  // WebSocket server on port 81

const int sampleRate = 8000;          // Sample rate for PCM encoding
const int numSamplesPerPacket = 256;  // Number of samples to send per WebSocket packet

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
  Serial.println(WiFi.localIP());

  while (!client.connect(clientID)) {    
    delay(500); 
    Serial.println("Connection to MQTT Broker failed…");       
  }

  delay(5000);
  pinMode(microphonePin, INPUT);
  pinMode(buttonPin, INPUT_PULLUP);

  // Start WebSocket server
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}

void convertIntArrayToBinary(int *intArray, uint8_t *binaryData, size_t arrayLength) {
  // Copy the integer array into the binary data buffer
  memcpy(binaryData, intArray, arrayLength * sizeof(int));
}

void loop() {
  webSocket.loop();  // Handle WebSocket events
  button_state = digitalRead(buttonPin);
  if (prev_button_state == HIGH && button_state == LOW) {
    Serial.println("button pressed");
    if(!flag){
      String IPString = "connect-voice/" + busIDString;
      client.publish(busToAdminTopic.c_str(), IPString.c_str());
      flag = true;
    };
  } else if (prev_button_state == LOW && button_state == HIGH) {
    Serial.println("button released");
    client.publish(busToAdminTopic.c_str(), "disconnect-voice/");
    delay(500);
    flag = false;
  }
  delay(5);  // Adjust delay as needed

  if(flag){   
    int16_t analogValues[numSamplesPerPacket];

    for (int i = 0; i < numSamplesPerPacket; i++) {
      int sensorValue = analogRead(microphonePin);
      analogValues[i] = sensorValue;
      Serial.println(sensorValue);
    }
    webSocket.broadcastBIN((uint8_t*)(analogValues), numSamplesPerPacket * sizeof(int16_t));
  }
  prev_button_state = button_state;
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t *payload, size_t length) {
  switch(type){
    case WStype_BIN:
      for(int i=0; i<length; i++){
        Serial.println(payload[i]);
      }
      break;
  }
}
