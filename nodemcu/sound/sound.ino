#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <WebSocketsServer.h>
#include <Base64.h>

// Replace with your network credentials
const char *ssid = "M.A.S_Sheel_2.4ghZ";
const char *password = "masyamatlal";

// Replace with your microphone pin
const int microphonePin = A0;

WebSocketsServer webSocket = WebSocketsServer(81); // WebSocket server on port 81

const int sampleRate = 8000;         // Sample rate for PCM encoding
const int numSamplesPerPacket = 256; // Number of samples to send per WebSocket packet

void setup()
{
    Serial.begin(115200);

    // Connect to Wi-Fi
    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }
    Serial.println("WiFi connected");
    Serial.println(WiFi.localIP());
    delay(5000);
    pinMode(microphonePin, INPUT);

    // Start WebSocket server
    webSocket.begin();
    webSocket.onEvent(webSocketEvent);
}

void convertIntArrayToBinary(int* intArray, uint8_t* binaryData, size_t arrayLength) {
    // Copy the integer array into the binary data buffer
    memcpy(binaryData, intArray, arrayLength * sizeof(int));
}

void loop()
{
    webSocket.loop(); // Handle WebSocket events
    int analogValues[numSamplesPerPacket];
    for(int i=0; i<numSamplesPerPacket; i++){
      int sensorValue = analogRead(microphonePin);
      analogValues[i] = sensorValue;
    }
    uint8_t* binaryData = (uint8_t *)malloc(sizeof(analogValues));
    convertIntArrayToBinary(analogValues, binaryData, sizeof(analogValues) / sizeof(int));
    free(binaryData);
    // Send Base64 encoded data as text
    webSocket.broadcastBIN(binaryData, sizeof(binaryData));
    // webSocket.broadcastTXT("sent", 4, false);
    delay(5); // Adjust delay as needed
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t *payload, size_t length)
{
}
