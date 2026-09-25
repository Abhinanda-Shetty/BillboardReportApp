import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../api";
import Card from "../components/Card";

export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching leaderboard...");

      const response = await api.get("/leaderboard");
      console.log("📊 Leaderboard response:", response.data);

      if (response.data && response.data.success) {
        setLeaderboard(response.data.leaderboard || []);
        console.log(
          `📈 Loaded ${response.data.leaderboard?.length || 0} users`
        );
      } else {
        console.log("⚠️ Invalid response format");
        setLeaderboard([]);
      }
    } catch (error) {
      console.error("❌ Leaderboard error:", error);
      Alert.alert("Error", "Failed to fetch leaderboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLeaderboard();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  const getRankStyle = (index) => {
    switch (index) {
      case 0:
        return {
          backgroundColor: "#FFF9C4",
          borderColor: "#FFD700",
          rankColor: "#B8860B",
          textColor: "#B8860B",
          icon: "👑",
        };
      case 1:
        return {
          backgroundColor: "#F5F5F5",
          borderColor: "#C0C0C0",
          rankColor: "#696969",
          textColor: "#696969",
          icon: "🥈",
        };
      case 2:
        return {
          backgroundColor: "#FFF3E0",
          borderColor: "#CD7F32",
          rankColor: "#8B4513",
          textColor: "#8B4513",
          icon: "🥉",
        };
      default:
        return {
          backgroundColor: "#FFFFFF",
          borderColor: "#E5E7EB",
          rankColor: "#6B7280",
          textColor: "#374151",
          icon: "📊",
        };
    }
  };

  const renderHeader = () => {
    if (leaderboard.length === 0) return null;

    const top3 = leaderboard.slice(0, 3);

    return (
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>🏆 Champions League</Text>
        <Text style={styles.headerSubtitle}>
          Top Billboard Report Contributors
        </Text>

        {/* Top 3 Podium */}
        <View style={styles.podiumContainer}>
          {top3.map((user, index) => {
            const style = getRankStyle(index);
            return (
              <TouchableOpacity
                key={user.userId}
                style={[
                  styles.podiumCard,
                  {
                    backgroundColor: style.backgroundColor,
                    borderColor: style.borderColor,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text style={styles.podiumIcon}>{style.icon}</Text>
                <Text style={[styles.podiumRank, { color: style.rankColor }]}>
                  #{index + 1}
                </Text>
                <Text style={styles.podiumName} numberOfLines={1}>
                  {user.name}
                </Text>
                <View style={styles.podiumScoreContainer}>
                  <Text
                    style={[styles.podiumScore, { color: style.textColor }]}
                  >
                    {user.verifiedCount}
                  </Text>
                  <Text
                    style={[styles.podiumLabel, { color: style.textColor }]}
                  >
                    verified
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderLeaderItem = ({ item, index }) => {
    const style = getRankStyle(index);
    const isTopThree = index < 3;

    return (
      <TouchableOpacity activeOpacity={0.7}>
        <Card
          style={[
            styles.leaderCard,
            {
              backgroundColor: style.backgroundColor,
              borderLeftColor: style.borderColor,
              borderLeftWidth: isTopThree ? 6 : 4,
            },
          ]}
        >
          <View style={styles.rankContainer}>
            <View
              style={[styles.rankBadge, { backgroundColor: style.borderColor }]}
            >
              <Text style={[styles.rankText, { color: style.rankColor }]}>
                {index + 1}
              </Text>
            </View>
            {isTopThree && <Text style={styles.rankIcon}>{style.icon}</Text>}
          </View>

          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: style.textColor }]}>
              {item.name}
            </Text>
            <Text style={styles.userEmail}>{item.email}</Text>

            {/* Progress indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(
                        (item.verifiedCount /
                          Math.max(leaderboard[0]?.verifiedCount || 1, 1)) *
                          100,
                        100
                      )}%`,
                      backgroundColor: style.borderColor,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreText, { color: style.textColor }]}>
              {item.verifiedCount}
            </Text>
            <Text style={styles.scoreLabel}>flags</Text>
            {item.verifiedCount > 0 && (
              <Text style={styles.verifiedBadge}>✅</Text>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingIcon}>🏆</Text>
        <Text style={styles.loadingText}>Loading Champions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.userId?.toString()}
        renderItem={renderLeaderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏆</Text>
            <Text style={styles.emptyText}>No champions yet!</Text>
            <Text style={styles.emptySubtext}>
              Submit verified reports to join the leaderboard
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    color: "#6B7280",
    fontWeight: "600",
  },
  listContainer: {
    padding: 16,
  },

  // Header Styles
  headerContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 20,
    textAlign: "center",
  },

  // Podium Styles
  podiumContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  podiumCard: {
    width: 100,
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  podiumIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  podiumRank: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  podiumScoreContainer: {
    alignItems: "center",
  },
  podiumScore: {
    fontSize: 20,
    fontWeight: "bold",
  },
  podiumLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },

  // List Item Styles
  leaderCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankContainer: {
    alignItems: "center",
    marginRight: 16,
    minWidth: 50,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  rankText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  rankIcon: {
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBackground: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  scoreContainer: {
    alignItems: "center",
    minWidth: 60,
  },
  scoreText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  scoreLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  verifiedBadge: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#9CA3AF",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#D1D5DB",
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
