import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Button,
  Animated,
  Alert,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { detectAPI } from "../api";
import PrimaryButton from "../components/PrimaryButton";
import Card from "../components/Card";

export default function DetectionResultScreen({ navigation }) {
  const [imageUri, setImageUri] = useState(null);
  const [result, setResult] = useState(null);
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [uploading, setUploading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>
          We need permission to show the camera
        </Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setImageUri(photo.uri);
        setResult(null);
      } catch (err) {
        console.log("Error taking photo:", err);
        Alert.alert("Error", "Failed to take photo");
      }
    }
  };

  const uploadPhoto = async () => {
    if (!imageUri) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("photo", {
        uri: imageUri,
        type: "image/jpeg",
        name: "photo.jpg",
      });

      const response = await detectAPI.detect(formData);
      setResult(response.data);

      // Animate success result
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error("Upload failed:", error);
      setResult({
        success: false,
        message:
          error.response?.data?.error || "Upload failed. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const proceedToReport = () => {
    if (result && result.success && imageUri) {
      navigation.navigate("ReportForm", {
        imageUri,
        detectionResult: result,
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.cameraCard}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        ) : (
          <CameraView
            ref={cameraRef}
            style={styles.preview}
            facing={facing}
            onCameraReady={() => console.log("Camera ready")}
          />
        )}

        <View style={styles.buttonRow}>
          <PrimaryButton
            label="Take Photo"
            onPress={takePhoto}
            style={styles.button}
          />
          <PrimaryButton
            label={uploading ? "Analyzing..." : "Analyze Image"}
            onPress={uploadPhoto}
            disabled={uploading || !imageUri}
            style={[
              styles.button,
              { opacity: !imageUri || uploading ? 0.6 : 1 },
            ]}
          />
        </View>
      </Card>

      {result && (
        <Animated.View style={[styles.resultContainer, { opacity: fadeAnim }]}>
          <Card
            style={[
              styles.resultCard,
              result.success ? styles.successCard : styles.errorCard,
            ]}
          >
            <View style={styles.resultHeader}>
              <Text style={styles.resultIcon}>
                {result.success ? "✅" : "❌"}
              </Text>
              <Text
                style={[
                  styles.resultTitle,
                  result.success ? styles.successText : styles.errorText,
                ]}
              >
                {result.success ? "Analysis Complete!" : "Analysis Failed"}
              </Text>
            </View>

            <Text style={styles.resultMessage}>{result.message}</Text>

            {result.success && result.violations && (
              <View style={styles.violationsContainer}>
                <Text style={styles.violationsTitle}>Violations Detected:</Text>
                {result.violations.map((violation, idx) => (
                  <View key={idx} style={styles.violationItem}>
                    <Text style={styles.violationType}>
                      🚨 {violation.type}
                    </Text>
                    <Text style={styles.violationDescription}>
                      {violation.description}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {result.success && (
              <View style={styles.actionButtons}>
                <PrimaryButton
                  label="Submit Report"
                  onPress={proceedToReport}
                  style={[styles.actionButton, styles.submitButton]}
                />
                <PrimaryButton
                  label="New Detection"
                  onPress={() => {
                    setResult(null);
                    setImageUri(null);
                    fadeAnim.setValue(0);
                  }}
                  style={[styles.actionButton, styles.newDetectionButton]}
                />
              </View>
            )}
          </Card>
        </Animated.View>
      )}

      {!result && (
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>📊 AI Detection</Text>
          <Text style={styles.infoText}>
            Take a photo of a billboard to detect potential violations. Our AI
            analyzes:
            {"\n\n"}• Size and dimensions
            {"\n"}• Placement compliance
            {"\n"}• Content appropriateness
            {"\n"}• Structural safety
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F8FAFC",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F8FAFC",
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#374151",
  },
  cameraCard: {
    padding: 16,
    marginBottom: 16,
  },
  preview: {
    height: 300,
    borderRadius: 12,
    backgroundColor: "#000000",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
  },
  resultContainer: {
    marginBottom: 16,
  },
  resultCard: {
    padding: 20,
  },
  successCard: {
    backgroundColor: "#F0FDF4",
    borderColor: "#22C55E",
    borderWidth: 2,
  },
  errorCard: {
    backgroundColor: "#FEF2F2",
    borderColor: "#EF4444",
    borderWidth: 2,
  },
  resultHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  resultIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  successText: {
    color: "#16A34A",
  },
  errorText: {
    color: "#DC2626",
  },
  resultMessage: {
    fontSize: 16,
    textAlign: "center",
    color: "#374151",
    marginBottom: 16,
    lineHeight: 24,
  },
  violationsContainer: {
    marginTop: 16,
  },
  violationsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  violationItem: {
    backgroundColor: "#FEF3C7",
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  violationType: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#92400E",
    marginBottom: 4,
  },
  violationDescription: {
    fontSize: 12,
    color: "#78350F",
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: "#10B981",
  },
  newDetectionButton: {
    backgroundColor: "#6B7280",
  },
  infoCard: {
    backgroundColor: "#EBF8FF",
    borderLeftWidth: 4,
    borderLeftColor: "#0A84FF",
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E40AF",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#1E3A8A",
    lineHeight: 20,
  },
});
