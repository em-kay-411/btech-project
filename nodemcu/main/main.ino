#include <TinyGPS++.h>
#include <SoftwareSerial.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include "PubSubClient.h"
#include <ArduinoJson.h>
TinyGPSPlus gps;         // The TinyGPS++ object
SoftwareSerial ss(4, 5); // The serial connection to the GPS device
const char *busID = "1";
const char *clientID = "1";
const char *ssid = "M.A.S_Sheel_2.4ghZ";
const char *password = "masyamatlal";
const char *server = "192.168.0.118";
const char *backendPort = "3050";
const char *MAPS_API_KEY = "YwnGgYME2e9Yhc5cENrbjM5NyRibrscM";
String busRouteEndpointString = "http://" + String(server) + ":" + String(backendPort) + "/busRoute";
const char *busRouteEndpoint = busRouteEndpointString.c_str();
WiFiClient wifiClient;

// 1883 is the listener port for the Broker
PubSubClient client(server, 1883, wifiClient);

float latitude, longitude;
int year, month, date, hour, minute, second;
String date_str, time_str, lat_str, lng_str;
int pm;

void setup()
{
  Serial.begin(115200);
  ss.begin(9600);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  // Print the IP address
  Serial.println(WiFi.localIP());
  if (client.connect(clientID))
  {
    Serial.println("Connected to MQTT Broker !");
  }
  else
  {
    Serial.println("Connection to MQTT Broker failed…");
  }

  String requestBody = "{\"bus\" : \"" + String(busID) + "\"}"; 

  HTTPClient http;
  Serial.print("Htting to ");
  Serial.println(busRouteEndpoint);
  http.begin(wifiClient, busRouteEndpointString);
  http.addHeader("Content-Type", "application/json");
  int httpResponseCode = http.POST(requestBody);

  if(httpResponseCode > 0){
    Serial.println(http.getString());
  }
}

void loop()
{
  while (ss.available() > 0)
    if (gps.encode(ss.read()))
    {
      if (gps.location.isValid())
      {
        latitude = gps.location.lat();
        lat_str = String(latitude, 6);
        longitude = gps.location.lng();
        lng_str = String(longitude, 6);

        Serial.println(lat_str);
        Serial.println(lng_str);
        StaticJsonDocument<100> jsonDoc;
        jsonDoc["latitude"] = lat_str;
        jsonDoc["longitude"] = lng_str;

        // Convert JSON object to a string
        String jsonString;
        serializeJson(jsonDoc, jsonString);

        Serial.println(jsonString);

        // Publish the stringified JSON
        if (client.publish("location/1", jsonString.c_str()))
        {
          Serial.println("Location sent!");
        }
        else
        {
          Serial.println("Temperature failed to send.Reconnecting to MQTT Broker and trying again");
          client.connect(clientID);
          delay(10); // This delay ensures that client.publish doesn’t clash with the client.connect call
          client.publish("location/1", jsonString.c_str());
        }
      }
    }
  delay(100);
}
