import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./src/screens/HomeScreen";
import DetectionResultScreen from "./src/screens/DetectionResultScreen";
import ReportFormScreen from "./src/screens/ReportFormScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import LeaderboardScreen from "./src/screens/LeaderboardScreen";
import PrivacyNoticeScreen from "./src/screens/PrivacyNoticeScreen";
import ViolationCriteriaScreen from "./src/screens/ViolationCriteriaScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShadowVisible: false }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Billboard Reporter" }}
        />
        <Stack.Screen
          name="DetectionResult"
          component={DetectionResultScreen}
          options={{ title: "Detection Result" }}
        />
        <Stack.Screen
          name="ReportForm"
          component={ReportFormScreen}
          options={{ title: "Submit Report" }}
        />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
        <Stack.Screen
          name="PrivacyNotice"
          component={PrivacyNoticeScreen}
          options={{ title: "Privacy Notice" }}
        />
        <Stack.Screen
          name="ViolationCriteria"
          component={ViolationCriteriaScreen}
          options={{ title: "Violation Criteria" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
