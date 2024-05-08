#include <TinyGPS++.h>
#include <SoftwareSerial.h>
#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <ESP8266HTTPClient.h>
#include "PubSubClient.h"
#include <ArduinoJson.h>
#include <math.h>

#define EARTH_RADIUS 6371000

TinyGPSPlus gps;          // The TinyGPS++ object
SoftwareSerial ss(4, 5);  // The serial connection to the GPS device
const char *busID = "12345";
String busIDString = "12345";
const char *clientID = "12345";
const char *ssid = "Galaxy M3194C2";
const char *password = "eeyy6643";
const char *server = "192.168.199.186";
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
String markNextStationCrossedEndpoint = "http://" + String(server) + ":" + String(backendPort) + "/markNextStationCrossed";
const char *busRouteEndpoint = busRouteEndpointString.c_str();
WiFiClient wifiClient;
WiFiClientSecure wifiClientSecure;

// 1883 is the listener port for the Broker
PubSubClient client(server, 1883, wifiClient);

float latitude, longitude;
int year, month, date, hour, minute, second;
String date_str, time_str, lat_str, lng_str;
int pm;

float calculateHaversineDistance(String lat1_string, String long1_string, String lat2_string, String long2_string){
  float lat1 = atof(lat1_string.c_str());
  float long1 = atof(long1_string.c_str());
  float lat2 = atof(lat2_string.c_str());
  float long2 = atof(long2_string.c_str());

  float x1 = lat1 * M_PI / 180;
  float y1 = long1 * M_PI / 180;
  float x2 = lat2 * M_PI / 180;
  float y2 = long2 * M_PI / 180;

  float dLat = x2 - x1;
  float dLon = y2 - y1;

  float a = sin(dLat/2) * sin(dLat/2) + cos(x1) * cos(x2) * sin(dLon/2) * sin(dLon/2);
  float c = 2 * atan2(sqrt(a), sqrt(1-a));

  float distance = EARTH_RADIUS * c;
  Serial.println(distance);

  return distance;
}

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
  // Serial.print("Hitting on ");
  // Serial.println(endpoint);
  http.begin(wifiClientSecure, endpoint);
  int responseCode = http.GET();
  // Serial.print("response code ");
  // Serial.println(responseCode);

  if (responseCode > 0) {
    String jsonString = http.getString();
    DynamicJsonDocument jsonDoc(256);
    deserializeJson(jsonDoc, jsonString);
    JsonArray addressArray = jsonDoc["addresses"].as<JsonArray>();
    JsonObject addressElement = addressArray[0].as<JsonObject>();
    JsonObject element = addressElement["address"].as<JsonObject>();
    String locationAddress = String(element["street"]) + "," + String(element["municipalitySecondarySubdivision"]) + "," + String(element["municipalitySubdivision"]);
    // Serial.println(locationAddress);
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
  // Serial.print("Htting on ");
  // Serial.println(endpoint);
  http.begin(wifiClientSecure, endpoint);
  int responseCode = http.GET();
  // Serial.print("response code");
  // Serial.println(responseCode);

  if (responseCode > 0) {
    String jsonString = http.getString();
    DynamicJsonDocument jsonDoc(jsonString.length());
    deserializeJson(jsonDoc, jsonString);
    JsonArray routes = jsonDoc["routes"].as<JsonArray>();
    JsonObject requiredRoute = routes[0].as<JsonObject>();
    JsonObject summary = requiredRoute["summary"].as<JsonObject>();
    // Serial.print("Travel time");
    // Serial.println(summary["travelTimeInSeconds"].as<String>());
    String eta = convertSecondsToTime(String(summary["travelTimeInSeconds"]));
    jsonDoc.clear();
    return eta;
  }

  http.end();

  return "error";
}

void callback(char *topic, byte *payload, unsigned int length) {
  payload[length] = '\0';
  Serial.println("Message Receoved");

  if(strcmp((char*)payload, "Route Changed") == 0){
    ESP.restart();
  }
  else{
    Serial.print("Message received from control centre - ");
    Serial.println((char*)payload);
  }
}

void markCrossed(){
  HTTPClient http;
  String requestBody = "{\"busID\" : \"" + String(busID) + "\"}";
  http.begin(wifiClient, markNextStationCrossedEndpoint);
  http.addHeader("Content-Type", "application/json");
  int responseCode = http.POST(requestBody);
  Serial.println(responseCode);

  if(responseCode > 0){
    Serial.println("Marked Crossed");
    currentStationIndex++;
  }

  http.end();
}

void reverseArray(){
  int i = 0;
  int j = route.size() - 1;

  while(i < j){
    JsonObject temp = route[i].as<JsonObject>();
    route[i] = route[j];
    route[j] = temp;

    i++;
    j--;
  }
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
    Serial.println(client.state());  
  }
  
  Serial.println("Connected to MQTT Broker !");

  String requestBody = "{\"bus\" : \"" + String(busID) + "\"}";


  HTTPClient http;
  // Serial.print("Htting to ");
  // Serial.println(busRouteEndpoint);
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

  while(currentStationIndex < route.size()){
    JsonObject temp = route[currentStationIndex].as<JsonObject>();
    if(!temp["crossed"]){
      break;
    }
    currentStationIndex++;
  }

  Serial.print("Current station index set to ");
  Serial.println(currentStationIndex);
}

void loop() {
  client.loop();
  DynamicJsonDocument jsonDoc(128);
  latitude = 18.61074;
  longitude = 73.74401;
  String latitude_string = String(latitude, 6);
  String longitude_string = String(longitude, 6);
  jsonDoc["latitude"] = latitude_string;
  jsonDoc["longitude"] = longitude_string;
  jsonDoc["location"] = getLocationAddress(latitude, longitude);
  jsonDoc["nextStation"] = getStationInfo(currentStationIndex);
  jsonDoc["previousStation"] = getStationInfo(currentStationIndex - 1);
  if (currentStationIndex < route.size() - 1) {
    JsonObject nextStation = route[currentStationIndex].as<JsonObject>();
    if(calculateHaversineDistance(latitude_string, longitude_string, nextStation["latitude"], nextStation["longitude"]) < 100){
      markCrossed();

      if(currentStationIndex == route.size() - 1){
        reverseArray();
      }
    }
    jsonDoc["eta"] = getETA(latitude_string, longitude_string, nextStation["latitude"], nextStation["longitude"]);
    nextStation.clear();
  } else {
    jsonDoc["eta"] = "Last station reached";
  }

  

  // Convert JSON object to a string
  String jsonString;
  serializeJson(jsonDoc, jsonString);

  // Serial.println(jsonString);

  // Publish the stringified JSON
  if (client.publish(locationTopic.c_str(), jsonString.c_str())) {
    Serial.println("Location sent!");
  } else {
    Serial.println("Location failed to send.Reconnecting to MQTT Broker and trying again");
    if (client.connect(clientID)) {
      delay(50);  // This delay ensures that client.publish doesn’t clash with the client.connect call
      // Serial.print("SIze");
      // Serial.println(jsonString.length());
      client.setBufferSize(512);
      delay(50);
      if(client.subscribe(adminToBusTopic.c_str())){
        Serial.print("Subscribed to topic");
        Serial.println(adminToBusTopic);
      }
      else{
        Serial.println("Subscrbe failed");
      }      
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
          client.setBufferSize(512);
          delay(10);  // This delay ensures that client.publish doesn’t clash with the client.connect call
          client.setCallback(callback);
          client.publish(locationTopic.c_str(), jsonString.c_str());
        }
      }
    }
  jsonDoc.clear();
  delay(1000);
}