#include <TinyGPS++.h>
#include <SoftwareSerial.h>
#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <ESP8266HTTPClient.h>
#include "PubSubClient.h"
#include <ArduinoJson.h>
TinyGPSPlus gps;          // The TinyGPS++ object
SoftwareSerial ss(4, 5);  // The serial connection to the GPS device
const char *busID = "1";
String busIDString = "1";
const char *clientID = "1";
const char *ssid = "M.A.S_Sheel_2.4ghZ";
const char *password = "masyamatlal";
const char *server = "192.168.0.118";
const char *backendPort = "3050";
const char *MAPS_API_KEY = "YwnGgYME2e9Yhc5cENrbjM5NyRibrscM";
DynamicJsonDocument routeDoc(64);
JsonArray route;
int currentStationIndex = 0;
String busRouteEndpointString = "http://" + String(server) + ":" + String(backendPort) + "/busRoute";
String reverseGeocodeEndpoint = "https://api.tomtom.com/search/2/reverseGeocode/";
String etaEndpoint = "https://api.tomtom.com/routing/1/calculateRoute/";
String locationTopic = "location/" + busIDString;
String adminToBusTopic = "adminToBus/" + busIDString;
const char *busRouteEndpoint = busRouteEndpointString.c_str();
WiFiClient wifiClient;
WiFiClientSecure wifiClientSecure;

// 1883 is the listener port for the Broker
PubSubClient client(server, 1883, wifiClient);

float latitude, longitude;
int year, month, date, hour, minute, second;
String date_str, time_str, lat_str, lng_str;
int pm;

String getStationInfo(int index) {
  if (index >= 0 && index < route.size()) {
    JsonObject routeElement = route[index].as<JsonObject>();
    // StaticJsonDocument<256> doc;
    // serializeJson(routeElement, jsonBuffer);
    // // Convert the buffer to a String
    return routeElement["name"];
  }

  if (index < 0) {
    return "Began journey";
  }

  return "Last station";
}

String getLocationAddress(float latitude, float longitude) {
  HTTPClient http;
  String endpoint = reverseGeocodeEndpoint + String(latitude, 6) + "," + String(longitude, 6) + ".json?key=" + MAPS_API_KEY + "&radius=100";
  Serial.print("Hitting on ");
  Serial.println(endpoint);
  http.begin(wifiClientSecure, endpoint);
  int responseCode = http.GET();
  Serial.print("response code ");
  Serial.println(responseCode);

  if (responseCode > 0) {
    String jsonString = http.getString();
    DynamicJsonDocument jsonDoc(256);
    deserializeJson(jsonDoc, jsonString);
    JsonArray addressArray = jsonDoc["addresses"].as<JsonArray>();
    JsonObject addressElement = addressArray[0].as<JsonObject>();
    JsonObject element = addressElement["address"].as<JsonObject>();
    String locationAddress = String(element["street"]) + "," + String(element["municipalitySecondarySubdivision"]) + "," + String(element["municipalitySubdivision"]);
    Serial.println(locationAddress);
    jsonDoc.clear();
    return locationAddress;
  }

  Serial.println(http.errorToString(responseCode));
  return "error";
}

String convertSecondsToTime(String time) {
  int seconds = time.toInt();
  int hours = (seconds / 3600);
  int minutes = ((seconds % 3600) / 60);

  String timeString = "";
  if (hours > 0) {
    timeString += String(hours) + " hour(s) ";
  }
  if (minutes > 0) {
    timeString += String(minutes) + " minute(s) ";
  }

  return timeString;
}

String getETA(String latitude, String longitude, String nextStationLatitude, String nextStationLongitude) {
  HTTPClient http;
  String endpoint = etaEndpoint + latitude + "," + longitude + ":" + nextStationLatitude + "," + nextStationLongitude + "/json?&sectionType=traffic&report=effectiveSettings&routeType=eco&traffic=true&avoid=unpavedRoads&travelMode=bus&vehicleMaxSpeed=80&vehicleCommercial=true&vehicleEngineType=combustion&key=" + MAPS_API_KEY;
  Serial.print("Htting on ");
  Serial.println(endpoint);
  http.begin(wifiClientSecure, endpoint);
  int responseCode = http.GET();
  Serial.print("response code");
  Serial.println(responseCode);

  if (responseCode > 0) {
    String jsonString = http.getString();
    DynamicJsonDocument jsonDoc(jsonString.length());
    deserializeJson(jsonDoc, jsonString);
    JsonArray routes = jsonDoc["routes"].as<JsonArray>();
    JsonObject requiredRoute = routes[0].as<JsonObject>();
    JsonObject summary = requiredRoute["summary"].as<JsonObject>();
    Serial.print("Travel time");
    Serial.println(summary["travelTimeInSeconds"].as<String>());
    String eta = convertSecondsToTime(String(summary["travelTimeInSeconds"]));
    jsonDoc.clear();
    return eta;
  }

  http.end();

  return "error";
}

void callback(char *topic, byte *payload, unsigned int length) {
  payload[length] = '\0';
  Serial.println((char)*payload);
}

void setup() {

  Serial.begin(115200);
  ss.begin(9600);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  // Print the IP address
  Serial.println(WiFi.localIP());
  wifiClientSecure.setInsecure();
  while (!client.connect(clientID)) {    
    delay(500); 
    Serial.println("Connection to MQTT Broker failed…");       
  }
  
  Serial.println("Connected to MQTT Broker !");
  String command = "connect/" + busIDString;
  client.publish("universal", command.c_str());

  String requestBody = "{\"bus\" : \"" + String(busID) + "\"}";


  HTTPClient http;
  Serial.print("Htting to ");
  Serial.println(busRouteEndpoint);
  http.begin(wifiClient, busRouteEndpointString);
  http.addHeader("Content-Type", "application/json");
  int httpResponseCode = http.POST(requestBody);

  if (httpResponseCode > 0) {
    String jsonString = http.getString();
    deserializeJson(routeDoc, jsonString);
    route = routeDoc["route"].as<JsonArray>();
  }
  client.setBufferSize(512);
  http.end();
}

void loop() {
  DynamicJsonDocument jsonDoc(128);
  latitude = 18.5296012;
  longitude = 73.8312071;
  String latitude_string = String(latitude, 6);
  String longitude_string = String(longitude, 6);
  jsonDoc["latitude"] = latitude_string;
  jsonDoc["longitude"] = longitude_string;
  jsonDoc["location"] = getLocationAddress(latitude, longitude);
  jsonDoc["nextStation"] = getStationInfo(currentStationIndex + 1);
  jsonDoc["previousStation"] = getStationInfo(currentStationIndex - 1);
  if (currentStationIndex < route.size() - 1) {
    JsonObject nextStation = route[currentStationIndex + 1].as<JsonObject>();
    jsonDoc["eta"] = getETA(latitude_string, longitude_string, nextStation["latitude"], nextStation["longitude"]);
  } else {
    jsonDoc["eta"] = "Last station reached";
  }

  // Convert JSON object to a string
  String jsonString;
  serializeJson(jsonDoc, jsonString);

  Serial.println(jsonString);

  // Publish the stringified JSON
  if (client.publish(locationTopic.c_str(), jsonString.c_str())) {
    Serial.println("Location sent!");
  } else {
    Serial.println("Temperature failed to send.Reconnecting to MQTT Broker and trying again");
    if (client.connect(clientID)) {
      delay(50);  // This delay ensures that client.publish doesn’t clash with the client.connect call
      Serial.print("SIze");
      Serial.println(jsonString.length());
      client.subscribe(adminToBusTopic.c_str());
      delay(50);
      client.setCallback(callback);
      delay(50);
      if (client.publish(locationTopic.c_str(), jsonString.c_str())) {
        Serial.println("connected and sent");
      } else {
        Serial.println("unable to send");
      }
    } else {
      Serial.println("unable to connect");
    }
  }

  while (ss.available() > 0)
    if (gps.encode(ss.read())) {
      if (gps.location.isValid()) {
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
        if (client.publish(locationTopic.c_str(), jsonString.c_str())) {
          client.connect(clientID);
          Serial.println("Location sent!");
        } else {
          Serial.println("Temperature failed to send.Reconnecting to MQTT Broker and trying again");
          client.connect(clientID);
          delay(10);  // This delay ensures that client.publish doesn’t clash with the client.connect call
          client.setCallback(callback);
          client.publish(locationTopic.c_str(), jsonString.c_str());
        }
      }
    }
  jsonDoc.clear();
  delay(1000);
}