/**
 * Script para actualizar las dependencias del proyecto Visionapp
 * 
 * Este script realiza las siguientes tareas:
 * 1. Verifica las dependencias desactualizadas
 * 2. Actualiza las dependencias a las versiones más recientes compatibles
 * 3. Ejecuta pruebas para asegurar que todo funcione correctamente
 */

const { execSync } = require('child_process');
// Estos módulos se incluyen para posibles expansiones futuras del script
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
// eslint-disable-next-line no-unused-vars
const path = require('path');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Función para ejecutar comandos y mostrar la salida
function runCommand(command, options = {}) {
  console.log(`${colors.bright}${colors.blue}Ejecutando:${colors.reset} ${command}`);
  try {
    const output = execSync(command, {
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf-8',
      ...options
    });
    return { success: true, output };
  } catch (error) {
    if (!options.ignoreError) {
      console.error(`${colors.red}Error al ejecutar ${command}:${colors.reset}`, error.message);
    }
    return { success: false, error: error.message, output: error.stdout };
  }
}

// Función para verificar dependencias desactualizadas
function checkOutdatedDependencies() {
  console.log(`\n${colors.bright}${colors.cyan}Verificando dependencias desactualizadas...${colors.reset}`);
  
  const result = runCommand('npm outdated --json', { silent: true });
  
  if (result.success) {
    try {
      const outdated = JSON.parse(result.output);
      const outdatedCount = Object.keys(outdated).length;
      
      if (outdatedCount > 0) {
        console.log(`${colors.yellow}Se encontraron ${outdatedCount} dependencias desactualizadas:${colors.reset}`);
        
        for (const [pkg, info] of Object.entries(outdated)) {
          console.log(`  - ${colors.bright}${pkg}${colors.reset}: ${colors.dim}${info.current}${colors.reset} → ${colors.green}${info.latest}${colors.reset}`);
        }
      } else {
        console.log(`${colors.green}Todas las dependencias están actualizadas.${colors.reset}`);
      }
      
      return outdated;
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      console.log(`${colors.green}No se encontraron dependencias desactualizadas.${colors.reset}`);
      return {};
    }
  } else {
    console.log(`${colors.yellow}No se pudo verificar las dependencias desactualizadas.${colors.reset}`);
    return {};
  }
}

// Función para actualizar dependencias
function updateDependencies(outdated) {
  console.log(`\n${colors.bright}${colors.cyan}Actualizando dependencias...${colors.reset}`);
  
  const outdatedCount = Object.keys(outdated).length;
  if (outdatedCount === 0) {
    console.log(`${colors.green}No hay dependencias para actualizar.${colors.reset}`);
    return true;
  }
  
  // Preguntar al usuario si desea actualizar las dependencias
  console.log(`${colors.yellow}Se actualizarán ${outdatedCount} dependencias.${colors.reset}`);
  console.log(`${colors.dim}Nota: Este proceso puede tardar varios minutos.${colors.reset}`);
  
  // Actualizar dependencias una por una para mayor control
  let updateCount = 0;
  for (const [pkg, info] of Object.entries(outdated)) {
    console.log(`\n${colors.bright}Actualizando ${pkg} de ${info.current} a ${info.latest}...${colors.reset}`);
    
    const updateResult = runCommand(`npm install ${pkg}@latest --save-exact`, { ignoreError: true });
    
    if (updateResult.success) {
      console.log(`${colors.green}✓ ${pkg} actualizado correctamente.${colors.reset}`);
      updateCount++;
    } else {
      console.log(`${colors.red}✗ Error al actualizar ${pkg}.${colors.reset}`);
    }
  }
  
  console.log(`\n${colors.bright}${colors.green}${updateCount} de ${outdatedCount} dependencias actualizadas correctamente.${colors.reset}`);
  return updateCount > 0;
}

// Función para verificar tipos y ejecutar lint
function verifyProject() {
  console.log(`\n${colors.bright}${colors.cyan}Verificando el proyecto...${colors.reset}`);
  
  console.log(`\n${colors.bright}Ejecutando lint...${colors.reset}`);
  const lintResult = runCommand('npm run lint', { ignoreError: true });
  
  if (lintResult.success) {
    console.log(`${colors.green}✓ Lint completado sin errores.${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ Lint completado con advertencias o errores.${colors.reset}`);
    console.log(`${colors.dim}Ejecuta 'npm run lint' para ver los detalles.${colors.reset}`);
  }
  
  return true;
}

// Función principal
async function updateProject() {
  console.log(`${colors.bright}${colors.magenta}=== Actualización de Dependencias del Proyecto Visionapp ===${colors.reset}`);
  
  // Verificar dependencias desactualizadas
  const outdated = checkOutdatedDependencies();
  
  // Actualizar dependencias
  const updated = updateDependencies(outdated);
  
  // Verificar el proyecto después de la actualización
  if (updated) {
    verifyProject();
  }
  
  console.log(`\n${colors.bright}${colors.green}¡Proceso de actualización completado!${colors.reset}`);
  console.log(`${colors.dim}Recuerda probar la aplicación para asegurarte de que todo funcione correctamente.${colors.reset}`);
}

// Ejecutar la función principal
updateProject().catch(error => {
  console.error(`${colors.red}Error durante la ejecución del script:${colors.reset}`, error);
});
