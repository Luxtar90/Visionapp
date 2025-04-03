/**
 * Script para limpiar y consolidar la estructura del proyecto Visionapp
 * 
 * Este script realiza las siguientes tareas:
 * 1. Elimina archivos JavaScript obsoletos que ya han sido migrados a TypeScript
 * 2. Elimina carpetas duplicadas o vacías
 * 3. Consolida la estructura del proyecto
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Rutas a limpiar
const pathsToRemove = [
  // Componentes obsoletos
  'src/components/common/Button.js',
  'src/components/common/Input.js',
  
  // Reducers obsoletos (ya migrados a slices)
  'src/reducers/authReducer.js',
  'src/reducers/bookingReducer.js',
  'src/reducers/profileReducer.js',
  
  // API obsoleta (ya migrada a TypeScript)
  'config/api.js',
  
  // Contextos obsoletos (ya migrados)
  'context/AuthContext.tsx',
  'context/StoreContext.tsx'
];

// Carpetas a eliminar si están vacías
const foldersToCheckAndRemove = [
  'src/components/common',
  'src/components',
  'src/reducers',
  'context'
];

// Función para eliminar un archivo si existe
function removeFileIfExists(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      console.log(`✅ Eliminado: ${filePath}`);
    } catch (error) {
      console.error(`❌ Error al eliminar ${filePath}:`, error.message);
    }
  } else {
    console.log(`⚠️ No encontrado: ${filePath}`);
  }
}

// Función para eliminar una carpeta si está vacía
function removeFolderIfEmpty(folderPath) {
  const fullPath = path.join(process.cwd(), folderPath);
  
  if (fs.existsSync(fullPath)) {
    try {
      const files = fs.readdirSync(fullPath);
      
      if (files.length === 0) {
        fs.rmdirSync(fullPath);
        console.log(`✅ Carpeta eliminada (vacía): ${folderPath}`);
      } else {
        console.log(`ℹ️ Carpeta no eliminada (no está vacía): ${folderPath}`);
      }
    } catch (error) {
      console.error(`❌ Error al verificar/eliminar carpeta ${folderPath}:`, error.message);
    }
  } else {
    console.log(`⚠️ Carpeta no encontrada: ${folderPath}`);
  }
}

// Función principal
function cleanupProject() {
  console.log('🧹 Iniciando limpieza del proyecto Visionapp...');
  
  // 1. Eliminar archivos obsoletos
  console.log('\n📄 Eliminando archivos obsoletos...');
  pathsToRemove.forEach(removeFileIfExists);
  
  // 2. Eliminar carpetas vacías
  console.log('\n📁 Eliminando carpetas vacías...');
  foldersToCheckAndRemove.forEach(removeFolderIfEmpty);
  
  // 3. Ejecutar lint para verificar errores
  console.log('\n🔍 Ejecutando lint para verificar errores...');
  try {
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('✅ Lint completado con éxito');
  } catch (error) {
    console.error('❌ Error al ejecutar lint:', error.message);
  }
  
  console.log('\n✨ Limpieza del proyecto completada!');
}

// Ejecutar la función principal
cleanupProject();
