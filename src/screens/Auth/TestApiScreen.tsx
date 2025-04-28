import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { testBackendConnection, testAuthEndpoints } from '../../api/auth.api';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const TestApiScreen = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const navigation = useNavigation();

  const runConnectionTest = async () => {
    setLoading(true);
    setResults(['Iniciando pruebas de conexión...']);
    
    try {
      // Ejecutar la prueba de conexión general
      await testBackendConnection();
      
      // Ejecutar la prueba de endpoints de autenticación
      setResults(prev => [...prev, '\nProbando diferentes endpoints de autenticación...']);
      await testAuthEndpoints();
      setResults(prev => [...prev, 'Prueba de endpoints de autenticación completada.']);
      
      // Prueba específica para el endpoint de registro
      try {
        setResults(prev => [...prev, '\nProbando endpoint de registro directamente...']);
        
        // Intentar obtener la documentación de Swagger para ver las rutas correctas
        try {
          setResults(prev => [...prev, '\nObteniendo documentación de Swagger...']);
          const swaggerResponse = await axios.get('http://10.0.2.2:3001/api-json', {
            timeout: 5000
          });
          
          if (swaggerResponse.data) {
            setResults(prev => [...prev, '✅ Documentación Swagger obtenida']);
            setResults(prev => [...prev, `Paths disponibles: ${Object.keys(swaggerResponse.data.paths || {}).join(', ')}`]);
            
            // Buscar rutas de autenticación
            const authPaths = Object.keys(swaggerResponse.data.paths || {})
              .filter(path => path.includes('auth') || path.includes('login') || path.includes('register'));
            
            if (authPaths.length > 0) {
              setResults(prev => [...prev, `Rutas de autenticación encontradas: ${authPaths.join(', ')}`]);
            } else {
              setResults(prev => [...prev, 'No se encontraron rutas de autenticación en la documentación']);
            }
          }
        } catch (swaggerError: any) {
          setResults(prev => [...prev, `❌ Error al obtener documentación Swagger: ${swaggerError.message}`]);
          
          // Intentar con otra URL para Swagger
          try {
            setResults(prev => [...prev, 'Intentando con URL alternativa para Swagger...']);
            const altSwaggerResponse = await axios.get('http://10.0.2.2:3001/api/docs-json', {
              timeout: 5000
            });
            
            if (altSwaggerResponse.data) {
              setResults(prev => [...prev, '✅ Documentación Swagger obtenida (URL alternativa)']);
              setResults(prev => [...prev, `Paths disponibles: ${Object.keys(altSwaggerResponse.data.paths || {}).join(', ')}`]);
            }
          } catch (altSwaggerError: any) {
            setResults(prev => [...prev, `❌ Error con URL alternativa: ${altSwaggerError.message}`]);
          }
        }
        
        const baseURL = 'http://10.0.2.2:3001';
        const testUser = {
          nombre: 'usuarioprueba',
          email: `test${Date.now()}@example.com`,
          password: 'Password123!',
          rol: 'cliente',
          tiendaId: 1
        };
        
        // Probar diferentes posibles endpoints para registro
        const possibleEndpoints = [
          '/api/auth/register',
          '/auth/register',
          '/api/usuarios/register',
          '/usuarios/register',
          '/api/register',
          '/register',
          '/api/signup',
          '/signup'
        ];
        
        setResults(prev => [...prev, '\nProbando múltiples endpoints para registro:']);
        
        for (const endpoint of possibleEndpoints) {
          try {
            setResults(prev => [...prev, `\nIntentando con: ${baseURL}${endpoint}`]);
            
            const response = await axios.post(`${baseURL}${endpoint}`, testUser, {
              timeout: 5000,
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            }).catch(error => {
              if (error.response) {
                // Si recibimos una respuesta aunque sea de error, la conexión funciona
                return error.response;
              }
              throw error;
            });
            
            setResults(prev => [...prev, `Respuesta: ${response.status} ${response.statusText || ''}`]);
            
            if (response.status === 201 || response.status === 200) {
              setResults(prev => [...prev, `✅ ÉXITO con ${endpoint}`]);
              setResults(prev => [...prev, `Datos: ${JSON.stringify(response.data, null, 2)}`]);
              break;
            } else {
              setResults(prev => [...prev, `Mensaje: ${JSON.stringify(response.data, null, 2)}`]);
            }
          } catch (error: any) {
            setResults(prev => [...prev, `❌ Error con ${endpoint}: ${error.message}`]);
          }
        }
        
        // Prueba con método OPTIONS para verificar CORS
        try {
          setResults(prev => [...prev, '\nVerificando configuración CORS...']);
          
          const response = await axios.options(`${baseURL}/auth/register`, {
            timeout: 5000
          });
          
          setResults(prev => [...prev, `✅ Respuesta OPTIONS: ${response.status}`]);
          setResults(prev => [...prev, `Headers: ${JSON.stringify(response.headers, null, 2)}`]);
        } catch (error: any) {
          setResults(prev => [...prev, `❌ Error en verificación CORS: ${error.message}`]);
        }
        
      } catch (error: any) {
        if (error.response) {
          setResults(prev => [...prev, `❌ Error de respuesta: ${error.response.status}`]);
          setResults(prev => [...prev, `Mensaje: ${JSON.stringify(error.response.data, null, 2)}`]);
        } else if (error.request) {
          setResults(prev => [...prev, '❌ No se recibió respuesta del servidor']);
        } else {
          setResults(prev => [...prev, `❌ Error: ${error.message}`]);
        }
      }
      
    } catch (error: any) {
      setResults(prev => [...prev, `Error general: ${error.message}`]);
    } finally {
      setLoading(false);
      setResults(prev => [...prev, '\nPruebas de conexión completadas.']);
    }
  };

  const runDirectTest = async () => {
    setLoading(true);
    setResults(['Iniciando prueba directa...']);
    
    try {
      const baseURL = 'http://10.0.2.2:3001';
      
      // 1. Probar conexión básica
      try {
        setResults(prev => [...prev, '\nProbando conexión básica...']);
        const rootResponse = await axios.get(baseURL);
        setResults(prev => [...prev, `✅ Conexión básica exitosa: ${rootResponse.status}`]);
        setResults(prev => [...prev, `Datos: ${rootResponse.data}`]);
      } catch (error: any) {
        setResults(prev => [...prev, `❌ Error en conexión básica: ${error.message}`]);
      }
      
      // 2. Intentar registro directo con axios
      try {
        setResults(prev => [...prev, '\nIntentando registro directo con axios...']);
        
        const testUser = {
          nombre: `test${Date.now()}`,
          email: `test${Date.now()}@example.com`,
          password: 'Password123!',
          rol: 'cliente',
          tiendaId: 1
        };
        
        setResults(prev => [...prev, `Datos de registro: ${JSON.stringify(testUser, null, 2)}`]);
        
        const registerResponse = await axios.post(`${baseURL}/auth/register`, testUser, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        setResults(prev => [...prev, `✅ Registro exitoso: ${registerResponse.status}`]);
        setResults(prev => [...prev, `Respuesta: ${JSON.stringify(registerResponse.data, null, 2)}`]);
      } catch (error: any) {
        setResults(prev => [...prev, `❌ Error en registro directo:`]);
        
        if (error.response) {
          setResults(prev => [...prev, `Status: ${error.response.status}`]);
          setResults(prev => [...prev, `Datos: ${JSON.stringify(error.response.data, null, 2)}`]);
        } else {
          setResults(prev => [...prev, `Mensaje: ${error.message}`]);
        }
      }
      
      // 3. Intentar login directo con axios
      try {
        setResults(prev => [...prev, '\nIntentando login directo con axios...']);
        
        const loginData = {
          email: 'admin@mirame.com',
          password: 'Password123!'
        };
        
        const loginResponse = await axios.post(`${baseURL}/auth/login`, loginData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        setResults(prev => [...prev, `✅ Login exitoso: ${loginResponse.status}`]);
        setResults(prev => [...prev, `Respuesta: ${JSON.stringify(loginResponse.data, null, 2)}`]);
      } catch (error: any) {
        setResults(prev => [...prev, `❌ Error en login directo:`]);
        
        if (error.response) {
          setResults(prev => [...prev, `Status: ${error.response.status}`]);
          setResults(prev => [...prev, `Datos: ${JSON.stringify(error.response.data, null, 2)}`]);
        } else {
          setResults(prev => [...prev, `Mensaje: ${error.message}`]);
        }
      }
      
    } catch (error: any) {
      setResults(prev => [...prev, `Error general: ${error.message}`]);
    } finally {
      setLoading(false);
      setResults(prev => [...prev, '\nPrueba directa completada.']);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diagnóstico de Conexión API</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={runConnectionTest}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Ejecutar Pruebas</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton]}
        onPress={runDirectTest}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Prueba Directa</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Volver</Text>
      </TouchableOpacity>
      
      <ScrollView style={styles.resultsContainer}>
        {results.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  resultText: {
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 4,
  },
});

export default TestApiScreen;
