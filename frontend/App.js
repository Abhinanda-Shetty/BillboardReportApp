import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import screens
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import DetectionResultScreen from "./src/screens/DetectionResultScreen";
import ReportFormScreen from "./src/screens/ReportFormScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import LeaderboardScreen from "./src/screens/LeaderboardScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // Add loading screen here if needed
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#0A84FF" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
            initialParams={{ setIsAuthenticated }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: "📢 Billboard Reporter" }}
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
            <Stack.Screen
              name="History"
              component={HistoryScreen}
              options={{ title: "Report History" }}
            />
            <Stack.Screen
              name="Leaderboard"
              component={LeaderboardScreen}
              options={{ title: "Leaderboard" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
