import { Pressable, StyleSheet, Text, View } from "react-native";
import { CATEGORIES, categoryIcon, categoryLabel, type Category } from "@/lib/types";
import { colors } from "@/lib/theme";

export function CategoryTiles({
  value,
  onChange,
}: {
  value: Category | null;
  onChange: (category: Category) => void;
}) {
  return (
    <View style={styles.wrap}>
      {CATEGORIES.map((item) => {
        const selected = value === item;
        return (
          <Pressable
            key={item}
            onPress={() => onChange(item)}
            style={[styles.tile, selected && styles.tileOn]}
          >
            <Text style={styles.emoji}>{categoryIcon(item)}</Text>
            <Text style={[styles.label, selected && styles.labelOn]}>{categoryLabel(item)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tile: {
    backgroundColor: "#E8E4D8",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minWidth: 108,
  },
  tileOn: { backgroundColor: colors.forest },
  emoji: { fontSize: 18 },
  label: { color: colors.charcoal, fontWeight: "700", marginTop: 4 },
  labelOn: { color: colors.white },
});
