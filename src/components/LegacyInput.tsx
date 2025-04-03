import React from "react";
import { TextInput, StyleSheet } from "react-native";
import theme from "../theme";

interface InputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
}

/**
 * @deprecated Este componente es una versión antigua del input.
 * Por favor, utiliza el componente Input.tsx que implementa el sistema de temas centralizado.
 */
export default function LegacyInput({ placeholder, value, onChangeText, secureTextEntry }: InputProps) {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "90%",
    height: 40,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    marginVertical: 10,
    padding: 5,
  },
});
