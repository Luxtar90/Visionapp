import { View, Text, Button, StyleSheet } from "react-native";

export default function PaymentScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Proceso de Pago</Text>
      <Button title="Pagar Ahora" onPress={() => alert("Pago realizado!")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
});
