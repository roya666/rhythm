import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { AppIcon } from "@/components/AppIcon";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-bg-primary items-center justify-center px-8">
      <View className="mb-6">
        <AppIcon size={80} />
      </View>
      <Text className="text-text-primary text-3xl font-bold text-center mb-4">
        Plan around the rhythms your body follows
      </Text>
      <Text className="text-text-muted text-base text-center mb-12">
        Rhythm layers natural cycles onto your calendar so you can work with
        your energy, not against it.
      </Text>

      <Pressable
        onPress={() => router.push("/onboarding/cycle")}
        className="bg-accent-blood px-10 py-4 rounded-xl active:opacity-80"
      >
        <Text className="text-text-primary text-base font-semibold">
          Get Started
        </Text>
      </Pressable>
    </View>
  );
}
