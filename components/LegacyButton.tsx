import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import theme from "../theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
}

/**
 * @deprecated Este componente es una versión antigua del botón.
 * Por favor, utiliza el componente Button.tsx que implementa el sistema de temas centralizado.
 */
export default function LegacyButton({ title, onPress }: ButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  text: {
    color: theme.colors.white,
    fontSize: 16,
  },
});
