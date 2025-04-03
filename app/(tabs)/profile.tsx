import { useState, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../../hooks/useAlert';
import theme from '../../theme';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';

// Definir la interfaz para el rol de usuario
interface UserRole {
  id: number;
  nombre: string;
  descripcion: string;
  creadoEn?: string;
  deletedAt?: string | null;
}

// Definir la interfaz para el tipo de usuario
interface UserData {
  id?: number;
  name?: string;
  email?: string;
  role?: UserRole | string;
  profileImage?: string;
  [key: string]: any; // Para permitir otras propiedades que puedan venir de la API
}

export default function ProfileScreen() {
  const router = useRouter();
  const { showSuccess, showError } = useAlert();
  const { user: authUser, signOut, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{
    id: number | null;
    name: string;
    email: string;
    role: UserRole | string;
    profileImage: string;
  }>({
    id: null,
    name: "Cargando...",
    email: "Cargando...",
    role: "Cargando...",
    profileImage: "https://via.placeholder.com/100",
  });

  // Modified fetchUserData to prevent infinite loop
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Primero intentamos usar los datos del contexto de autenticación
      if (authUser) {
        // Determinar el rol del usuario (objeto o cadena)
        let userRole: UserRole | string = "Sin rol";
        if (authUser.role) {
          if (typeof authUser.role === 'object') {
            userRole = authUser.role;
          } else if (authUser.role) {
            userRole = String(authUser.role);
          }
        }
        
        setUser({
          id: authUser.id,
          name: authUser.name || "Usuario",
          email: authUser.email || "Correo no disponible",
          role: userRole,
          profileImage: authUser.profileImage || "https://via.placeholder.com/100",
        });
      } else {
        // Si no hay usuario en el contexto, refrescamos los datos
        await refreshUserData();
        
        // We need to check if authUser is available after the refresh
        // Since we can't access the updated authUser directly here,
        // we'll handle this in the useEffect that depends on authUser
      }
    } catch (error: any) {
      console.error("❌ Error al obtener datos del usuario:", error);
      // No mostramos alerta aquí porque el servicio API ya maneja los errores
    } finally {
      setLoading(false);
    }
  }, [authUser, refreshUserData]);

  // This effect will run whenever authUser changes (including after refreshUserData)
  useEffect(() => {
    if (authUser) {
      // Determinar el rol del usuario (objeto o cadena)
      let userRole: UserRole | string = "Sin rol";
      if (authUser.role) {
        if (typeof authUser.role === 'object') {
          userRole = authUser.role;
        } else if (authUser.role) {
          userRole = String(authUser.role);
        }
      }
      
      setUser({
        id: authUser.id,
        name: authUser.name || "Usuario",
        email: authUser.email || "Correo no disponible",
        role: userRole,
        profileImage: authUser.profileImage || "https://via.placeholder.com/100",
      });
    } else {
      // If no user is available and we're not in the loading state,
      // redirect to login
      if (!loading) {
        console.error("🚨 No hay usuario autenticado");
        Alert.alert("Error", "No has iniciado sesión. Redirigiendo...");
        router.push("/login");
      }
    }
  }, [authUser, loading, router]);

  // Initial data fetch
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);
  
  // Use useFocusEffect for subsequent focus events
  useFocusEffect(
    useCallback(() => {
      // Only fetch if not the initial render
      const unsubscribe = () => {
        // This is the cleanup function
      };
      return unsubscribe;
    }, [])
  );

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut();
      showSuccess('Has cerrado sesión exitosamente', 'Hasta pronto');
    } catch (error) {
      showError('No se pudo cerrar sesión', 'Error');
      console.error('❌ Error al cerrar sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    router.push(`/(profile)/edit/${user.id}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar 
          source={{ uri: user.profileImage }} 
          size="xl"
          name={user.name}
          showBadge={true}
          badgeIcon="camera"
          badgeColor={theme.colors.primary}
          badgeSize={32}
          onPress={() => alert("Editar Foto")}
          bordered
          borderColor={theme.colors.white}
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Badge 
          text={typeof user.role === 'object' ? user.role.nombre : String(user.role)} 
          variant="primary"
          size="md"
          pill
        />
      </View>

      <View style={styles.content}>
        {/* Panel de Administración - Solo visible para admins */}
        {(user.role === 'admin' || (typeof user.role === 'object' && user.role.nombre?.toLowerCase() === 'admin')) && (
          <Card 
            title="Panel de Administración"
            icon="people-circle"
            iconColor={theme.colors.primary}
            elevation="md"
            style={styles.section}
          >
            <View>
              <View style={styles.menuItem}>
                <Ionicons name="people" size={24} color={theme.colors.primary} />
                <Text style={styles.menuText}>Gestionar Usuarios</Text>
                <Badge 
                  text="Asignar Roles" 
                  variant="secondary"
                  size="sm"
                />
                <Button 
                  title="" 
                  variant="ghost" 
                  size="sm" 
                  rightIcon="chevron-forward"
                  onPress={() => router.push("/(admin)/Users" as any)}
                />
              </View>
              
              <View style={styles.menuItem}>
                <Ionicons name="cut" size={24} color={theme.colors.primary} />
                <Text style={styles.menuText}>Gestionar Servicios</Text>
                <Badge 
                  text="Nuevo" 
                  variant="success"
                  size="sm"
                />
                <Button 
                  title="" 
                  variant="ghost" 
                  size="sm" 
                  rightIcon="chevron-forward"
                  onPress={() => router.push("/(admin)/Services" as any)}
                />
              </View>
              
              <View style={styles.menuItem}>
                <Ionicons name="basket" size={24} color={theme.colors.primary} />
                <Text style={styles.menuText}>Gestionar Productos</Text>
                <Badge 
                  text="Nuevo" 
                  variant="success"
                  size="sm"
                />
                <Button 
                  title="" 
                  variant="ghost" 
                  size="sm" 
                  rightIcon="chevron-forward"
                  onPress={() => router.push("/(admin)/Products" as any)}
                />
              </View>
              
              <View style={styles.menuItem}>
                <Ionicons name="stats-chart" size={24} color={theme.colors.primary} />
                <Text style={styles.menuText}>Estadísticas</Text>
                <Button 
                  title="" 
                  variant="ghost" 
                  size="sm" 
                  rightIcon="chevron-forward"
                  onPress={() => router.push("/(admin)/Stats" as any)}
                />
              </View>
            </View>
          </Card>
        )}

        {/* Ajustes de cuenta existentes */}
        <Card 
          title="Ajustes de Cuenta"
          icon="settings-outline"
          iconColor={theme.colors.primary}
          elevation="sm"
          style={styles.section}
        >
          <View>
            <View style={styles.menuItem}>
              <Ionicons name="person-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.menuText}>Editar Perfil</Text>
              <Button 
                title="Editar" 
                variant="ghost" 
                size="sm" 
                rightIcon="chevron-forward"
                onPress={handleEditProfile}
              />
            </View>

            <View style={styles.menuItem}>
              <Ionicons name="notifications-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.menuText}>Notificaciones</Text>
              <Button 
                title="Ver" 
                variant="ghost" 
                size="sm" 
                rightIcon="chevron-forward"
                onPress={() => alert("Notificaciones")}
              />
            </View>

            <View style={styles.menuItem}>
              <Ionicons name="shield-checkmark-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.menuText}>Privacidad</Text>
              <Button 
                title="Ver" 
                variant="ghost" 
                size="sm" 
                rightIcon="chevron-forward"
                onPress={() => alert("Privacidad")}
              />
            </View>
          </View>
        </Card>

        <Button 
          title="Cerrar Sesión" 
          variant="outline" 
          size="lg" 
          leftIcon="log-out-outline"
          style={styles.logoutButton}
          textStyle={{ color: theme.colors.error }}
          onPress={handleLogout}
          loading={loading}
          fullWidth
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background
  },
  header: { 
    backgroundColor: theme.colors.primary, 
    padding: theme.spacing.lg,
    paddingTop: 60, 
    alignItems: "center", 
    borderBottomLeftRadius: 40, 
    borderBottomRightRadius: 40,
    ...theme.shadows.lg,
    marginBottom: theme.spacing.md,
  },
  name: { 
    fontSize: theme.typography.fontSizes.xxl, 
    fontWeight: "700", 
    color: theme.colors.white, 
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
    letterSpacing: 0.5,
  },
  email: { 
    fontSize: theme.typography.fontSizes.md, 
    color: theme.colors.primaryLight, 
    marginBottom: theme.spacing.md,
    letterSpacing: 0.3,
  },
  content: { 
    padding: theme.spacing.lg,
  },
  section: { 
    marginBottom: theme.spacing.xl,
  },
  menuItem: { 
    ...theme.commonStyles.rowBetween, 
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.border,
  },
  menuText: { 
    flex: 1, 
    marginLeft: theme.spacing.md, 
    fontSize: theme.typography.fontSizes.md, 
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  logoutButton: { 
    marginBottom: theme.spacing.xl,
    borderColor: theme.colors.error,
  }
});
