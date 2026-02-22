import { View, Text, Pressable } from "react-native";

type Option<T extends string> = { key: T; label: string };

export function SegmentedControl<T extends string>({
  options,
  selected,
  onChange,
}: {
  options: Option<T>[];
  selected: T;
  onChange: (key: T) => void;
}) {
  return (
    <View
      className="mx-4 flex-row bg-bg-surface rounded-full"
      style={{ padding: 3, height: 36 }}
    >
      {options.map((opt) => {
        const active = opt.key === selected;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            className="flex-1 items-center justify-center rounded-full"
            style={active ? { backgroundColor: "#2A2A2A" } : undefined}
          >
            <Text
              className={`text-xs font-medium ${
                active ? "text-text-primary" : "text-text-muted"
              }`}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
