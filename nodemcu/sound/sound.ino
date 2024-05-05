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
const int fireSensor = D0;
const int vibrationSensor = D1;

int prev_button_state = LOW;
int button_state;
int present_condition = 0;
int previous_condition = 0;

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
  pinMode(fireSensor, INPUT);
  pinMode(vibrationSensor, INPUT);

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
  if(!client.connected()){
    while (!client.connect(clientID)) {    
      delay(500); 
      Serial.println("Connection to MQTT Broker failed…");       
    }
  }

  present_condition = previous_condition;

  button_state = digitalRead(buttonPin);
  int fire = digitalRead(fireSensor);
  present_condition = digitalRead(vibrationSensor);

  if(previous_condition != present_condition && fire == 0){
    Serial.println("Accident and fire detected");
    String message = "emergency/FireAndAccident";
    client.publish(busToAdminTopic.c_str(), message.c_str());
  }
  else if(previous_condition != present_condition){
    Serial.println("Accident detected");
    String message = "emergency/accident";
    client.publish(busToAdminTopic.c_str(), message.c_str());
  }
  else if(fire == 0){
    Serial.println("FIre detected");
    String message = "emergency/fire";
    client.publish(busToAdminTopic.c_str(), message.c_str());
  }

  delay(50);

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
    delay(50);
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
      for(size_t i=0; i<length; i++){
        Serial.println(payload[i]);
      }
      break;
  }
}
