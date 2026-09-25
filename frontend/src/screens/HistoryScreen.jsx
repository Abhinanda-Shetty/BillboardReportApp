import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { reportsAPI } from "../api"; // ✅ Named import
import Card from "../components/Card";

export default function HistoryScreen() {
  const [reports, setReports] = useState([]); // ✅ Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Fetching reports...");

      const response = await reportsAPI.getReports();
      console.log("📥 Reports response:", response.data);

      if (response.data && response.data.success) {
        setReports(response.data.reports || []);
        console.log(`📊 Loaded ${response.data.reports?.length || 0} reports`);
      } else {
        console.log("⚠️ Invalid response format");
        setReports([]);
      }
    } catch (error) {
      console.error("❌ Fetch reports error:", error);
      setError(
        error.response?.data?.error ||
          error.message ||
          "Failed to fetch reports"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchReports}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderReport = ({ item }) => (
    <Card style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportId}>
          Report #{item._id?.slice(-6) || "N/A"}
        </Text>
        <Text style={[styles.status, getStatusStyle(item.status)]}>
          {item.status?.toUpperCase() || "UNKNOWN"}
        </Text>
      </View>

      <Text style={styles.location}>
        📍 {item.location?.address || "No location"}
      </Text>

      {item.billboardDetails?.content && (
        <Text style={styles.description}>{item.billboardDetails.content}</Text>
      )}

      <View style={styles.reportFooter}>
        <Text style={styles.date}>
          {item.dateReported
            ? new Date(item.dateReported).toLocaleDateString()
            : "No date"}
        </Text>
      </View>
    </Card>
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case "verified":
        return styles.statusVerified;
      case "rejected":
        return styles.statusRejected;
      default:
        return styles.statusPending;
    }
  };

  // Add this test function
  const testNetworkConnection = async () => {
    try {
      console.log("🧪 Testing network connection...");
      const response = await fetch("http://YOUR_IP:5001", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const text = await response.text();
      console.log("✅ Network test successful:", text);
      Alert.alert("Network Test", "Backend is reachable!");
    } catch (error) {
      console.error("❌ Network test failed:", error);
      Alert.alert("Network Failed", `Cannot reach backend: ${error.message}`);
    }
  };

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={reports}
      keyExtractor={(item) => item._id || Math.random().toString()}
      renderItem={renderReport}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No reports found</Text>
          <Text style={styles.emptySubtext}>
            Submit your first billboard report!
          </Text>
        </View>
      }
    />
  );
}

// Add these styles
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F8FAFC",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  errorText: {
    fontSize: 16,
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#0A84FF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  reportCard: {
    marginBottom: 12,
    padding: 16,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reportId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  status: {
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
  },
  statusVerified: {
    backgroundColor: "#D1FAE5",
    color: "#065F46",
  },
  statusRejected: {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
  },
  location: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
    fontStyle: "italic",
  },
  reportFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#9CA3AF",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#D1D5DB",
  },
});
