import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SearchScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Buscar Estudios</Text>
        <Text style={styles.subtitle}>Encuentra el estudio perfecto para ti</Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.inputContainer}>
          <Ionicons name="location-outline" size={20} color="#718096" style={styles.inputIcon} />
          <TextInput 
            style={styles.input} 
            placeholder="¿En qué ciudad buscas?" 
            placeholderTextColor="#718096"
          />
        </View>

        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => alert("Buscando...")}
        >
          <Ionicons name="search" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Buscar</Text>
        </TouchableOpacity>

        <View style={styles.popularSearches}>
          <Text style={styles.sectionTitle}>Búsquedas populares</Text>
          <View style={styles.tagsContainer}>
            <TouchableOpacity style={styles.tag}>
              <Text style={styles.tagText}>Madrid</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tag}>
              <Text style={styles.tagText}>Barcelona</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tag}>
              <Text style={styles.tagText}>Valencia</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5FF',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#6B46C1',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E9D8FD',
    marginBottom: 20,
  },
  searchSection: {
    padding: 20,
    marginTop: -30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#6B46C1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
  },
  searchButton: {
    flexDirection: 'row',
    backgroundColor: '#6B46C1',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  popularSearches: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagText: {
    color: '#6B46C1',
    fontSize: 14,
    fontWeight: '500',
  },
});
