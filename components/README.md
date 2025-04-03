# Componentes Reutilizables

Esta carpeta contiene componentes UI reutilizables que siguen el sistema de temas centralizado de Visionapp.

## Componentes Disponibles

### Avatar
Componente para mostrar avatares de usuario con opciones de personalización.

```tsx
<Avatar 
  source={{ uri: user.profileImage }} 
  size="xl"
  name="Nombre Usuario"
  showBadge={true}
  badgeIcon="camera"
  badgeColor={theme.colors.primary}
  badgeSize={32}
  onPress={() => {}}
  bordered
  borderColor={theme.colors.white}
/>
```

### Badge
Etiquetas para mostrar estados, categorías o información destacada.

```tsx
<Badge 
  text="Admin" 
  variant="primary"
  size="md"
  pill
/>
```

### Button
Botones con diferentes variantes y estados.

```tsx
<Button 
  title="Guardar Cambios" 
  variant="primary" 
  size="lg" 
  leftIcon="save-outline"
  rightIcon="chevron-forward"
  onPress={() => {}}
  loading={false}
  disabled={false}
  fullWidth
/>
```

### Card
Contenedor para agrupar información relacionada.

```tsx
<Card 
  title="Información Personal"
  icon="person-circle"
  iconColor={theme.colors.primary}
  elevation="md"
  style={styles.section}
>
  <Text>Contenido de la tarjeta</Text>
</Card>
```

### Input
Campo de entrada de texto con validación y estados.

```tsx
<Input
  label="Correo Electrónico"
  placeholder="ejemplo@correo.com"
  value={email}
  onChangeText={setEmail}
  error={emailError}
  helperText="Introduce un correo válido"
  leftIcon="mail-outline"
  secureTextEntry={false}
  autoCapitalize="none"
/>
```

## Mejores Prácticas

1. **Sistema de Temas**: Todos los componentes deben usar el sistema de temas centralizado importado desde `theme/index.ts`.

2. **Tipado**: Definir interfaces claras para las props de cada componente.

3. **Accesibilidad**: Incluir atributos de accesibilidad cuando sea posible.

4. **Pruebas**: Crear pruebas unitarias para los componentes en la carpeta `__tests__`.

5. **Documentación**: Mantener actualizada la documentación de cada componente.
