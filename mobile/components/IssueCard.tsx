import { Pressable, StyleSheet, Text, View } from "react-native";
import { categoryIcon, statusLabel, type Issue } from "@/lib/types";
import { colors } from "@/lib/theme";

export function IssueCard({
  issue,
  subtitle,
  onPress,
}: {
  issue: Issue;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Text style={styles.title}>
        {categoryIcon(issue.category)}  {issue.title}
      </Text>
      <Text style={styles.meta}>
        {issue.location.area} · {issue.agencyName}
      </Text>
      <Text style={styles.status}>{statusLabel(issue.status)}</Text>
      {subtitle ? <Text style={styles.meta}>{subtitle}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  title: { fontSize: 16, fontWeight: "700", color: colors.charcoal },
  meta: { fontSize: 13, color: colors.muted },
  status: { fontSize: 13, color: colors.forest, fontWeight: "600" },
});
