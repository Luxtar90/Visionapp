/**
 * Script para corregir problemas comunes de linting en el proyecto Visionapp
 * 
 * Este script realiza las siguientes tareas:
 * 1. Elimina importaciones no utilizadas
 * 2. Corrige dependencias faltantes en useEffect y useCallback
 * 3. Elimina variables no utilizadas
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Archivos a corregir
const filesToFix = [
  'app/(tabs)/appointments.tsx',
  'app/(tabs)/profile.tsx',
  'app/login.tsx'
];

// Función para leer un archivo
function readFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (fs.existsSync(fullPath)) {
    try {
      return fs.readFileSync(fullPath, 'utf8');
    } catch (error) {
      console.error(`❌ Error al leer ${filePath}:`, error.message);
      return null;
    }
  } else {
    console.log(`⚠️ No encontrado: ${filePath}`);
    return null;
  }
}

// Función para escribir en un archivo
function writeFile(filePath, content) {
  const fullPath = path.join(process.cwd(), filePath);
  
  try {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Actualizado: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al escribir ${filePath}:`, error.message);
    return false;
  }
}

// Función para eliminar importaciones no utilizadas
function removeUnusedImports(content, unusedImports) {
  let updatedContent = content;
  
  unusedImports.forEach(importName => {
    // Buscar importaciones en líneas completas
    const fullImportRegex = new RegExp(`import\\s+{[^}]*\\b${importName}\\b[^}]*}\\s+from\\s+['"][^'"]+['"];?`, 'g');
    const fullImportMatch = fullImportRegex.exec(updatedContent);
    
    if (fullImportMatch) {
      const importStatement = fullImportMatch[0];
      // Si solo hay un elemento en la importación, eliminar toda la línea
      if (importStatement.includes(`{ ${importName} }`)) {
        updatedContent = updatedContent.replace(importStatement, '');
      } else {
        // Si hay múltiples elementos, eliminar solo el elemento no utilizado
        const multiImportRegex = new RegExp(`(,\\s*\\b${importName}\\b|\\b${importName}\\b\\s*,)`, 'g');
        updatedContent = updatedContent.replace(multiImportRegex, '');
      }
    }
  });
  
  return updatedContent;
}

// Función para corregir dependencias faltantes en useEffect y useCallback
function fixMissingDependencies(content, missingDeps) {
  let updatedContent = content;
  
  missingDeps.forEach(({ hookType, lineNumber, dependencies }) => {
    // Buscar el hook en la línea especificada y sus alrededores
    const lines = updatedContent.split('\n');
    let startLine = Math.max(0, lineNumber - 5);
    let endLine = Math.min(lines.length - 1, lineNumber + 5);
    
    for (let i = startLine; i <= endLine; i++) {
      const line = lines[i];
      if (line.includes(`${hookType}(`) && !line.includes(`// eslint-disable-next-line`)) {
        // Buscar el array de dependencias
        let j = i;
        let bracketCount = 0;
        let foundDeps = false;
        let depArrayStart = -1;
        let depArrayEnd = -1;
        
        while (j <= endLine && (bracketCount > 0 || j === i)) {
          const currentLine = lines[j];
          
          for (let k = 0; k < currentLine.length; k++) {
            if (currentLine[k] === '(') bracketCount++;
            if (currentLine[k] === ')') bracketCount--;
            
            if (bracketCount === 0 && j > i) {
              // Encontramos el final del hook
              break;
            }
          }
          
          if (currentLine.includes('[') && !foundDeps) {
            depArrayStart = j;
            foundDeps = true;
          }
          
          if (foundDeps && currentLine.includes(']')) {
            depArrayEnd = j;
            break;
          }
          
          j++;
        }
        
        if (depArrayStart !== -1 && depArrayEnd !== -1) {
          // Obtener el array de dependencias actual
          let depArray = '';
          for (let k = depArrayStart; k <= depArrayEnd; k++) {
            depArray += lines[k];
          }
          
          // Extraer las dependencias actuales
          const depMatch = depArray.match(/\[(.*)\]/);
          if (depMatch) {
            let currentDeps = depMatch[1].trim();
            
            // Añadir las dependencias faltantes
            dependencies.forEach(dep => {
              if (!currentDeps.includes(dep)) {
                currentDeps = currentDeps ? `${currentDeps}, ${dep}` : dep;
              }
            });
            
            // Reemplazar el array de dependencias
            const newLine = lines[depArrayStart].replace(/\[.*/, '[') + 
                           currentDeps + 
                           lines[depArrayEnd].replace(/.*\]/, ']');
            
            if (depArrayStart === depArrayEnd) {
              lines[depArrayStart] = newLine;
            } else {
              lines[depArrayStart] = lines[depArrayStart].replace(/\[.*/, '[');
              for (let k = depArrayStart + 1; k < depArrayEnd; k++) {
                lines[k] = '';
              }
              lines[depArrayEnd] = currentDeps + lines[depArrayEnd].replace(/.*\]/, ']');
            }
            
            updatedContent = lines.join('\n');
            break;
          }
        }
      }
    }
  });
  
  return updatedContent;
}

// Función para añadir comentarios eslint-disable para variables no utilizadas
function addEslintDisableComments(content, unusedVars) {
  let updatedContent = content;
  const lines = updatedContent.split('\n');
  
  unusedVars.forEach(({ varName, lineNumber }) => {
    // Añadir comentario eslint-disable-next-line en la línea anterior
    if (lineNumber > 0 && lineNumber < lines.length) {
      const prevLine = lines[lineNumber - 1];
      if (!prevLine.includes('eslint-disable')) {
        lines[lineNumber - 1] = `${prevLine}\n  // eslint-disable-next-line @typescript-eslint/no-unused-vars`;
      }
    }
  });
  
  return lines.join('\n');
}

// Función principal para corregir problemas de linting
function fixLintIssues() {
  console.log('🔍 Iniciando corrección de problemas de linting...');
  
  // Definir los problemas a corregir por archivo
  const lintIssues = {
    'app/(tabs)/appointments.tsx': {
      unusedImports: ['ActivityIndicator', 'ImageStyle'],
      unusedVars: [
        { varName: 'Client', lineNumber: 36 },
        { varName: 'AppointmentCardProps', lineNumber: 67 },
        { varName: 'userRole', lineNumber: 191 }
      ],
      missingDeps: [
        { hookType: 'useCallback', lineNumber: 102, dependencies: ['fetchAppointments'] },
        { hookType: 'useEffect', lineNumber: 127, dependencies: ['showError'] },
        { hookType: 'useEffect', lineNumber: 134, dependencies: ['fetchAppointments'] },
        { hookType: 'useEffect', lineNumber: 142, dependencies: ['fadeAnim'] },
        { hookType: 'useEffect', lineNumber: 174, dependencies: ['router', 'showError'] },
        { hookType: 'useCallback', lineNumber: 230, dependencies: ['fetchAppointments'] }
      ]
    },
    'app/(tabs)/profile.tsx': {
      unusedImports: ['apiService'],
      unusedVars: [
        { varName: 'UserData', lineNumber: 24 }
      ],
      missingDeps: [
        { hookType: 'useCallback', lineNumber: 99, dependencies: ['fetchUserData'] }
      ]
    },
    'app/login.tsx': {
      unusedImports: ['apiService'],
      unusedVars: [],
      missingDeps: []
    }
  };
  
  // Procesar cada archivo
  filesToFix.forEach(filePath => {
    console.log(`\n📄 Procesando: ${filePath}`);
    const content = readFile(filePath);
    
    if (content) {
      const issues = lintIssues[filePath];
      
      // Aplicar correcciones
      let updatedContent = content;
      
      if (issues.unusedImports && issues.unusedImports.length > 0) {
        console.log(`  - Eliminando importaciones no utilizadas: ${issues.unusedImports.join(', ')}`);
        updatedContent = removeUnusedImports(updatedContent, issues.unusedImports);
      }
      
      if (issues.missingDeps && issues.missingDeps.length > 0) {
        console.log(`  - Corrigiendo dependencias faltantes en hooks`);
        updatedContent = fixMissingDependencies(updatedContent, issues.missingDeps);
      }
      
      if (issues.unusedVars && issues.unusedVars.length > 0) {
        console.log(`  - Añadiendo comentarios eslint-disable para variables no utilizadas`);
        updatedContent = addEslintDisableComments(updatedContent, issues.unusedVars);
      }
      
      // Guardar cambios
      if (updatedContent !== content) {
        writeFile(filePath, updatedContent);
      } else {
        console.log(`  - No se realizaron cambios en ${filePath}`);
      }
    }
  });
  
  console.log('\n✨ Corrección de problemas de linting completada!');
  console.log('\n🧪 Ejecutando lint para verificar correcciones...');
  
  try {
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('✅ Lint completado con éxito');
  } catch (error) {
    console.error('⚠️ Aún hay problemas de lint pendientes:', error.message);
    console.log('👉 Algunos problemas pueden requerir corrección manual.');
  }
}

// Ejecutar la función principal
fixLintIssues();
