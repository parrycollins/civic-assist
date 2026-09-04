import { useEffect, useMemo } from "react";
import { createElement } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { mapHtml } from "@/lib/mapHtml";
import type { Issue } from "@/lib/types";

export function CivicMap({ issues, onOpen }: { issues: Issue[]; onOpen: (id: string) => void }) {
  const html = useMemo(() => mapHtml(issues), [issues]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const onMessage = (message: MessageEvent) => {
      try {
        const data = JSON.parse(String(message.data));
        if (data?.id) onOpen(data.id);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onOpen]);

  if (Platform.OS === "web") {
    return (
      <View style={styles.fill}>
        {createElement("iframe", {
          title: "Civic map",
          srcDoc: html,
          style: styles.iframe,
        })}
      </View>
    );
  }

  return (
    <WebView
      originWhitelist={["*"]}
      source={{ html }}
      style={styles.fill}
      onMessage={(event) => {
        try {
          const data = JSON.parse(event.nativeEvent.data);
          if (data?.id) onOpen(data.id);
        } catch {
          /* ignore */
        }
      }}
    />
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, minHeight: 280 },
  iframe: { borderWidth: 0, width: "100%", height: "100%", flex: 1, minHeight: 360 },
});
