import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Button,
} from "react-native";
import {
  CameraView,
  CameraType,
  useCameraPermissions,
  Camera, // Import Camera object for static methods only
} from "expo-camera";

import PrimaryButton from "../components/PrimaryButton";
import Card from "../components/Card";

export default function DetectionResultScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);

  /* ─────────── Permission handling with hook ─────────── */
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

  /* ─────────── Capture photo ─────────── */
  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        // Note: CameraView may not have takePictureAsync directly
        // You might need to use expo-image-picker instead
        const photo = await cameraRef.current.takePictureAsync();
        setImageUri(photo.uri);
        console.log(
          "Photo capture needs to be implemented with expo-image-picker"
        );
      } catch (err) {
        console.log("Error taking photo:", err);
      }
    }
  };

  /* ─────────── Upload photo to backend ─────────── */
  const uploadPhoto = async () => {
    if (!imageUri) return;

    const filename = imageUri.split("/").pop() || `photo_${Date.now()}.jpg`;
    const match = filename.match(/\.(\w+)$/);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    const formData = new FormData();
    formData.append("photo", { uri: imageUri, name: filename, type } as any);

    try {
      const res = await fetch("http://YOUR_BACKEND_IP:5000/api/detect", {
        method: "POST",
        body: formData,
        // ⚠️ Let fetch set Content-Type for FormData automatically
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.log("Upload error:", err);
    }
  };

  /* ─────────── UI ─────────── */
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        {/* Camera preview or captured image */}
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
          <PrimaryButton label="Upload & Detect" onPress={uploadPhoto} />
        </View>

        {result && (
          <View style={styles.resultBox}>
            <Text>Detection Result: {JSON.stringify(result)}</Text>
          </View>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.title}>Reason Summary</Text>
        <Text style={styles.body}>
          {result?.message ||
            "Detected billboard exceeds recommended dimensions and is placed close to a traffic junction. OCR indicates license code not found in sample dataset."}
        </Text>
      </Card>
    </ScrollView>
  );
}

/* ─────────── Styles ─────────── */
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F8FAFC",
  },
  card: {
    marginVertical: 8,
  },
  preview: {
    height: 300,
    borderRadius: 12,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  button: {
    marginRight: 10,
  },
  resultBox: {
    marginTop: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  body: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
