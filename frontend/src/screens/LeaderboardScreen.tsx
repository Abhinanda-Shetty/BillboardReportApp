import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import Card from "../components/Card";

const RANKS = [
  { name: "Aqeel Ahmed", points: 420, badges: 5 },
  { name: "Abhinanda N Shetty", points: 360, badges: 4 },
  { name: "Adithya B", points: 280, badges: 3 },
];

export default function LeaderboardScreen() {
  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={RANKS}
      keyExtractor={(item) => item.name}
      renderItem={({ item, index }) => (
        <Card style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rank}>#{index + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.badges} badges</Text>
            </View>
            <Text style={styles.points}>{item.points} pts</Text>
          </View>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, backgroundColor: "#F8FAFC" },
  card: {},
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  rank: {
    fontWeight: "900",
    fontSize: 18,
    color: "#0F172A",
    width: 40,
    textAlign: "center",
  },
  name: { fontWeight: "800", color: "#0F172A" },
  meta: { color: "#64748B", fontSize: 12 },
  points: { fontWeight: "900", color: "#2563EB" },
});
