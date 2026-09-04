import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { IssueCard } from "@/components/IssueCard";
import { completedIssues, reporterLabel, useCivicStore } from "@/lib/store";
import { colors } from "@/lib/theme";
import { statusLayer } from "@/lib/types";

export default function HomeScreen() {
  const issues = useCivicStore((s) => s.issues);
  const user = useCivicStore((s) => s.user);
  const completed = completedIssues(issues);
  const inProgress = issues.filter((issue) => statusLayer(issue.status) === "progress").length;
  const greeting = user?.name?.split(" ")[0] ?? "there";

  return (
    <ScrollView contentContainerStyle={styles.page} style={styles.bg}>
      <View style={styles.hero}>
        <Text style={styles.hello}>Good day {greeting} 👋</Text>
        <Text style={styles.headline}>Make your community better.</Text>
        <Text style={styles.heroCopy}>
          Report problems, track progress and explore what is happening around you.
        </Text>
        <Pressable style={styles.goldBtn} onPress={() => router.push("/report")}>
          <Text style={styles.goldBtnText}>Report an Issue</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/map")}>
          <Text style={styles.link}>Explore Civic Map</Text>
        </Pressable>
      </View>

      <View style={styles.stats}>
        <Stat label="Reports" value={String(issues.length)} />
        <Stat label="In Progress" value={String(inProgress)} />
        <Stat label="Resolved" value={String(completed.length)} />
      </View>

      <View style={styles.row}>
        <Pressable style={styles.shortcut} onPress={() => router.push("/map")}>
          <Text>🚗</Text>
          <Text style={styles.shortcutTitle}>Road Assist</Text>
          <Text style={styles.meta}>Safer Accra routes — full tool on the web app</Text>
        </Pressable>
        <Pressable style={styles.shortcut} onPress={() => router.push("/completed")}>
          <Text>🏆</Text>
          <Text style={styles.shortcutTitle}>Completed Work</Text>
          <Text style={styles.meta}>What was actually fixed</Text>
        </Pressable>
      </View>

      <Text style={styles.section}>Recently Completed</Text>
      {completed.length === 0 ? (
        <Text style={styles.meta}>No completed work in this dataset yet.</Text>
      ) : (
        completed.slice(0, 3).map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            subtitle={`Reported by ${reporterLabel(issue, user)}`}
            onPress={() => router.push(`/issue/${issue.id}`)}
          />
        ))
      )}
      <Pressable onPress={() => router.push("/completed")}>
        <Text style={styles.more}>See all completed work</Text>
      </Pressable>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.meta}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.cream },
  page: { padding: 16, gap: 12, paddingBottom: 40 },
  hero: {
    backgroundColor: colors.forest,
    borderRadius: 28,
    padding: 20,
    gap: 10,
  },
  hello: { color: colors.gold, fontWeight: "600" },
  headline: { color: colors.white, fontSize: 26, fontWeight: "800" },
  heroCopy: { color: "rgba(247,244,236,0.8)", fontSize: 15 },
  goldBtn: {
    backgroundColor: colors.gold,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  goldBtnText: { color: "#3A2D0A", fontWeight: "800" },
  link: { color: colors.white, fontWeight: "600" },
  stats: { flexDirection: "row", gap: 8 },
  stat: { flex: 1, backgroundColor: colors.card, borderRadius: 20, padding: 12 },
  statValue: { fontSize: 22, fontWeight: "800", color: colors.charcoal },
  row: { flexDirection: "row", gap: 8 },
  shortcut: { flex: 1, backgroundColor: colors.card, borderRadius: 22, padding: 16, gap: 4 },
  shortcutTitle: { fontWeight: "800", color: colors.charcoal },
  section: { fontSize: 20, fontWeight: "800", color: colors.charcoal, marginTop: 8 },
  meta: { color: colors.muted, fontSize: 13 },
  more: { color: colors.forest, fontWeight: "700", marginTop: 4 },
});
