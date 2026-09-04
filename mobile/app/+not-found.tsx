import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View style={styles.page}>
        <Text style={styles.title}>This screen does not exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: colors.cream },
  title: { fontSize: 20, fontWeight: "800", color: colors.charcoal },
  link: { marginTop: 16 },
  linkText: { color: colors.forest, fontWeight: "700" },
});
