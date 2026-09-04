import { router } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";
import { IssueCard } from "@/components/IssueCard";
import { completedIssues, reporterLabel, useCivicStore } from "@/lib/store";
import { colors } from "@/lib/theme";

export default function CompletedScreen() {
  const issues = useCivicStore((s) => s.issues);
  const user = useCivicStore((s) => s.user);
  const completed = completedIssues(issues);

  return (
    <ScrollView contentContainerStyle={styles.page} style={styles.bg}>
      <Text style={styles.h1}>Completed work</Text>
      <Text style={styles.copy}>
        Public archive of finished civic work. Years without records stay at 0 — we do not invent history.
      </Text>
      <Text style={styles.count}>
        {completed.length === 0
          ? "No completed work in this dataset yet."
          : `${completed.length} completed ${completed.length === 1 ? "record" : "records"}`}
      </Text>
      {completed.map((issue) => (
        <IssueCard
          key={issue.id}
          issue={issue}
          subtitle={`Reported by ${reporterLabel(issue, user)}`}
          onPress={() => router.push(`/issue/${issue.id}`)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.cream },
  page: { padding: 16, gap: 10, paddingBottom: 40 },
  h1: { fontSize: 24, fontWeight: "800", color: colors.charcoal },
  copy: { color: colors.muted, fontSize: 15 },
  count: { fontSize: 16, fontWeight: "700", color: colors.charcoal },
});
