import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Button,
  Animated,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import PrimaryButton from "../components/PrimaryButton";
import Card from "../components/Card";

export default function DetectionResultScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [uploading, setUploading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef<CameraView | null>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>We need permission to show the camera</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setImageUri(photo.uri);
        setResult(null); // Clear previous results
      } catch (err) {
        console.log("Error taking photo:", err);
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
      } as any);

      const response = await fetch("http://192.168.43.18:5000/api/detect", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);

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
        message: "Upload failed. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
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
            label={uploading ? "Uploading..." : "Upload & Detect"}
            onPress={uploadPhoto}
            disabled={uploading}
          />
        </View>
      </Card>

      {result && (
        <Animated.View style={[styles.resultContainer, { opacity: fadeAnim }]}>
          <Card
            style={[
              styles.card,
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
                {result.success ? "Detection Complete!" : "Upload Failed"}
              </Text>
            </View>

            <Text style={styles.resultMessage}>{result.message}</Text>

            {result.success && result.violations && (
              <View style={styles.violationsContainer}>
                <Text style={styles.violationsTitle}>Violations Detected:</Text>
                {result.violations.map((violation: any, idx: number) => (
                  <View key={idx} style={styles.violationItem}>
                    <View style={styles.violationHeader}>
                      <Text style={styles.violationType}>
                        🚨 {violation.type}
                      </Text>
                    </View>
                    <Text style={styles.violationDescription}>
                      {violation.description}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {result.success && (
              <View style={styles.successActions}>
                <PrimaryButton
                  label="New Detection"
                  onPress={() => {
                    setResult(null);
                    setImageUri(null);
                    fadeAnim.setValue(0);
                  }}
                  style={styles.actionButton}
                />
              </View>
            )}
          </Card>
        </Animated.View>
      )}

      {!result && (
        <Card style={styles.card}>
          <Text style={styles.title}>Detection Summary</Text>
          <Text style={styles.body}>
            Upload a photo to detect billboard violations. Our AI will analyze
            dimensions, placement, and compliance with local regulations.
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
  card: {
    marginVertical: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
  preview: {
    height: 300,
    borderRadius: 12,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 15,
    gap: 10,
  },
  button: {
    flex: 1,
  },
  resultContainer: {
    marginTop: 10,
  },
  resultHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  resultIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "800",
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
    marginBottom: 20,
    lineHeight: 24,
  },
  violationsContainer: {
    marginTop: 20,
  },
  violationsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 15,
  },
  violationItem: {
    backgroundColor: "#FEF3C7",
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  violationHeader: {
    marginBottom: 8,
  },
  violationType: {
    fontSize: 16,
    fontWeight: "700",
    color: "#92400E",
  },
  violationDescription: {
    fontSize: 14,
    color: "#78350F",
    lineHeight: 20,
  },
  successActions: {
    marginTop: 25,
    alignItems: "center",
  },
  actionButton: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
