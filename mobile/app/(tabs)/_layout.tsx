import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colors } from "@/lib/theme";

function Icon({ glyph }: { glyph: string }) {
  return <Text style={{ fontSize: 18 }}>{glyph}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.forest,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card },
        headerStyle: { backgroundColor: colors.forest },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: "800" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarIcon: () => <Icon glyph="🏠" /> }}
      />
      <Tabs.Screen
        name="map"
        options={{ title: "Map", headerShown: false, tabBarIcon: () => <Icon glyph="🗺️" /> }}
      />
      <Tabs.Screen
        name="report"
        options={{ title: "Report", tabBarIcon: () => <Icon glyph="➕" /> }}
      />
      <Tabs.Screen
        name="completed"
        options={{ title: "Done", tabBarIcon: () => <Icon glyph="🏆" /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", tabBarIcon: () => <Icon glyph="👤" /> }}
      />
    </Tabs>
  );
}
