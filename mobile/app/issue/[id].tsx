import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { reporterLabel, useCivicStore } from "@/lib/store";
import { colors } from "@/lib/theme";
import { ISSUE_STATUSES, categoryIcon, statusLabel } from "@/lib/types";

export default function IssueScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const issues = useCivicStore((s) => s.issues);
  const user = useCivicStore((s) => s.user);
  const verify = useCivicStore((s) => s.verify);
  const dispute = useCivicStore((s) => s.dispute);
  const issue = issues.find((item) => item.id === id);

  if (!issue) {
    return (
      <View style={styles.page}>
        <Text style={styles.h1}>This report is no longer available.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.page} style={styles.bg}>
      <Text style={styles.h1}>
        {categoryIcon(issue.category)}  {issue.title}
      </Text>
      <Text style={styles.copy}>
        {issue.location.publicLabel} · {issue.agencyName}
      </Text>
      <Text style={styles.status}>{statusLabel(issue.status)}</Text>
      <Text style={styles.copy}>Reported by {reporterLabel(issue, user)}</Text>
      <Text style={styles.body}>{issue.description}</Text>
      <Text style={styles.h2}>Status journey</Text>
      {ISSUE_STATUSES.map((step) => {
        if (step === "disputed" && issue.status !== "disputed") return null;
        const reached = issue.status === step || ISSUE_STATUSES.indexOf(issue.status) >= ISSUE_STATUSES.indexOf(step);
        return (
          <Text key={step} style={{ color: reached ? colors.forest : colors.muted }}>
            {reached ? "●" : "○"}  {statusLabel(step)}
          </Text>
        );
      })}
      <Text style={styles.h2}>Timeline</Text>
      {issue.timeline.map((event) => (
        <Text key={event.id} style={styles.copy}>
          {event.timestamp.slice(0, 10)} · {event.label} · {event.actor}
        </Text>
      ))}
      {issue.evidence.length > 0 ? (
        <>
          <Text style={styles.h2}>Evidence on record</Text>
          {issue.evidence.map((item) => (
            <Text key={item.id} style={styles.copy}>
              {item.stage[0].toUpperCase() + item.stage.slice(1)} · {item.uploadedBy}
            </Text>
          ))}
        </>
      ) : null}
      {issue.status === "resolved" && user?.role === "citizen" ? (
        <>
          <Text style={styles.h2}>Awaiting citizen verification</Text>
          <View style={styles.row}>
            <Pressable style={styles.submit} onPress={() => verify(issue.id)}>
              <Text style={styles.submitText}>Confirm fixed</Text>
            </Pressable>
            <Pressable style={styles.outline} onPress={() => dispute(issue.id)}>
              <Text style={styles.outlineText}>Not fixed</Text>
            </Pressable>
          </View>
        </>
      ) : null}
      <Pressable onPress={() => router.back()}>
        <Text style={styles.more}>Back</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.cream },
  page: { padding: 20, gap: 8, paddingBottom: 40 },
  h1: { fontSize: 24, fontWeight: "800", color: colors.charcoal },
  h2: { fontSize: 16, fontWeight: "800", color: colors.charcoal, marginTop: 10 },
  copy: { color: colors.muted, fontSize: 14 },
  body: { color: colors.charcoal, fontSize: 16, lineHeight: 22 },
  status: { color: colors.forest, fontWeight: "700" },
  row: { flexDirection: "row", gap: 8 },
  submit: {
    flex: 1,
    backgroundColor: colors.forest,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitText: { color: colors.white, fontWeight: "800" },
  outline: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.forest,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  outlineText: { color: colors.forest, fontWeight: "700" },
  more: { color: colors.forest, fontWeight: "700", marginTop: 12 },
});
