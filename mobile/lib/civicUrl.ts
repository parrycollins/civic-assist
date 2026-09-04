import Constants from "expo-constants";
import { Platform } from "react-native";

const PORT = 43217;

export function civicGhUrl(): string {
  if (Platform.OS === "web") {
    return `http://127.0.0.1:${PORT}`;
  }
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.linkingUri ?? "";
  const host = hostUri.replace(/^https?:\/\//, "").split(":")[0];
  if (host && host !== "localhost" && host !== "127.0.0.1") {
    return `http://${host}:${PORT}`;
  }
  return `http://127.0.0.1:${PORT}`;
}
