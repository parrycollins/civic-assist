import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useCivicStore } from "@/lib/store";
import { colors } from "@/lib/theme";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

const Light = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.forest,
    background: colors.cream,
    card: colors.forest,
    text: colors.white,
    border: colors.forest,
  },
};

const Dark = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.gold,
    background: colors.darkBg,
    card: colors.darkCard,
    text: colors.darkText,
  },
};

export default function RootLayout() {
  const dark = useCivicStore((s) => s.dark);
  return (
    <ThemeProvider value={dark ? Dark : Light}>
      <StatusBar style={dark ? "light" : "light"} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="issue/[id]"
          options={{
            title: "Issue",
            headerStyle: { backgroundColor: colors.forest },
            headerTintColor: colors.white,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
