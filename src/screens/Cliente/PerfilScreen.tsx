// src/screens/Cliente/PerfilScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
  Modal,
  FlatList,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../theme/colors';
import { client } from '../../api/client';
import { UserProfile, Store, Permisos } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import ProfileHeaderWithActions from '../../components/Cliente/ProfileHeaderWithActions';
import ProfileViewMode from '../../components/Cliente/ProfileViewMode';
import ProfileEditMode from '../../components/Cliente/ProfileEditMode';
import PermissionsSection from '../../components/Cliente/PermissionsSection';
import StoreSelector from '../../components/Cliente/StoreSelector';

// Componentes personalizados

const TIENDAS_FALLBACK: Store[] = [
  { id: 1, nombre: 'Tienda Principal', direccion: 'Dirección 1', telefono: '123456789', email_contacto: 'tienda1@example.com' },
  { id: 2, nombre: 'Sucursal Norte', direccion: 'Dirección 2', telefono: '123456789', email_contacto: 'tienda2@example.com' },
  { id: 3, nombre: 'Sucursal Sur', direccion: 'Dirección 3', telefono: '123456789', email_contacto: 'tienda3@example.com' },
  { id: 4, nombre: 'Sucursal Este', direccion: 'Dirección 4', telefono: '123456789', email_contacto: 'tienda4@example.com' },
  { id: 5, nombre: 'Sucursal Oeste', direccion: 'Dirección 5', telefono: '123456789', email_contacto: 'tienda5@example.com' }
];

export default function PerfilScreen() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('datos');
  const [tiendas, setTiendas] = useState<Store[]>(TIENDAS_FALLBACK);
  const [tiendasUsuario, setTiendasUsuario] = useState<number[]>([]);
  const [loadingTiendas, setLoadingTiendas] = useState(false);
  const [showStoreSelector, setShowStoreSelector] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [savingPermisos, setSavingPermisos] = useState(false);
  const origenOptions = ['Recomendación', 'Redes sociales', 'Publicidad', 'Búsqueda en internet', 'Pasé por la tienda', 'Otro'];
  const [tiendasCargadas, setTiendasCargadas] = useState(false);

  // Función para cargar las tiendas disponibles
  const fetchTiendas = async (forceReload = false) => {
    try {
      // Si ya se cargaron las tiendas y no se fuerza la recarga, no hacer nada
      if (tiendasCargadas && !forceReload && tiendas.length > 0) {
        console.log('[PerfilScreen] Tiendas ya cargadas, omitiendo carga');
        return;
      }

      console.log('[PerfilScreen] Cargando tiendas disponibles...');
      setLoadingTiendas(true);
      
      try {
        // Limpiar tiendas existentes si se fuerza la recarga
        if (forceReload) {
          setTiendas([]);
        }
        
        // Obtener el token de autenticación
        const token = await AsyncStorage.getItem('@token');
        if (!token) {
          console.error('[PerfilScreen] No hay token de autenticación para cargar tiendas');
          setTiendas(TIENDAS_FALLBACK);
          setTiendasCargadas(true);
          setLoadingTiendas(false);
          return;
        }
        
        const response = await client.get('/tiendas', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('[PerfilScreen] Respuesta de tiendas:', response.data);
        
        // Determinar el formato de la respuesta y extraer los datos
        let tiendasData = [];
        
        if (response.data && Array.isArray(response.data)) {
          // Formato 1: Array directo de tiendas
          tiendasData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          // Formato 2: Objeto con propiedad data que es un array
          tiendasData = response.data.data;
        } else if (response.data && response.data.items && Array.isArray(response.data.items)) {
          // Formato 3: Objeto con propiedad items que es un array
          tiendasData = response.data.items;
        } else {
          // Intentar extraer datos si es un objeto con propiedades numéricas (como un mapa)
          if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
            const keys = Object.keys(response.data).filter(key => !isNaN(Number(key)));
            if (keys.length > 0) {
              tiendasData = keys.map(key => response.data[key]);
            }
          }
        }
        
        // Si no se encontraron datos en ningún formato conocido
        if (tiendasData.length === 0) {
          console.error('[PerfilScreen] No se pudieron extraer datos de tiendas de la respuesta:', response.data);
          setTiendas(TIENDAS_FALLBACK);
          setTiendasCargadas(true);
          setLoadingTiendas(false);
          return;
        }
        
        // Mapear y normalizar los datos de tiendas
        const tiendasNormalizadas = tiendasData.map((tienda: any) => ({
          id: tienda.id,
          nombre: tienda.nombre || tienda.name || 'Tienda sin nombre',
          direccion: tienda.direccion || tienda.address || tienda.location || '',
          telefono: tienda.telefono || tienda.phone || '',
          email_contacto: tienda.email_contacto || tienda.email || tienda.contact_email || ''
        }));
        
        // IMPORTANTE: No filtrar por nombre+dirección para mantener todas las tiendas
        // aunque tengan datos idénticos, ya que tienen IDs distintos
        
        console.log(`[PerfilScreen] Tiendas cargadas: ${tiendasNormalizadas.length}`);
        setTiendas(tiendasNormalizadas);
        setTiendasCargadas(true);
      } catch (error: any) {
        console.error('[PerfilScreen] Error al cargar tiendas:', error);
        
        // Si es un error de autenticación, usar datos de respaldo
        if (error.response && error.response.status === 401) {
          console.error('[PerfilScreen] Error de autenticación al cargar tiendas');
          Alert.alert(
            'Sesión expirada',
            'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
            [{ text: 'Aceptar', onPress: () => logout() }]
          );
        }
        
        setTiendas(TIENDAS_FALLBACK);
        setTiendasCargadas(true);
      }
    } catch (error) {
      console.error('[PerfilScreen] Error general al cargar tiendas disponibles:', error);
      setTiendas(TIENDAS_FALLBACK);
      setTiendasCargadas(true);
    } finally {
      setLoadingTiendas(false);
    }
  };

  // Función para cargar las tiendas del usuario
  const fetchTiendasUsuario = async (userId: number) => {
    try {
      console.log('[PerfilScreen] Cargando tiendas del usuario:', userId);
      setLoadingTiendas(true);
      
      // Obtener el token de autenticación
      const token = await AsyncStorage.getItem('@token');
      if (!token) {
        console.error('[PerfilScreen] No hay token de autenticación para cargar tiendas del usuario');
        setTiendasUsuario([]);
        setLoadingTiendas(false);
        return;
      }
      
      // Usar el endpoint correcto para obtener las tiendas de un usuario
      const response = await client.get(`/usuario-tienda/usuario/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('[PerfilScreen] Respuesta de tiendas del usuario:', response.data);
      
      // Determinar el formato de la respuesta y extraer los IDs de tiendas
      let tiendasUsuarioData = [];
      
      if (response.data && Array.isArray(response.data)) {
        // Formato 1: Array directo de relaciones usuario-tienda
        tiendasUsuarioData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        // Formato 2: Objeto con propiedad data que es un array
        tiendasUsuarioData = response.data.data;
      } else if (response.data && response.data.items && Array.isArray(response.data.items)) {
        // Formato 3: Objeto con propiedad items que es un array
        tiendasUsuarioData = response.data.items;
      }
      
      // Extraer los IDs de tiendas
      const tiendasIds = tiendasUsuarioData.map((item: any) => {
        // Manejar diferentes formatos posibles
        if (typeof item === 'number') {
          return item;
        } else if (item.tiendaId) {
          return item.tiendaId;
        } else if (item.tienda_id) {
          return item.tienda_id;
        } else if (item.tienda && item.tienda.id) {
          return item.tienda.id;
        } else if (item.id) {
          return item.id;
        }
        return null;
      }).filter((id: any) => id !== null);
      
      console.log(`[PerfilScreen] IDs de tiendas del usuario: ${tiendasIds.join(', ')}`);
      setTiendasUsuario(tiendasIds);
    } catch (error: any) {
      console.error('[PerfilScreen] Error al cargar tiendas del usuario:', error);
      
      // Si es un error de autenticación, mostrar alerta
      if (error.response && error.response.status === 401) {
        console.error('[PerfilScreen] Error de autenticación al cargar tiendas del usuario');
        Alert.alert(
          'Sesión expirada',
          'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          [{ text: 'Aceptar', onPress: () => logout() }]
        );
      }
      
      setTiendasUsuario([]);
    } finally {
      setLoadingTiendas(false);
    }
  };

  const getTiendaNombre = (id?: number) => {
    if (!id) return 'No especificado';
    const tienda = tiendas.find(t => t.id === id);
    return tienda ? tienda.nombre : `Tienda ${id}`;
  };

  const isTiendaSelected = (tiendaId: number) => {
    return tiendasUsuario.includes(tiendaId);
  };

  // Función para alternar la selección de una tienda
  const toggleTienda = (tiendaId: number) => {
    // Verificar que el ID sea válido
    if (tiendaId === undefined || tiendaId === null) {
      console.error('[PerfilScreen] Intento de seleccionar tienda con ID inválido:', tiendaId);
      return;
    }
    
    // Crear un nuevo array con valores únicos (eliminar duplicados)
    const currentTiendas = [...new Set(tiendasUsuario.filter(id => id !== undefined && id !== null))];
    
    if (currentTiendas.includes(tiendaId)) {
      // Si ya está seleccionada, la quitamos
      const updatedTiendas = currentTiendas.filter(id => id !== tiendaId);
      setTiendasUsuario(updatedTiendas);
      console.log(`[PerfilScreen] Tienda ${tiendaId} deseleccionada. Tiendas actuales:`, updatedTiendas);
    } else {
      // Si no está seleccionada, la agregamos
      const updatedTiendas = [...currentTiendas, tiendaId];
      setTiendasUsuario(updatedTiendas);
      console.log(`[PerfilScreen] Tienda ${tiendaId} seleccionada. Tiendas actuales:`, updatedTiendas);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('[PerfilScreen] Cargando datos del perfil y tiendas...');
        
        // Cargar tiendas primero para asegurar que estén disponibles
        await fetchTiendas();
        
        const userData = await AsyncStorage.getItem('@user');
        if (userData) {
          const user = JSON.parse(userData);
          console.log('[PerfilScreen] Datos del usuario:', user);
          
          // Cargar tiendas del usuario si existe el ID de usuario
          if (user.id) {
            await fetchTiendasUsuario(user.id);
          } else if (user.tiendas && Array.isArray(user.tiendas)) {
            // Usar tiendas guardadas en AsyncStorage como fallback
            setTiendasUsuario(user.tiendas);
          }
          
          try {
            // Intentar cargar el perfil del usuario desde la API
            const response = await client.get(`/usuarios/${user.id}`);
            console.log('[PerfilScreen] Respuesta de perfil:', response.data);
            
            // Determinar el formato de la respuesta y extraer los datos
            let profileData = null;
            
            if (response.data) {
              if (response.data.data) {
                profileData = response.data.data;
              } else {
                profileData = response.data;
              }
            }
            
            if (profileData) {
              // Si el perfil tiene un cliente_id, cargar los datos del cliente
              if (profileData.cliente_id) {
                try {
                  const clienteResponse = await client.get(`/clientes/${profileData.cliente_id}`);
                  console.log('[PerfilScreen] Respuesta de cliente:', clienteResponse.data);
                  
                  // Determinar el formato de la respuesta y extraer los datos
                  let clienteData = null;
                  
                  if (clienteResponse.data) {
                    if (clienteResponse.data.data) {
                      clienteData = clienteResponse.data.data;
                    } else {
                      clienteData = clienteResponse.data;
                    }
                  }
                  
                  if (clienteData) {
                    // Combinar datos del usuario y cliente
                    const combinedProfile: UserProfile = {
                      ...user,
                      ...profileData,
                      ...clienteData,
                      permisos: {
                        notificaciones: clienteData.notificaciones || false,
                        marketing: clienteData.marketing || false,
                        localizacion: clienteData.localizacion || false,
                        compartir_datos: clienteData.compartir_datos || false
                      }
                    };
                    
                    setProfile(combinedProfile);
                  } else {
                    // Si no hay datos de cliente, usar solo datos de usuario
                    setProfile({
                      ...user,
                      ...profileData,
                      permisos: {
                        notificaciones: false,
                        marketing: false,
                        localizacion: false,
                        compartir_datos: false
                      }
                    });
                  }
                } catch (error) {
                  console.error('[PerfilScreen] Error al cargar datos del cliente:', error);
                  // Usar solo datos de usuario si hay error al cargar cliente
                  setProfile({
                    ...user,
                    ...profileData,
                    permisos: {
                      notificaciones: false,
                      marketing: false,
                      localizacion: false,
                      compartir_datos: false
                    }
                  });
                }
              } else {
                // Si no hay cliente_id, usar solo datos de usuario
                setProfile({
                  ...user,
                  ...profileData,
                  permisos: {
                    notificaciones: false,
                    marketing: false,
                    localizacion: false,
                    compartir_datos: false
                  }
                });
              }
            } else {
              // Si no hay datos de perfil, usar datos guardados en AsyncStorage
              setProfile({
                ...user,
                permisos: {
                  notificaciones: false,
                  marketing: false,
                  localizacion: false,
                  compartir_datos: false
                }
              });
            }
          } catch (error) {
            console.error('[PerfilScreen] Error al cargar perfil:', error);
            // Usar datos guardados en AsyncStorage si hay error
            setProfile({
              ...user,
              permisos: {
                notificaciones: false,
                marketing: false,
                localizacion: false,
                compartir_datos: false
              }
            });
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('[PerfilScreen] Error general al cargar datos:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const saveUserStoreRelations = async (userId: string) => {
    try {
      console.log(`[PerfilScreen] Intentando guardar relaciones usuario-tienda para el usuario ${userId}...`);
      
      const token = await AsyncStorage.getItem('@token');
      if (!token) {
        console.warn('[PerfilScreen] No se encontró token de autenticación para guardar relaciones');
        return false;
      }
      
      try {
        const currentRelations = await client.get(`/usuario-tienda/usuario/${userId}`);
        const currentTiendaIds = currentRelations.data.map((rel: { tienda_id: number }) => rel.tienda_id);
        
        const tiendasToAdd = tiendasUsuario.filter(id => !currentTiendaIds.includes(id));
        const relationsToRemove = currentRelations.data.filter((rel: { tienda_id: number; id: string }) => !tiendasUsuario.includes(rel.tienda_id));
        
        for (const tiendaId of tiendasToAdd) {
          await client.post('/usuario-tienda', {
            usuarioId: userId,
            tiendaId: tiendaId,
            es_administrador: false, 
            fecha_registro: new Date().toISOString()
          });
          console.log(`[PerfilScreen] Relación creada para tienda ${tiendaId}`);
        }
        
        for (const relation of relationsToRemove) {
          await client.delete(`/usuario-tienda/${relation.id}`);
          console.log(`[PerfilScreen] Relación eliminada para tienda ${relation.tienda_id}`);
        }
        
        console.log('[PerfilScreen] Relaciones usuario-tienda actualizadas correctamente');
        return true;
      } catch (apiError: any) {
        console.error('[PerfilScreen] Error al guardar relaciones usuario-tienda:', apiError);
        
        if (apiError.response && apiError.response.status === 401) {
          Alert.alert(
            'Sesión expirada',
            'Su sesión ha expirado. Por favor, inicie sesión nuevamente para guardar sus preferencias de tiendas.',
            [{ text: 'Entendido', style: 'default' }]
          );
        }
        
        return false;
      }
    } catch (error) {
      console.error('[PerfilScreen] Error general al guardar relaciones usuario-tienda:', error);
      return false;
    }
  };

  const handleSaveProfile = async () => {
    if (!editedProfile?.nombre) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    if (tiendasUsuario.length === 0) {
      Alert.alert('Error', 'Debes seleccionar al menos una tienda');
      return;
    }

    setSaving(true);

    try {
      // 1. Obtener el token y los datos del usuario actual
      const token = await AsyncStorage.getItem('@token');
      const userData = await AsyncStorage.getItem('@user');
      
      if (!token || !userData) {
        throw new Error('No se encontró información de autenticación');
      }
      
      const user = JSON.parse(userData);
      const userId = user.id.toString();

      // 2. Preparar los datos del cliente para guardar/actualizar
      const clienteData: any = {
        nombres: editedProfile?.nombre,
        apellidos: editedProfile?.apellido || '',
        email: editedProfile?.email || '',
        telefono: editedProfile?.telefono || '',
        direccion_detalle: editedProfile?.direccion || '',
        identificacion: editedProfile?.identificacion || '',
        origen_cita: editedProfile?.origen_cita || '',
        puntos_acumulados: editedProfile?.puntos_acumulados || 0,
        tiendaId: tiendasUsuario[0] // Usamos la primera tienda como tienda principal
      };

      // Solo incluir fecha_nacimiento si existe y convertirla al formato correcto (ISO string)
      if (editedProfile?.fecha_nacimiento) {
        try {
          // Intentar convertir la fecha al formato ISO
          const fecha = new Date(editedProfile.fecha_nacimiento);
          if (!isNaN(fecha.getTime())) {
            clienteData.fecha_nacimiento = fecha.toISOString().split('T')[0]; // Formato YYYY-MM-DD
          }
        } catch (fechaError) {
          console.error('[PerfilScreen] Error al formatear fecha_nacimiento:', fechaError);
          // No incluir el campo si hay un error
        }
      }

      console.log('[PerfilScreen] Datos del cliente a guardar:', clienteData);

      let clienteId = profile?.id;
      let response;

      // 3. Crear o actualizar el cliente en la base de datos
      try {
        if (clienteId && clienteId !== userId) {
          // Actualizar cliente existente
          console.log(`[PerfilScreen] Actualizando cliente existente con ID: ${clienteId}`);
          response = await client.patch(`/clientes/${clienteId}`, clienteData);
        } else {
          // Crear nuevo cliente
          console.log('[PerfilScreen] Creando nuevo cliente');
          response = await client.post('/clientes', clienteData);
          clienteId = response.data.id;
          
          // Actualizar la relación usuario-cliente en el backend
          console.log(`[PerfilScreen] Actualizando relación usuario-cliente en el backend: usuario ${userId} - cliente ${clienteId}`);
          await client.patch(`/usuarios/${userId}`, { cliente_id: clienteId });
        }

        console.log('[PerfilScreen] Respuesta de guardar cliente:', response.data);
        
        // Actualizar el perfil local con los datos de respuesta
        const updatedProfile = {
          ...editedProfile,
          id: response.data.id.toString(),
          nombre: response.data.nombres,
          apellido: response.data.apellidos,
          email: response.data.email,
          telefono: response.data.telefono,
          identificacion: response.data.identificacion,
          direccion: response.data.direccion_detalle,
          fecha_nacimiento: response.data.fecha_nacimiento ? new Date(response.data.fecha_nacimiento).toISOString().split('T')[0] : '',
          puntos_acumulados: response.data.puntos_acumulados,
          origen_cita: response.data.origen_cita
        };
        
        setProfile(updatedProfile);
        setEditedProfile(updatedProfile);
        
        // Actualizar también los datos del usuario en AsyncStorage
        const updatedUser = {
          ...user,
          cliente_id: response.data.id,
          nombre: response.data.nombres,
          apellido: response.data.apellidos,
          email: response.data.email,
          telefono: response.data.telefono,
          identificacion: response.data.identificacion,
          direccion: response.data.direccion_detalle,
          fecha_nacimiento: response.data.fecha_nacimiento ? new Date(response.data.fecha_nacimiento).toISOString().split('T')[0] : '',
          puntos_acumulados: response.data.puntos_acumulados,
          origen_cita: response.data.origen_cita
        };
        
        await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
        console.log('[PerfilScreen] Datos de usuario actualizados en AsyncStorage');
      } catch (clienteError: any) {
        console.error('[PerfilScreen] Error al guardar datos del cliente:', clienteError);
        Alert.alert('Error', `No se pudo guardar la información del cliente: ${clienteError.message || 'Error desconocido'}`);
        setSaving(false);
        return;
      }

      // 4. Gestionar las relaciones usuario-tienda de forma independiente
      let relacionesActualizadasCorrectamente = true;
      
      try {
        // Intentar obtener las relaciones actuales
        const relacionesResponse = await client.get(`/usuario-tienda/usuario/${userId}`);
        const relacionesActuales = relacionesResponse.data || [];
        console.log('[PerfilScreen] Relaciones usuario-tienda actuales:', relacionesActuales);

        // Verificar que tiendasUsuario contenga valores válidos
        const tiendasValidas = tiendasUsuario.filter((id: number) => id !== undefined && id !== null);
        if (tiendasValidas.length === 0) {
          console.error('[PerfilScreen] No hay tiendas válidas seleccionadas');
          relacionesActualizadasCorrectamente = false;
          throw new Error('No hay tiendas válidas seleccionadas');
        }

        // Identificar tiendas a agregar y eliminar
        const tiendasActualesIds = relacionesActuales.map((rel: any) => 
          typeof rel.tiendaId === 'number' ? rel.tiendaId : 
          typeof rel.tiendaId === 'string' ? parseInt(rel.tiendaId) : 
          typeof rel.tienda_id === 'number' ? rel.tienda_id : 
          typeof rel.tienda_id === 'string' ? parseInt(rel.tienda_id) : null
        ).filter((id: number | null) => id !== null);
        
        console.log('[PerfilScreen] IDs de tiendas actuales:', tiendasActualesIds);
        console.log('[PerfilScreen] IDs de tiendas seleccionadas:', tiendasValidas);
        
        const tiendasAgregar = tiendasValidas.filter((id: number) => !tiendasActualesIds.includes(id));
        const relacionesEliminar = relacionesActuales.filter((rel: any) => {
          const relTiendaId = rel.tiendaId || rel.tienda_id;
          return !tiendasValidas.includes(relTiendaId);
        });
        
        console.log('[PerfilScreen] Tiendas a agregar:', tiendasAgregar);
        console.log('[PerfilScreen] Relaciones a eliminar:', relacionesEliminar);

        // Eliminar relaciones que ya no existen
        for (const relacion of relacionesEliminar) {
          console.log(`[PerfilScreen] Eliminando relación usuario-tienda: ${relacion.id}`);
          await client.delete(`/usuario-tienda/${relacion.id}`);
        }

        // Agregar nuevas relaciones
        for (const tiendaId of tiendasAgregar) {
          if (tiendaId) {
            console.log(`[PerfilScreen] Creando relación usuario-tienda: usuario ${userId} - tienda ${tiendaId}`);
            // Usar la estructura correcta según el backend
            await client.post('/usuario-tienda', {
              usuarioId: parseInt(userId),
              tiendaId: parseInt(tiendaId.toString())
              // Eliminado el campo fecha_registro que no debe existir
            });
          }
        }

        console.log('[PerfilScreen] Relaciones usuario-tienda actualizadas correctamente');
      } catch (relacionesError: any) {
        relacionesActualizadasCorrectamente = false;
        console.error('[PerfilScreen] Error al gestionar relaciones usuario-tienda:', relacionesError);
        
        // Guardar las tiendas seleccionadas en AsyncStorage para mantener la selección del usuario
        try {
          const updatedUser = JSON.parse(await AsyncStorage.getItem('@user') || '{}');
          updatedUser.tiendas = tiendasUsuario.filter((id: number) => id !== undefined && id !== null);
          await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
          console.log('[PerfilScreen] Tiendas seleccionadas guardadas en AsyncStorage');
        } catch (storageError) {
          console.error('[PerfilScreen] Error al guardar tiendas en AsyncStorage:', storageError);
        }
      }

      // 5. Guardar la tienda principal en AsyncStorage
      try {
        // Verificar que haya al menos una tienda válida seleccionada
        const tiendasValidas = tiendasUsuario.filter((id: number) => id !== undefined && id !== null);
        if (tiendasValidas.length > 0) {
          const tiendaPrincipal = tiendasValidas[0];
          await AsyncStorage.setItem('@tiendaId', tiendaPrincipal.toString());
          console.log(`[PerfilScreen] Tienda principal guardada en AsyncStorage: ${tiendaPrincipal}`);
        } else {
          console.warn('[PerfilScreen] No hay tiendas válidas para guardar como principal');
        }
      } catch (tiendaError) {
        console.error('[PerfilScreen] Error al guardar tienda principal en AsyncStorage:', tiendaError);
      }

      setSaving(false);
      setEditing(false);
      
      if (relacionesActualizadasCorrectamente) {
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
      } else {
        Alert.alert(
          'Información guardada parcialmente',
          'La información del perfil se guardó correctamente, pero hubo un problema al actualizar las tiendas asociadas. Por favor, inicia sesión nuevamente para completar el proceso.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('[PerfilScreen] Error al guardar el perfil:', error);
      setSaving(false);
      
      // Mensaje de error más descriptivo basado en el tipo de error
      let errorMessage = 'Ocurrió un error al guardar el perfil.';
      
      if (error.response) {
        // Error de respuesta del servidor
        if (error.response.status === 401) {
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = `Error del servidor: ${error.response.data.message}`;
        } else {
          errorMessage = `Error del servidor: ${error.response.status}`;
        }
      } else if (error.request) {
        // Error de red
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      } else {
        // Otro tipo de error
        errorMessage = error.message || errorMessage;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: () => {
            logout();
          }
        }
      ]
    );
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    if (!editedProfile) return;
    
    setEditedProfile({
      ...editedProfile,
      [field]: value
    });
  };

  const handleTogglePermission = (id: string) => {
    if (editedProfile && editedProfile.permisos) {
      setEditedProfile({
        ...editedProfile,
        permisos: {
          ...editedProfile.permisos,
          [id as keyof Permisos]: !editedProfile.permisos[id as keyof Permisos]
        }
      });
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split('T')[0];
      handleInputChange('fecha_nacimiento', formattedDate);
    }
  };

  const handleSavePermisos = () => {
    handleSaveProfile();
  };

  const handleShowStoreSelector = () => {
    // Verificar si ya hay tiendas cargadas, si no, cargarlas
    if (!tiendasCargadas || tiendas.length === 0) {
      console.log('[PerfilScreen] Cargando tiendas antes de mostrar selector...');
      setLoading(true);
      
      fetchTiendas(true).then(() => {
        setLoading(false);
        
        if (tiendas.length > 0) {
          console.log('[PerfilScreen] Tiendas cargadas correctamente, mostrando selector');
          setShowStoreSelector(true);
        } else {
          console.error('[PerfilScreen] No se pudieron cargar tiendas');
          Alert.alert(
            'No hay tiendas disponibles',
            'No se pudieron cargar las tiendas. Por favor, intenta más tarde.'
          );
        }
      });
    } else {
      console.log('[PerfilScreen] Mostrando selector con tiendas ya cargadas:', tiendas.length);
      setShowStoreSelector(true);
    }
  };

  const handleStoreSelectionChange = (selectedIds: number[]) => {
    // Actualizar el estado con las tiendas seleccionadas
    setTiendasUsuario(selectedIds);
    
    // Guardar la selección en AsyncStorage para persistencia
    try {
      const storeTiendasUsuario = async () => {
        const userData = await AsyncStorage.getItem('@user');
        if (userData) {
          const user = JSON.parse(userData);
          user.tiendas = selectedIds;
          await AsyncStorage.setItem('@user', JSON.stringify(user));
          console.log('[PerfilScreen] Tiendas seleccionadas guardadas en AsyncStorage');
        }
      };
      storeTiendasUsuario();
    } catch (error) {
      console.error('[PerfilScreen] Error al guardar tiendas en AsyncStorage:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, fontSize: 16, color: colors.text }}>
          Cargando información...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeaderWithActions 
          profile={profile} 
          editing={editing} 
          setEditing={setEditing} 
          editedProfile={editedProfile} 
          setEditedProfile={setEditedProfile} 
          handleSaveProfile={handleSaveProfile}
          saving={saving}
        />
        
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'datos' && styles.activeTab]}
            onPress={() => setActiveTab('datos')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'datos' && styles.activeTabText
              ]}
            >
              Información Personal
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'permisos' && styles.activeTab]}
            onPress={() => setActiveTab('permisos')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'permisos' && styles.activeTabText
              ]}
            >
              Permisos
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.tabContent}>
          {activeTab === 'datos' ? (
            editing ? (
              <ProfileEditMode
                editedProfile={editedProfile}
                handleInputChange={(field: keyof UserProfile, value: string) => {
                  if (editedProfile) {
                    setEditedProfile({
                      ...editedProfile,
                      [field]: value
                    });
                  }
                }}
                setShowDatePicker={setShowDatePicker}
                tiendasUsuario={tiendasUsuario}
                tiendas={tiendas}
                setShowStoreSelector={handleShowStoreSelector}
              />
            ) : (
              <ProfileViewMode
                profile={profile}
                tiendasUsuario={tiendasUsuario}
                tiendas={tiendas}
              />
            )
          ) : (
            <PermissionsSection
              permissions={[
                {
                  id: 'notificaciones',
                  title: 'Notificaciones',
                  description: 'Recibir notificaciones sobre citas, promociones y novedades',
                  enabled: editedProfile?.permisos?.notificaciones
                },
                {
                  id: 'marketing',
                  title: 'Marketing',
                  description: 'Recibir ofertas y promociones exclusivas por email',
                  enabled: editedProfile?.permisos?.marketing
                },
                {
                  id: 'localizacion',
                  title: 'Localización',
                  description: 'Permitir acceso a tu ubicación para mejores recomendaciones',
                  enabled: editedProfile?.permisos?.localizacion
                },
                {
                  id: 'compartir_datos',
                  title: 'Compartir Datos',
                  description: 'Compartir datos anónimos para mejorar nuestros servicios',
                  enabled: editedProfile?.permisos?.compartir_datos
                }
              ]}
              togglePermission={handleTogglePermission}
              savingPermissions={saving}
              handleSavePermissions={handleSavePermisos}
            />
          )}
        </View>
        
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={20} color="white" style={styles.logoutIcon} />
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
        
        {/* Modal simplificado para seleccionar tiendas */}
        <Modal
          visible={showStoreSelector}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowStoreSelector(false)}
        >
          <SafeAreaView style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecciona tus tiendas</Text>
                <TouchableOpacity onPress={() => setShowStoreSelector(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalDescription}>
                Selecciona las tiendas donde realizas tus compras
              </Text>
              
              <FlatList
                data={tiendas}
                renderItem={({ item }) => {
                  const isSelected = tiendasUsuario.includes(item.id);
                  return (
                    <TouchableOpacity
                      style={styles.storeItem}
                      onPress={() => toggleTienda(item.id)}
                    >
                      <Ionicons
                        name={isSelected ? 'checkbox' : 'square-outline'}
                        size={24}
                        color={isSelected ? colors.primary : colors.textLight}
                      />
                      <View style={styles.storeItemContent}>
                        <Text style={isSelected ? styles.storeItemSelected : styles.storeItemText}>
                          {item.nombre} (ID: {item.id})
                        </Text>
                        {item.direccion && <Text style={styles.storeItemAddress}>{item.direccion}</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                }}
                keyExtractor={(item) => `store-${item.id}`}
              />
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => setShowStoreSelector(false)}
              >
                <Text style={styles.confirmButtonText}>Confirmar selección</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
        
        {showDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.background,
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.background,
  },
  inputText: {
    fontSize: 16,
    color: colors.text,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textLight,
  },
  inputHint: {
    fontSize: 12,
    color: colors.accent,
    marginTop: 4,
    fontStyle: 'italic',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  storeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  infoContainer: {
    marginBottom: 20,
  },
  profileInfo: {
    paddingTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  infoLabel: {
    width: 150,
    fontWeight: '600',
    color: colors.textLight,
  },
  infoValue: {
    flex: 1,
    color: colors.text,
  },
  tiendaItem: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  permisosContainer: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  permisosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  permisosDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 20,
  },
  permisoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  permisoInfo: {
    flex: 1,
    marginRight: 10,
  },
  permisoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  permisoDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
  savePermisosButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  savePermisosButtonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  logoutButtonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  logoutIcon: {
    marginRight: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 15,
  },
  storeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  storeItemContent: {
    marginLeft: 10,
    flex: 1,
  },
  storeItemText: {
    fontSize: 16,
    color: colors.text,
  },
  storeItemSelected: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
  storeItemAddress: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});