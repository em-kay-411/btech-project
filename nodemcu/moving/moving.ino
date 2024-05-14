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
const char *MAPS_API_KEY = "RmzArsSVUBU4VK33WQDGQJWo2m2IDRwb";
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
JsonObject nextStation;

float latitudes[] = {18.52853,18.52856,18.52844,18.52831,18.52817,18.5281,18.52802,18.52799,18.52801,18.52803,18.52811,18.52825,18.52832,18.52852,18.52935,18.52957,18.52969,18.5298,18.53,18.53036,18.53053,18.53065,18.53041,18.53007,18.52986,18.52981,18.52978,18.52974,18.52972,18.52968,18.52965,18.52963,18.52963,18.5296,18.52959,18.5296,18.52961,18.52968,18.52982,18.53002,18.53006,18.53008,18.5301,18.5301,18.53009,18.53,18.52993,18.52992,18.52988,18.5298,18.52975,18.52953,18.52871,18.52819,18.52804,18.52798,18.52792,18.52785,18.52782,18.52763,18.52742,18.52728,18.52723,18.52718,18.52705,18.52684,18.52671,18.52628,18.5261,18.5261,18.52615,18.52633,18.52676,18.52706,18.5271,18.52736,18.52736,18.5271,18.52714,18.52716,18.52725,18.52729,18.52733,18.52728,18.52723,18.52718,18.52705,18.52684,18.52671,18.52628,18.5261,18.5261,18.52585,18.52572,18.52565,18.52558,18.52544,18.52541,18.52527,18.52499,18.52467,18.52412,18.52399,18.52396,18.52385,18.52391,18.52399,18.5241,18.52429,18.52447,18.52459,18.5248,18.52509,18.52527,18.52538,18.52555,18.52612,18.52643,18.52698,18.52714,18.52707,18.5269,18.52683,18.5265,18.52618,18.52597,18.52593,18.52589,18.52587,18.52586,18.52585,18.52584,18.52582,18.52588,18.52626,18.52638,18.52663,18.52685,18.52689,18.5269,18.52706,18.52728,18.52733,18.52738,18.5275,18.52754,18.52764,18.52775,18.5278,18.52812,18.52863,18.52876,18.52886,18.52893,18.52896,18.5293,18.52956,18.52977,18.52999,18.53006,18.53022,18.53045,18.53071,18.53073,18.53079,18.5308,18.53087,18.53142,18.53145,18.53146,18.53163,18.53182,18.53188,18.53192,18.532,18.53204,18.53226,18.53251,18.53269,18.53298,18.53318,18.5335,18.53287,18.53273,18.53256,18.53242,18.53226,18.53208,18.53183,18.53143,18.53093,18.53064,18.53049,18.53032,18.52988,18.52988,18.52972,18.5291,18.52921,18.52945,18.52967,18.52981,18.52984,18.52988,18.52992,18.52992,18.52991,18.52991,18.52992,18.52993,18.52994,18.52995,18.52997,18.52998,18.53,18.53001,18.53003,18.53006,18.53008,18.5301,18.53011,18.53023,18.53083,18.531,18.53152,18.5317,18.53183,18.53188,18.53194,18.53197,18.53203,18.53244,18.53255,18.53298,18.53318,18.53346,18.53453,18.53489,18.53501,18.53523,18.53533,18.53537,18.53554,18.53606,18.53608,18.53671,18.53678,18.53709,18.53722,18.53725,18.53738,18.53764,18.53785,18.53845,18.5385,18.53854,18.53859,18.53864,18.53891,18.53921,18.53965,18.53997,18.54023,18.54098,18.54106,18.5413,18.54222,18.54264,18.54296,18.54313,18.54321,18.54325,18.5433,18.54337,18.54346,18.54358,18.54387,18.54427,18.54439,18.54444,18.54464,18.54492,18.54496,18.54503,18.54513,18.54583,18.54591,18.54663,18.54723,18.54763,18.54769,18.54809,18.54817,18.5483,18.54844,18.54873,18.54885,18.54934,18.54957,18.54981,18.54992,18.55,18.55006,18.55022,18.55049,18.55162,18.55204,18.55203,18.55204,18.55213,18.55291,18.55296,18.5538,18.55434,18.55446};
float longitudes[] = {73.87441,73.87479,73.8748,73.87481,73.87481,73.87482,73.87503,73.87514,73.87546,73.87561,73.87621,73.87619,73.87618,73.87614,73.87594,73.87589,73.87586,73.87583,73.87579,73.87568,73.87562,73.87556,73.87529,73.87491,73.87465,73.87458,73.8745,73.87433,73.87389,73.87287,73.87228,73.87207,73.87205,73.87145,73.87119,73.87031,73.87015,73.86974,73.86917,73.86847,73.86832,73.86819,73.86793,73.86781,73.86764,73.86528,73.86399,73.86391,73.86373,73.86345,73.86332,73.86333,73.86339,73.86342,73.86343,73.86344,73.86345,73.86349,73.86341,73.86301,73.86265,73.86241,73.86234,73.86226,73.86205,73.86179,73.86164,73.86127,73.86109,73.86109,73.86103,73.86121,73.86159,73.86195,73.862,73.86166,73.86166,73.862,73.86205,73.86208,73.86222,73.8623,73.86237,73.86241,73.86234,73.86226,73.86205,73.86179,73.86164,73.86127,73.86109,73.86109,73.86081,73.86062,73.86052,73.86041,73.8602,73.86014,73.85991,73.8594,73.85893,73.85826,73.85808,73.85804,73.85787,73.85783,73.85777,73.85769,73.85756,73.85744,73.85736,73.85721,73.85702,73.85686,73.85678,73.85699,73.85668,73.85651,73.85611,73.856,73.85583,73.8555,73.85538,73.85468,73.85405,73.85363,73.85356,73.85346,73.8534,73.85333,73.85327,73.85322,73.85315,73.85309,73.85276,73.85271,73.85243,73.85216,73.8521,73.85208,73.85179,73.85138,73.85128,73.8512,73.85101,73.85094,73.85082,73.85071,73.85066,73.85044,73.85014,73.8501,73.85006,73.85003,73.84997,73.84989,73.84984,73.84981,73.84978,73.84972,73.84954,73.84851,73.84735,73.84726,73.84703,73.84698,73.84673,73.84468,73.84458,73.84455,73.84397,73.84337,73.84323,73.84315,73.84298,73.84291,73.84255,73.84218,73.84191,73.84148,73.84117,73.84068,73.84028,73.84021,73.84011,73.84005,73.83999,73.83997,73.83998,73.84002,73.84011,73.84015,73.83954,73.83894,73.83899,73.83899,73.83901,73.83905,73.83881,73.83829,73.83782,73.83755,73.83752,73.83748,73.83745,73.83743,73.83739,73.83738,73.83735,73.83734,73.83732,73.83731,73.83729,73.83728,73.83728,73.83727,73.83728,73.83729,73.8373,73.83731,73.83734,73.83735,73.83725,73.83722,73.83715,73.83712,73.83711,73.83713,73.83715,73.83717,73.83722,73.83751,73.8376,73.83794,73.83811,73.83833,73.83916,73.83862,73.83843,73.83811,73.83796,73.83791,73.83765,73.83698,73.83695,73.83616,73.83607,73.8357,73.83556,73.83553,73.83538,73.83505,73.83479,73.83399,73.83393,73.83396,73.83401,73.83404,73.83428,73.83458,73.83507,73.83544,73.83572,73.83651,73.8366,73.83686,73.83783,73.83821,73.83841,73.83849,73.83853,73.83855,73.83858,73.83861,73.83865,73.83869,73.83876,73.83879,73.8388,73.8388,73.83882,73.83882,73.83882,73.83882,73.83882,73.8388,73.8388,73.83878,73.83878,73.83878,73.83877,73.83876,73.83876,73.83877,73.8388,73.83889,73.83895,73.83927,73.83944,73.83959,73.83963,73.83965,73.83963,73.83965,73.83967,73.83967,73.83967,73.83934,73.83898,73.839,73.83897,73.83897,73.83897,73.83897,73.83897};
int divisor = 2;
int liveLocationIdx = 0;
int t = 0;

float calculateHaversineDistance(String lat1_string, String long1_string, String lat2_string, String long2_string) {
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

  float a = sin(dLat / 2) * sin(dLat / 2) + cos(x1) * cos(x2) * sin(dLon / 2) * sin(dLon / 2);
  float c = 2 * atan2(sqrt(a), sqrt(1 - a));

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
  Serial.println(endpoint);
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

  if (strcmp((char *)payload, "Route Changed") == 0) {
    ESP.restart();
  } else {
    Serial.print("Message received from control centre - ");
    Serial.println((char *)payload);
  }
}

void markCrossed() {
  HTTPClient http;
  String requestBody = "{\"busID\" : \"" + String(busID) + "\"}";
  http.begin(wifiClient, markNextStationCrossedEndpoint);
  http.addHeader("Content-Type", "application/json");
  int responseCode = http.POST(requestBody);
  Serial.println(responseCode);

  if (responseCode > 0) {
    Serial.println("Marked Crossed");
    currentStationIndex++;
  }

  http.end();
}

void reverseArray() {
  int i = 0;
  int j = route.size() - 1;

  while (i < j) {
    JsonObject temp = route[i].as<JsonObject>();
    route[i] = route[j];
    route[j] = temp;

    i++;
    j--;
  }
}

void reconnect() {
  if (client.connect(clientID)) {
    if (client.subscribe(adminToBusTopic.c_str())) {
      Serial.print("Subscribed to topic");
      Serial.println(adminToBusTopic);
    } else {
      Serial.println("Subscrbe failed");
    }
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


  String command = "connect/" + busIDString;
  client.publish("universal", command.c_str());

  String requestBody = "{\"bus\" : \"" + String(busID) + "\", \"fromBus\" : \"true\" }";
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
  client.setCallback(callback);
  http.end();

  while (currentStationIndex < route.size()) {
    JsonObject temp = route[currentStationIndex].as<JsonObject>();
    if (!temp["crossed"]) {
      break;
    }
    currentStationIndex++;
  }

  Serial.print("Current station index set to ");
  Serial.println(currentStationIndex);
}

void loop() {
  if (!client.connected()) {
    Serial.println("conecting to cilnet");
    reconnect();
  }
  client.loop();
  DynamicJsonDocument jsonDoc(128);
  latitude = latitudes[liveLocationIdx];
  longitude = longitudes[liveLocationIdx];
  if(t % divisor == 0){
    liveLocationIdx++;
  }
  t++;
  String latitude_string = String(latitude, 6);
  String longitude_string = String(longitude, 6);
  jsonDoc["latitude"] = latitude_string;
  jsonDoc["longitude"] = longitude_string;
  jsonDoc["location"] = getLocationAddress(latitude, longitude);
  jsonDoc["nextStation"] = getStationInfo(currentStationIndex);
  jsonDoc["previousStation"] = getStationInfo(currentStationIndex - 1);

  // if (!client.connected()) {
  //   Serial.println("conecting to cilnet");
  //   reconnect();
  // }

  Serial.println(client.connected());
  // for(int i=0; i<route.size(); i++){
  //   JsonObject iter = route[i].as<JsonObject>();
  //   Serial.println(String(iter["name"]));
  // }

  if (currentStationIndex < route.size() - 1) {
    nextStation = route[currentStationIndex].as<JsonObject>();
    // Serial.println(String(nextStation["name"]));
    if (calculateHaversineDistance(latitude_string, longitude_string, nextStation["latitude"], nextStation["longitude"]) < 100) {
      markCrossed();

      if (currentStationIndex == route.size() - 1) {
        reverseArray();
      }
    }
    jsonDoc["eta"] = getETA(latitude_string, longitude_string, nextStation["latitude"], nextStation["longitude"]);
  } else {
    jsonDoc["eta"] = "Last station reached";
  }

  // if (!client.connected()) {
  //   Serial.println("conecting to cilnet");
  //   reconnect();
  // }

  // Convert JSON object to a string
  String jsonString;
  serializeJson(jsonDoc, jsonString);

  // Serial.println(jsonString);

  // Publish the stringified JSON
  if (client.publish(locationTopic.c_str(), jsonString.c_str())) {
    Serial.println("Location sent!");
  } else {
    Serial.println("Location failed to send.Reconnecting to MQTT Broker and trying again");
    reconnect();
    if (client.publish(locationTopic.c_str(), jsonString.c_str())) {
      Serial.println("connected and sent");
    } else {
      Serial.println("unable to send");
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