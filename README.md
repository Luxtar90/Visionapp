# Visionapp - Aplicación de Gestión de Servicios

Visionapp es una aplicación React Native con Expo que permite la gestión de servicios, productos y citas. Utiliza una arquitectura modular con TypeScript para tipado estático, Redux para gestión de estado, y una estructura de servicios API centralizada.

## Instalación y Ejecución

1. Instalar dependencias

   ```bash
   npm install
   ```

2. Iniciar la aplicación

   ```bash
   npx expo start
   ```

## Estructura del Proyecto

### Directorios Principales

- **app/**: Contiene la lógica principal de la aplicación
  - **(tabs)/**: Pantallas principales de la aplicación (tabs de navegación)
  - **(admin)/**: Pantallas de administración
  - **(auth)/**: Pantallas de autenticación
  - **(profile)/**: Pantallas relacionadas con el perfil de usuario
  - **components/**: Componentes específicos de la aplicación
  - **constants/**: Constantes y configuraciones
  - **contexts/**: Contextos de React (AuthContext, StoreContext)

- **components/**: Componentes UI reutilizables
  - **ui/**: Componentes UI de bajo nivel
  - **__tests__/**: Pruebas de componentes

- **config/**: Configuraciones globales
  - **api.ts**: Configuración centralizada de API

- **hooks/**: Custom hooks de React

- **scripts/**: Scripts de utilidad para el proyecto
  - **cleanup-project.js**: Script para limpiar archivos obsoletos
  - **reset-project.js**: Script para reiniciar el proyecto

- **services/**: Servicios para interactuar con APIs externas

- **store/**: Configuración de Redux y slices
  - **slices/**: Slices de Redux Toolkit (auth, booking, profile, etc.)
  - **index.ts**: Configuración central del store

- **theme/**: Sistema de temas centralizado (colores, espaciado, tipografía)

- **types/**: Definiciones de tipos TypeScript

- **utils/**: Funciones utilitarias

## Mejores Prácticas

### Importaciones y Referencias

- Usar siempre TypeScript para todos los archivos nuevos
- Importar contextos desde app/contexts/
- Importar el store desde store/index.ts
- Mantener los componentes UI genéricos en /components y los específicos en /app/components

### Componentes

- Utilizar el sistema de temas centralizado para estilos
- Aprovechar los componentes reutilizables (Button, Input, Card, etc.)
- Seguir las convenciones de tipado para props
- Utilizar interfaces para definir las props de los componentes

### Estado y Gestión de Datos

- Utilizar los contextos de React para estado local o específico de un árbol de componentes
- Utilizar Redux Toolkit y sus slices para estado global persistente
- Implementar validaciones de tipo para evitar errores en tiempo de ejecución

## Cambios Recientes

### Migración a TypeScript

- Se han migrado todos los componentes JavaScript a TypeScript
- Se han implementado slices de Redux Toolkit para reemplazar los reducers antiguos
- Se han añadido definiciones de tipos para todas las interfaces y funciones

### Reorganización del Proyecto

- Se ha consolidado la estructura de carpetas, eliminando duplicidades
- Se ha centralizado la gestión de estado en la carpeta `store`
- Se ha eliminado la carpeta `context` obsoleta, usando `app/contexts` en su lugar
- Se ha creado un script de limpieza para mantener el proyecto organizado

### Sistema de Temas

- Se utiliza un sistema de temas centralizado en `theme/index.ts`
- Todos los componentes utilizan este sistema para mantener una apariencia consistente

## Scripts de Utilidad

### Scripts NPM

- `npm start`: Inicia la aplicación con Expo
- `npm run android`: Ejecuta la aplicación en Android
- `npm run ios`: Ejecuta la aplicación en iOS
- `npm run web`: Ejecuta la aplicación en web
- `npm run lint`: Ejecuta el linting del código
- `npm run reset-project`: Reinicia el proyecto a un estado en blanco

### Scripts de Mantenimiento

- `node scripts/cleanup-project.js`: Limpia archivos obsoletos y consolida la estructura del proyecto
- `node scripts/fix-lint-issues.js`: Corrige automáticamente problemas comunes de linting
- `node scripts/update-dependencies.js`: Verifica y actualiza las dependencias del proyecto

## Recursos

- [Expo documentation](https://docs.expo.dev/): Documentación oficial de Expo
- [React Native documentation](https://reactnative.dev/): Documentación oficial de React Native
- [Redux Toolkit](https://redux-toolkit.js.org/): Documentación oficial de Redux Toolkit
