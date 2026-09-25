import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI } from "../api";
import Card from "../components/Card";

export default function LoginScreen({ route }) {
  const { setIsAuthenticated } = route.params;
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "public",
  });

  const handleSubmit = async () => {
    console.log("🔄 Login attempt started...");

    if (!formData.email || !formData.password) {
      console.log("❌ Validation failed: Missing email or password");
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!isLogin && !formData.name) {
      console.log("❌ Validation failed: Missing name for registration");
      Alert.alert("Error", "Please enter your name");
      return;
    }

    setLoading(true);

    try {
      console.log("📤 Sending request:", {
        isLogin,
        email: formData.email,
        hasPassword: !!formData.password,
      });

      const response = isLogin
        ? await authAPI.login({
            email: formData.email,
            password: formData.password,
          })
        : await authAPI.register(formData);

      console.log("📥 Response received:", response.status);
      console.log("📄 Response data:", response.data);

      if (response.data.success && response.data.token) {
        console.log("✅ Authentication successful");

        await AsyncStorage.setItem("authToken", response.data.token);
        await AsyncStorage.setItem(
          "currentUser",
          JSON.stringify(response.data.user)
        );

        console.log("💾 Token and user saved to storage");
        setIsAuthenticated(true);
      } else {
        console.log("❌ Authentication failed: Invalid response format");
        Alert.alert("Error", "Invalid response from server");
      }
    } catch (error) {
      console.error("❌ Authentication error:", error);

      if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
        Alert.alert(
          "Network Error",
          "Cannot connect to server. Check your connection and try again."
        );
      } else {
        const errorMsg =
          error.response?.data?.error ||
          error.message ||
          "Authentication failed";
        Alert.alert("Error", errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <Text style={styles.title}>📢 Billboard Reporter</Text>
        <Text style={styles.subtitle}>
          {isLogin ? "Sign in to your account" : "Create your account"}
        </Text>

        <Card style={styles.formCard}>
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                placeholder="Enter your full name"
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(text) =>
                setFormData({ ...formData, password: text })
              }
              placeholder="Enter your password"
              secureTextEntry
            />
          </View>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Type</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioOption,
                    formData.role === "public" && styles.radioSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, role: "public" })}
                >
                  <Text style={styles.radioText}>👤 Public User</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.radioOption,
                    formData.role === "organization" && styles.radioSelected,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, role: "organization" })
                  }
                >
                  <Text style={styles.radioText}>🏢 Government Official</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading
                ? "Please wait..."
                : isLogin
                ? "🔓 Sign In"
                : "✨ Create Account"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.switchButtonText}>
              {isLogin
                ? "Don't have an account? Create one"
                : "Already have an account? Sign in"}
            </Text>
          </TouchableOpacity>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 32,
  },
  formCard: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  radioGroup: {
    gap: 8,
  },
  radioOption: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  radioSelected: {
    borderColor: "#0A84FF",
    backgroundColor: "#EBF8FF",
  },
  radioText: {
    fontSize: 16,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#0A84FF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  switchButton: {
    marginTop: 16,
    alignItems: "center",
  },
  switchButtonText: {
    color: "#0A84FF",
    fontSize: 14,
    fontWeight: "500",
  },
});
