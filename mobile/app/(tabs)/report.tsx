import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { CategoryTiles } from "@/components/CategoryTiles";
import { useCivicStore } from "@/lib/store";
import { colors } from "@/lib/theme";
import type { Category } from "@/lib/types";

export default function ReportScreen() {
  const report = useCivicStore((s) => s.report);
  const [category, setCategory] = useState<Category | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <ScrollView contentContainerStyle={styles.page} style={styles.bg}>
      <Text style={styles.h1}>Report a civic issue</Text>
      <Text style={styles.copy}>
        Choose a category first, then describe what the agency should know. Location is approximated for privacy.
      </Text>
      <Text style={styles.h2}>What is the problem?</Text>
      <CategoryTiles value={category} onChange={setCategory} />
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Short title"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="What should the agency know?"
        placeholderTextColor={colors.muted}
        style={[styles.input, styles.area]}
        multiline
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        style={styles.submit}
        onPress={() => {
          if (!category) {
            setError("Choose a category first.");
            return;
          }
          if (title.trim().length < 4 || description.trim().length < 10) {
            setError("Add a title and a description of at least 10 characters.");
            return;
          }
          const issue = report(title.trim(), category, description.trim());
          router.push(`/issue/${issue.id}`);
        }}
      >
        <Text style={styles.submitText}>Submit report</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.cream },
  page: { padding: 20, gap: 12, paddingBottom: 48 },
  h1: { fontSize: 24, fontWeight: "800", color: colors.charcoal },
  h2: { fontSize: 16, fontWeight: "700", color: colors.charcoal },
  copy: { color: colors.muted, fontSize: 15 },
  input: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    fontSize: 16,
    color: colors.charcoal,
  },
  area: { minHeight: 120, textAlignVertical: "top" },
  error: { color: "#B91C1C" },
  submit: {
    backgroundColor: colors.forest,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitText: { color: colors.white, fontWeight: "800" },
});
