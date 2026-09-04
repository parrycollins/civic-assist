import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { IssueCard } from "@/components/IssueCard";
import { useCivicStore } from "@/lib/store";
import { colors } from "@/lib/theme";

export default function ProfileScreen() {
  const user = useCivicStore((s) => s.user);
  const issues = useCivicStore((s) => s.issues);
  const dark = useCivicStore((s) => s.dark);
  const login = useCivicStore((s) => s.login);
  const logout = useCivicStore((s) => s.logout);
  const setRecognition = useCivicStore((s) => s.setRecognition);
  const toggleDark = useCivicStore((s) => s.toggleDark);
  const myReports = issues.filter((issue) => issue.createdByMe);
  const [email, setEmail] = useState("ama@civicgh.gh");
  const [password, setPassword] = useState("civic2026");
  const [error, setError] = useState<string | null>(null);

  return (
    <ScrollView contentContainerStyle={styles.page} style={styles.bg}>
      {user ? (
        <>
          <Text style={styles.h1}>{user.name}</Text>
          <Text style={styles.copy}>{user.email}</Text>
          <Text style={styles.copy}>{user.role === "agency" ? "Agency account" : "Citizen"}</Text>
          <Row
            label="Show my name on reports I file"
            value={user.recognition === "named"}
            onValueChange={setRecognition}
          />
          <Row label="Dark mode" value={dark} onValueChange={() => toggleDark()} />
          <Pressable style={styles.outline} onPress={logout}>
            <Text style={styles.outlineText}>Sign out</Text>
          </Pressable>
          <Text style={styles.h2}>My reports</Text>
          {myReports.length === 0 ? (
            <Text style={styles.copy}>You have not filed a report on this device yet.</Text>
          ) : (
            myReports.map((issue) => (
              <IssueCard key={issue.id} issue={issue} onPress={() => router.push(`/issue/${issue.id}`)} />
            ))
          )}
        </>
      ) : (
        <>
          <Text style={styles.h1}>Sign in</Text>
          <Text style={styles.copy}>Demo citizen: ama@civicgh.gh / civic2026</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Password"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable
            style={styles.submit}
            onPress={() => setError(login(email, password))}
          >
            <Text style={styles.submitText}>Continue</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setEmail("ama@civicgh.gh");
              setPassword("civic2026");
              setError(login("ama@civicgh.gh", "civic2026"));
            }}
          >
            <Text style={styles.more}>Use demo citizen</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

function Row({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: colors.forest }} />
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.cream },
  page: { padding: 20, gap: 10, paddingBottom: 40 },
  h1: { fontSize: 24, fontWeight: "800", color: colors.charcoal },
  h2: { fontSize: 18, fontWeight: "800", color: colors.charcoal, marginTop: 8 },
  copy: { color: colors.muted, fontSize: 15 },
  input: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    fontSize: 16,
    color: colors.charcoal,
  },
  error: { color: "#B91C1C" },
  submit: {
    backgroundColor: colors.forest,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitText: { color: colors.white, fontWeight: "800" },
  more: { color: colors.forest, fontWeight: "700" },
  outline: {
    borderWidth: 1,
    borderColor: colors.forest,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  outlineText: { color: colors.forest, fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  rowLabel: { flex: 1, color: colors.charcoal, fontSize: 15 },
});
