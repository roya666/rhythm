import { Tabs } from "expo-router";
import { View } from "react-native";
import { colors, phaseColors } from "@/lib/theme";
import { useRhythmStore } from "@/lib/store";

export default function TabLayout() {
  const currentPhase = useRhythmStore((s) => s.currentPhase);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0A0A0A",
          borderTopColor: "#1A1A1A",
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: phaseColors[currentPhase],
        tabBarInactiveTintColor: colors.text.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color, size }) => (
            <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="wheel"
        options={{
          title: "Rhythm",
          tabBarIcon: ({ color, size }) => (
            <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
              <View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: color }} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
