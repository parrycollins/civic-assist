import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CivicMap } from "@/components/CivicMap";
import { completedIssues, useCivicStore } from "@/lib/store";
import { colors } from "@/lib/theme";

export default function MapScreen() {
  const issues = useCivicStore((s) => s.issues);
  const completedLayer = useCivicStore((s) => s.completedLayer);
  const setCompletedLayer = useCivicStore((s) => s.setCompletedLayer);
  const completed = completedIssues(issues);
  const visible = completedLayer ? completed : issues;

  return (
    <View style={styles.fill}>
      <CivicMap issues={visible} onOpen={(id) => router.push(`/issue/${id}`)} />
      <View style={styles.chips}>
        <Pressable
          onPress={() => setCompletedLayer(false)}
          style={[styles.chip, !completedLayer && styles.chipOn]}
        >
          <Text style={[styles.chipText, !completedLayer && styles.chipTextOn]}>All issues</Text>
        </Pressable>
        <Pressable
          onPress={() => setCompletedLayer(true)}
          style={[styles.chip, completedLayer && styles.chipOn]}
        >
          <Text style={[styles.chipText, completedLayer && styles.chipTextOn]}>
            Completed ({completed.length})
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.cream },
  chips: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipOn: { backgroundColor: colors.forest },
  chipText: { color: colors.charcoal, fontWeight: "700" },
  chipTextOn: { color: colors.white },
});
