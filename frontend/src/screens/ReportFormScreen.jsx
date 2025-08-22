import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { reportsAPI } from "../api";
import PrimaryButton from "../components/PrimaryButton";
import Card from "../components/Card";
import Tag from "../components/Tag";

const VIOLATION_TYPES = [
  "Oversized",
  "Near Junction",
  "Obscene Content",
  "Rusted/Unsafe",
  "No License QR",
  "Wrong Location",
];

const BILLBOARD_SIZES = [
  "Small (up to 6x4 ft)",
  "Medium (6x4 to 12x8 ft)",
  "Large (12x8 to 20x12 ft)",
  "Extra Large (above 20x12 ft)",
];

const BILLBOARD_TYPES = [
  "Commercial Advertisement",
  "Political Campaign",
  "Event Promotion",
];

export default function ReportFormScreen({ navigation, route }) {
  const [loading, setLoading] = useState(false);
  const [selectedViolations, setSelectedViolations] = useState([]);
  const [imageUri, setImageUri] = useState(route.params?.imageUri || null);
  const [formData, setFormData] = useState({
    location: "",
    size: "",
    type: "",
    content: "",
    notes: "",
  });

  const toggleViolation = (violation) => {
    setSelectedViolations((prev) =>
      prev.includes(violation)
        ? prev.filter((v) => v !== violation)
        : [...prev, violation]
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!formData.location) {
      Alert.alert("Error", "Please enter the location");
      return;
    }

    if (!imageUri) {
      Alert.alert("Error", "Please add an image");
      return;
    }

    setLoading(true);

    try {
      const reportFormData = new FormData();

      // Add location data
      reportFormData.append(
        "location",
        JSON.stringify({
          address: formData.location,
        })
      );

      // Add billboard details
      reportFormData.append(
        "billboardDetails",
        JSON.stringify({
          size: formData.size,
          type: formData.type,
          content: `${
            formData.content
          }\n\nViolations: ${selectedViolations.join(", ")}\n\nNotes: ${
            formData.notes
          }`,
        })
      );

      // Add image
      reportFormData.append("image", {
        uri: imageUri,
        type: "image/jpeg",
        name: "billboard-report.jpg",
      });

      // Add date observed
      reportFormData.append("dateObserved", new Date().toISOString());

      const response = await reportsAPI.createReport(reportFormData);

      if (response.data.success) {
        Alert.alert(
          "Success!",
          "Your report has been submitted successfully.",
          [
            {
              text: "View History",
              onPress: () => navigation.navigate("History"),
            },
            {
              text: "Submit Another",
              onPress: () => {
                // Reset form
                setFormData({
                  location: "",
                  size: "",
                  type: "",
                  content: "",
                  notes: "",
                });
                setSelectedViolations([]);
                setImageUri(null);
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to submit report"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>📍 Location *</Text>
        <TextInput
          style={styles.input}
          value={formData.location}
          onChangeText={(text) => setFormData({ ...formData, location: text })}
          placeholder="Enter full address (e.g., MG Road, Bangalore)"
          multiline
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>📏 Billboard Details</Text>

        <Text style={styles.label}>Size</Text>
        <View style={styles.pickerContainer}>
          {BILLBOARD_SIZES.map((size) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.pickerOption,
                formData.size === size && styles.pickerOptionSelected,
              ]}
              onPress={() => setFormData({ ...formData, size })}
            >
              <Text
                style={[
                  styles.pickerText,
                  formData.size === size && styles.pickerTextSelected,
                ]}
              >
                {size}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Type</Text>
        <View style={styles.pickerContainer}>
          {BILLBOARD_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.pickerOption,
                formData.type === type && styles.pickerOptionSelected,
              ]}
              onPress={() => setFormData({ ...formData, type })}
            >
              <Text
                style={[
                  styles.pickerText,
                  formData.type === type && styles.pickerTextSelected,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Content/Advertisement</Text>
        <TextInput
          style={styles.textArea}
          value={formData.content}
          onChangeText={(text) => setFormData({ ...formData, content: text })}
          placeholder="Describe what the billboard advertises"
          multiline
          numberOfLines={3}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>🚨 Violation Types</Text>
        <View style={styles.tagsContainer}>
          {VIOLATION_TYPES.map((violation) => (
            <TouchableOpacity
              key={violation}
              onPress={() => toggleViolation(violation)}
              activeOpacity={0.7}
            >
              <Tag
                label={`${
                  selectedViolations.includes(violation) ? "✓ " : ""
                }${violation}`}
                style={[
                  styles.violationTag,
                  selectedViolations.includes(violation) &&
                    styles.violationTagSelected,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>📝 Additional Notes</Text>
        <TextInput
          style={styles.textArea}
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          placeholder="Any additional details about the violation..."
          multiline
          numberOfLines={4}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>📸 Photo Evidence *</Text>
        {imageUri ? (
          <View>
            <Text style={styles.imageSelectedText}>✅ Image selected</Text>
            <View style={styles.imageButtons}>
              <PrimaryButton
                label="Change Photo"
                onPress={pickImage}
                style={[styles.imageButton, styles.secondaryButton]}
              />
              <PrimaryButton
                label="Take New Photo"
                onPress={takePhoto}
                style={styles.imageButton}
              />
            </View>
          </View>
        ) : (
          <View style={styles.imageButtons}>
            <PrimaryButton
              label="📷 Take Photo"
              onPress={takePhoto}
              style={styles.imageButton}
            />
            <PrimaryButton
              label="📱 Choose from Gallery"
              onPress={pickImage}
              style={[styles.imageButton, styles.secondaryButton]}
            />
          </View>
        )}
      </Card>

      <PrimaryButton
        label={loading ? "Submitting..." : "📤 Submit Report"}
        onPress={handleSubmit}
        disabled={loading}
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F8FAFC",
  },
  card: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    textAlignVertical: "top",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    textAlignVertical: "top",
    minHeight: 80,
  },
  pickerContainer: {
    gap: 8,
  },
  pickerOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  pickerOptionSelected: {
    borderColor: "#0A84FF",
    backgroundColor: "#EBF8FF",
  },
  pickerText: {
    fontSize: 14,
    color: "#374151",
  },
  pickerTextSelected: {
    color: "#0A84FF",
    fontWeight: "600",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  violationTag: {
    marginBottom: 4,
  },
  violationTagSelected: {
    backgroundColor: "#DBEAFE",
    borderColor: "#0A84FF",
  },
  imageButtons: {
    flexDirection: "row",
    gap: 12,
  },
  imageButton: {
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: "#6B7280",
  },
  imageSelectedText: {
    fontSize: 16,
    color: "#10B981",
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#10B981",
    marginTop: 8,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
});
