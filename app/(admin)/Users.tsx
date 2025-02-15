import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../../src/constants/config";
import debounce from 'lodash/debounce';

interface User {
  id: number;
  name: string;
  email: string;
  telefono?: string;
  role?: {
    id: number;
    nombre: string;
  };
  createdAt: string;
}

interface RouteParams {
  id: string;
}

export default function AdminUsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "date">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No se encontró el token de autenticación");
        return;
      }

      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(response.data);
      applyFilters(response.data, searchQuery, selectedRole, sortBy, sortOrder);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      Alert.alert("Error", "No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback((
    data: User[],
    query: string,
    role: string,
    sort: "name" | "date",
    order: "asc" | "desc"
  ) => {
    let filtered = [...data];

    // Aplicar filtro de búsqueda
    if (query) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        (user.telefono && user.telefono.includes(query))
      );
    }

    // Aplicar filtro de rol
    if (role !== "all") {
      filtered = filtered.filter(user => 
        user.role?.nombre.toLowerCase() === role.toLowerCase()
      );
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      if (sort === "name") {
        return order === "asc" 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return order === "asc"
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredUsers(filtered);
  }, []);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      applyFilters(users, query, selectedRole, sortBy, sortOrder);
    }, 300),
    [users, selectedRole, sortBy, sortOrder]
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    applyFilters(users, searchQuery, selectedRole, sortBy, sortOrder);
  }, [selectedRole, sortBy, sortOrder]);

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => {
        const id = item.id.toString();
        router.push({
          pathname: "/editprofile/[id]",
          params: { id }
        });
      }}
    >
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.userName}>{item.name}</Text>
          <View style={[
            styles.roleBadge,
            { backgroundColor: item.role?.nombre === "admin" ? "#FED7D7" : "#C6F6D5" }
          ]}>
            <Text style={[
              styles.roleText,
              { color: item.role?.nombre === "admin" ? "#9B2C2C" : "#276749" }
            ]}>
              {item.role?.nombre || "Sin rol"}
            </Text>
          </View>
        </View>
        <Text style={styles.userEmail}>{item.email}</Text>
        {item.telefono && (
          <Text style={styles.userPhone}>
            <Ionicons name="call-outline" size={14} color="#718096" /> {item.telefono}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={24} color="#A0AEC0" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Usuarios</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/create-account")}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#718096" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#718096"
          />
          {searchQuery !== "" && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#718096" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Rol:</Text>
              {["all", "admin", "user"].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.filterButton,
                    selectedRole === role && styles.filterButtonActive
                  ]}
                  onPress={() => setSelectedRole(role)}
                >
                  <Text style={[
                    styles.filterButtonText,
                    selectedRole === role && styles.filterButtonTextActive
                  ]}>
                    {role === "all" ? "Todos" : role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Ordenar por:</Text>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  sortBy === "name" && styles.filterButtonActive
                ]}
                onPress={() => {
                  if (sortBy === "name") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("name");
                    setSortOrder("asc");
                  }
                }}
              >
                <Text style={[
                  styles.filterButtonText,
                  sortBy === "name" && styles.filterButtonTextActive
                ]}>
                  Nombre {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterButton,
                  sortBy === "date" && styles.filterButtonActive
                ]}
                onPress={() => {
                  if (sortBy === "date") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("date");
                    setSortOrder("desc");
                  }
                }}
              >
                <Text style={[
                  styles.filterButtonText,
                  sortBy === "date" && styles.filterButtonTextActive
                ]}>
                  Fecha {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6B46C1" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={48} color="#A0AEC0" />
              <Text style={styles.emptyText}>No se encontraron usuarios</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2D3748",
  },
  addButton: {
    backgroundColor: "#6B46C1",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: {
    flex: 1,
    height: 44,
    marginLeft: 8,
    fontSize: 16,
    color: "#2D3748",
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    marginTop: 12,
  },
  filterGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  filterLabel: {
    fontSize: 14,
    color: "#4A5568",
    marginRight: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#EDF2F7",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#6B46C1",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#4A5568",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  listContainer: {
    padding: 16,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginRight: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "500",
  },
  userEmail: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: "#718096",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#718096",
    marginTop: 8,
  },
});
