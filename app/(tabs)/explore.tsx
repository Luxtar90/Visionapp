import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ExploreScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explorar</Text>
        <Text style={styles.subtitle}>Descubre estudios destacados</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            <TouchableOpacity style={styles.categoryCard}>
              <View style={[styles.iconContainer, { backgroundColor: '#E9D8FD' }]}>
                <Ionicons name="camera" size={24} color="#6B46C1" />
              </View>
              <Text style={styles.categoryText}>Fotografía</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryCard}>
              <View style={[styles.iconContainer, { backgroundColor: '#FED7D7' }]}>
                <Ionicons name="videocam" size={24} color="#C53030" />
              </View>
              <Text style={styles.categoryText}>Video</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryCard}>
              <View style={[styles.iconContainer, { backgroundColor: '#C6F6D5' }]}>
                <Ionicons name="mic" size={24} color="#2F855A" />
              </View>
              <Text style={styles.categoryText}>Audio</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Estudios Destacados</Text>
          <View style={styles.studioCard}>
            <View style={styles.studioHeader}>
              <Ionicons name="star" size={20} color="#F6E05E" />
              <Text style={styles.rating}>4.9</Text>
            </View>
            <Text style={styles.studioName}>Estudio Creativo</Text>
            <Text style={styles.studioLocation}>
              <Ionicons name="location-outline" size={16} color="#718096" /> Madrid, España
            </Text>
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
  content: {
    padding: 20,
  },
  categorySection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  categoriesContainer: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 100,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '500',
  },
  featuredSection: {
    marginTop: 20,
  },
  studioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#6B46C1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  studioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A5568',
  },
  studioName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  studioLocation: {
    fontSize: 14,
    color: '#718096',
  },
});
