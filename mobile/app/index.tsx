import { createElement, useMemo, useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { civicGhUrl } from "@/lib/civicUrl";
import { colors } from "@/lib/theme";

export default function CivicGHScreen() {
  const uri = useMemo(() => civicGhUrl(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  if (Platform.OS === "web") {
    return (
      <View style={styles.fill}>
        {createElement("iframe", {
          title: "CivicGH",
          src: uri,
          style: styles.frame,
        })}
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <WebView
        key={reloadKey}
        source={{ uri }}
        onLoadStart={() => {
          setLoading(true);
          setError(null);
        }}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(
            "Could not reach CivicGH. On your computer run npm run dev in the repo root, keep Expo Go on the same Wi‑Fi, then retry.",
          );
        }}
        onHttpError={(event) => {
          if (event.nativeEvent.statusCode >= 400) {
            setError(`CivicGH returned ${event.nativeEvent.statusCode}. Start it with npm run dev.`);
          }
        }}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        allowsBackForwardNavigationGestures
        style={styles.fill}
      />
      {loading && !error ? (
        <View style={styles.splash} pointerEvents="none">
          <Text style={styles.brand}>CivicGH</Text>
          <Text style={styles.tag}>Civic map & Road Assist</Text>
          <ActivityIndicator color={colors.gold} style={{ marginTop: 16 }} />
        </View>
      ) : null}
      {error ? (
        <View style={styles.splash}>
          <Text style={styles.brand}>CivicGH</Text>
          <Text style={styles.err}>{error}</Text>
          <Pressable
            style={styles.retry}
            onPress={() => {
              setError(null);
              setReloadKey((n) => n + 1);
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.forest },
  frame: { borderWidth: 0, width: "100%", height: "100%", flex: 1 },
  splash: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.forest,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  brand: { color: colors.white, fontSize: 28, fontWeight: "800" },
  tag: { color: colors.gold, marginTop: 8, fontWeight: "600" },
  err: { color: colors.white, textAlign: "center", marginTop: 16, lineHeight: 22 },
  retry: {
    marginTop: 20,
    backgroundColor: colors.gold,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryText: { color: "#3A2D0A", fontWeight: "800" },
});
