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
DynamicJsonDocument routeDoc(1024);
JsonArray route;
int currentStationIndex = 0;
String busRouteEndpointString = "http://" + String(server) + ":" + String(backendPort) + "/busRoute";
String reverseGeocodeEndpoint = "https://api.tomtom.com/search/2/reverseGeocode/";
String etaEndpoint = "https://api.tomtom.com/routing/1/calculateRoute/";
const char *busRouteEndpoint = busRouteEndpointString.c_str();
WiFiClient wifiClient;

// 1883 is the listener port for the Broker
PubSubClient client(server, 1883, wifiClient);

float latitude, longitude;
int year, month, date, hour, minute, second;
String date_str, time_str, lat_str, lng_str;
int pm;

String getStationInfo(int index)
{
  if (index >= 0 && index < route.size())
  {
    JsonObject routeElement = route[index].as<JsonObject>();
    const size_t bufferSize = JSON_OBJECT_SIZE(10);
    StaticJsonDocument<10> jsonBuffer;
    serializeJson(routeElement, jsonBuffer);
    // Convert the buffer to a String
    String jsonString;
    serializeJson(jsonBuffer, jsonString);
    return jsonString;
  }

  if (index < 0)
  {
    return "Began journey";
  }

  return "Last station";
}

String getLocationAddress(float latitude, float longitude)
{
  HTTPClient http;
  String endpoint = reverseGeocodeEndpoint + String(latitude) + "," + String(longitude) + ".json?key=" + MAPS_API_KEY + "&radius=100";
  Serial.print("Hitting on ");
  Serial.println(endpoint);
  http.begin(wifiClient, endpoint);
  int responseCode = http.GET();

  if (responseCode > 0)
  {
    String jsonString = http.getString();
    DynamicJsonDocument jsonDoc(1024);
    deserializeJson(jsonDoc, jsonString);
    String addressArray = jsonDoc["addresses"].as<JsonArray>();
    JsonObject addressElement = addressArray[0].as<JsonObject>();
    JsonObject element = addressElement["address"].as<JsonObject>();
    String locationAddress = element["street"] + element["municipalitySecondarySubdivision"] + element["municipalitySubdivision"];
    Serial.println(locationAddress);
    return locationAddress;
  }

  return "error";
}

String convertSecondsToTime(String time)
{
  int seconds = time.toInt();
  int hours = (seconds / 3600);
  int minutes = ((seconds % 3600) / 60);

  String timeString = "";
  if (hours > 0)
  {
    timeString += hours + ' hour(s) ';
  }
  if (minutes > 0)
  {
    timeString += minutes + ' minute(s) ';
  }

  return timeString;
}

String getETA(float latitude, float longitude, String nextStationLatitude, String nextStationLongitude)
{
  HTTPClient http;
  String endpoint = etaEndpoint + String(latitude) + "," + String(longitude) ":" + nextStationLatitude + "," + nextStationLongitude + "/json?&sectionType=traffic&report=effectiveSettings&routeType=eco&traffic=true&avoid=unpavedRoads&travelMode=bus&vehicleMaxSpeed=80&vehicleCommercial=true&vehicleEngineType=combustion&key=" + MAPS_API_KEY;
  Serial.print("Htting on ");
  Serial.println(endpoint);
  http.begin(wifiClient, endpoint);
  int reponseCode = http.GET();

  if (responseCode > 0)
  {
    String jsonString = http.getString();
    DynamicJsonDocument jsonDoc(1024);
    deserializeJson(jsonDoc, jsonString);
    JsonArray routes = jsonDoc["routes"].as<JsonArray>();
    JsonObject requiredRoute = routes[0].as<JsonObject>();
    JsonObject summary = requiredRoute["summary"].as<JsonObject>();
    String eta = convertSecondsToTime(String(summary["travelTimeInSeconds"]));
    return eta;
  }

  return "error";
}

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

  if (httpResponseCode > 0)
  {
    String jsonString = http.getString();
    deserializeJson(routeDoc, jsonString);
    route = routeDoc["route"].as<JsonArray>();
  }
}

void loop()
{
  StaticJsonDocument<100> jsonDoc;
  latitude = 18.5296012;
  longitude = 73.8312071;
  jsonDoc["latitude"] = lat_str;
  jsonDoc["longitude"] = lng_str;
  jsonDoc["location"] = getLocationAddress(latitude, longitude);
  jsonDoc["nextStation"] = getStationInfo(currentStationIndex + 1);
  jsonDoc["previousStation"] = getStationInfo(currentStationIndex - 1);
  jsonDoc["eta"] = getETA(latitude, longitude, nextStation["latitude"], nextStation["longitude"]);

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
