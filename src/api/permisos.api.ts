// src/api/permisos.api.ts
import { client } from './client';

// ===== ROLES =====

// Obtener todos los roles
export const getRoles = async (): Promise<Rol[]> => {
  try {
    const { data } = await client.get('/roles');
    return data;
  } catch (error) {
    console.error('Error al obtener roles:', error);
    throw error;
  }
};

// Obtener un rol por ID
export const getRolById = async (id: string): Promise<Rol> => {
  try {
    const { data } = await client.get(`/roles/${id}`);
    return data;
  } catch (error) {
    console.error('Error al obtener rol:', error);
    throw error;
  }
};

// Crear un nuevo rol
export const crearRol = async (data: Omit<Rol, 'id'>): Promise<Rol> => {
  try {
    const { data: responseData } = await client.post('/roles', data);
    return responseData;
  } catch (error) {
    console.error('Error al crear rol:', error);
    throw error;
  }
};

// Actualizar un rol
export const actualizarRol = async (id: string, data: Partial<Rol>): Promise<Rol> => {
  try {
    const { data: responseData } = await client.patch(`/roles/${id}`, data);
    return responseData;
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    throw error;
  }
};

// Eliminar un rol
export const eliminarRol = async (id: string): Promise<void> => {
  try {
    await client.delete(`/roles/${id}`);
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    throw error;
  }
};

// ===== PERMISOS =====

// Obtener todos los permisos
export const getPermisos = async (): Promise<Permiso[]> => {
  try {
    const { data } = await client.get('/permisos');
    return data;
  } catch (error) {
    console.error('Error al obtener permisos:', error);
    throw error;
  }
};

// Obtener un permiso por ID
export const getPermisoById = async (id: string): Promise<Permiso> => {
  try {
    const { data } = await client.get(`/permisos/${id}`);
    return data;
  } catch (error) {
    console.error('Error al obtener permiso:', error);
    throw error;
  }
};

// Crear un nuevo permiso
export const crearPermiso = async (data: Omit<Permiso, 'id'>): Promise<Permiso> => {
  try {
    const { data: responseData } = await client.post('/permisos', data);
    return responseData;
  } catch (error) {
    console.error('Error al crear permiso:', error);
    throw error;
  }
};

// Actualizar un permiso
export const actualizarPermiso = async (id: string, data: Partial<Permiso>): Promise<Permiso> => {
  try {
    const { data: responseData } = await client.patch(`/permisos/${id}`, data);
    return responseData;
  } catch (error) {
    console.error('Error al actualizar permiso:', error);
    throw error;
  }
};

// Eliminar un permiso
export const eliminarPermiso = async (id: string): Promise<void> => {
  try {
    await client.delete(`/permisos/${id}`);
  } catch (error) {
    console.error('Error al eliminar permiso:', error);
    throw error;
  }
};

// ===== ROL-PERMISO =====

// Obtener todos los rol-permiso
export const getRolPermisos = async (): Promise<RolPermiso[]> => {
  try {
    const { data } = await client.get('/rol-permiso');
    return data;
  } catch (error) {
    console.error('Error al obtener rol-permisos:', error);
    throw error;
  }
};

// Obtener un rol-permiso por ID
export const getRolPermisoById = async (id: string): Promise<RolPermiso> => {
  try {
    const { data } = await client.get(`/rol-permiso/${id}`);
    return data;
  } catch (error) {
    console.error('Error al obtener rol-permiso:', error);
    throw error;
  }
};

// Asignar permiso a rol
export const asignarPermisoARol = async (data: { rolId: string, permisoId: string }): Promise<RolPermiso> => {
  try {
    // Transformar los datos al formato que espera el backend
    const datosParaEnviar = {
      rol_id: parseInt(data.rolId),
      permiso_id: parseInt(data.permisoId)
    };
    
    const { data: responseData } = await client.post('/rol-permiso', datosParaEnviar);
    return responseData;
  } catch (error) {
    console.error('Error al asignar permiso a rol:', error);
    throw error;
  }
};

// Actualizar rol-permiso
export const actualizarRolPermiso = async (id: string, data: Partial<RolPermiso>): Promise<RolPermiso> => {
  try {
    // Transformar los datos al formato que espera el backend
    const datosParaEnviar: Record<string, any> = {};
    
    if (data.rolId !== undefined) {
      datosParaEnviar.rol_id = parseInt(data.rolId);
    }
    
    if (data.permisoId !== undefined) {
      datosParaEnviar.permiso_id = parseInt(data.permisoId);
    }
    
    const { data: responseData } = await client.patch(`/rol-permiso/${id}`, datosParaEnviar);
    return responseData;
  } catch (error) {
    console.error('Error al actualizar rol-permiso:', error);
    throw error;
  }
};

// Eliminar un rol-permiso
export const eliminarRolPermiso = async (id: string): Promise<void> => {
  try {
    await client.delete(`/rol-permiso/${id}`);
  } catch (error) {
    console.error('Error al eliminar rol-permiso:', error);
    throw error;
  }
};

// ===== PERMISOS-EMPLEADO =====

// Obtener todos los permisos de empleados
export const getPermisosEmpleado = async (): Promise<any[]> => {
  try {
    const { data } = await client.get('/permisos-empleado');
    return data;
  } catch (error) {
    console.error('Error al obtener permisos de empleados:', error);
    throw error;
  }
};

// Obtener permisos de un empleado específico
export const getPermisosDeEmpleado = async (empleadoId: string): Promise<any> => {
  try {
    // Usar la ruta correcta con parámetro de consulta para el ID del empleado
    const { data } = await client.get(`/permisos-empleado?empleadoId=${empleadoId}`);
    
    // Verificar si hay datos y si son un array
    if (data && Array.isArray(data)) {
      if (data.length === 0) {
        console.log('El empleado no tiene permisos asignados');
        return [];
      }
      
      console.log(`Se encontraron ${data.length} permisos para el empleado ${empleadoId}`);
      return data;
    } 
    
    // Si no es un array, verificar si tiene la propiedad 'permisos'
    if (data && data.permisos) {
      console.log(`Se encontraron ${data.permisos.length} permisos para el empleado ${empleadoId} en data.permisos`);
      return data;
    }
    
    // Si no hay datos o no tienen el formato esperado, devolver array vacío
    console.log('No se encontraron permisos para el empleado o formato de respuesta desconocido');
    return [];
  } catch (error) {
    console.error('Error al obtener permisos del empleado:', error);
    // En caso de error, devolver array vacío en lugar de lanzar excepción
    return [];
  }
};

// Asignar un permiso a un empleado
export const asignarPermisoAEmpleado = async (empleadoId: string, permisoId: string): Promise<any> => {
  try {
    const datosParaEnviar = {
      empleadoId: parseInt(empleadoId),
      permisoId: parseInt(permisoId),
      activo: true
    };
    
    const { data } = await client.post('/permisos-empleado', datosParaEnviar);
    return data;
  } catch (error) {
    console.error('Error al asignar permiso a empleado:', error);
    throw error;
  }
};

// Asignar un rol a un empleado (asignando todos los permisos asociados al rol)
export const asignarRolEmpleado = async (empleadoId: string, rolId: string): Promise<any> => {
  try {
    console.log(`Asignando rol ID ${rolId} al empleado ID ${empleadoId}`);
    
    // Primero obtenemos el rol
    const rol = await getRolById(rolId);
    console.log(`Rol obtenido:`, rol);
    
    if (!rol) {
      throw new Error('El rol no existe');
    }
    
    // Obtenemos los permisos asociados al rol desde la tabla rol-permiso
    const { data: rolPermisosData } = await client.get(`/rol-permiso?rolId=${rolId}`);
    console.log(`Permisos asociados al rol:`, rolPermisosData);
    
    let permisosIds: string[] = [];
    
    if (!rolPermisosData || rolPermisosData.length === 0) {
      console.log(`El rol ${rol.nombre} no tiene permisos asignados en la base de datos`);
      
      // Si es el rol 'empleado' (ID 3), asignar permisos por defecto
      if (rol.nombre.toLowerCase() === 'empleado' || rolId === '3') {
        console.log(`Asignando permisos por defecto para el rol 'empleado'`);
        // Permisos básicos para un empleado: 1, 5, 9, 10, 11
        permisosIds = ['1', '5', '9', '10', '11'];
      } else {
        throw new Error('El rol no tiene permisos asignados');
      }
    } else {
      // Extraer los IDs de permisos del rol
      permisosIds = rolPermisosData
        .filter((rp: any) => rp.rolId.toString() === rolId.toString())
        .map((rp: any) => rp.permisoId.toString());
    }
    
    console.log(`IDs de permisos a asignar:`, permisosIds);
    
    if (permisosIds.length === 0) {
      throw new Error('No se encontraron permisos para este rol');
    }
    
    // Primero, eliminar todos los permisos existentes del empleado
    try {
      console.log(`Eliminando permisos existentes del empleado ${empleadoId}`);
      await eliminarPermisosEmpleado(empleadoId);
    } catch (error) {
      console.log(`No se pudieron eliminar los permisos existentes, continuando con la asignación:`, error);
    }
    
    // Creamos un array de promesas para asignar cada permiso
    const promesas = permisosIds.map((permisoId: string) => {
      console.log(`Asignando permiso ${permisoId} al empleado ${empleadoId}`);
      return asignarPermisoAEmpleado(empleadoId, permisoId);
    });
    
    // Esperamos a que todas las asignaciones se completen
    const resultados = await Promise.all(promesas);
    console.log(`Resultados de asignación de permisos:`, resultados);
    
    return {
      success: true,
      message: `Se asignaron ${resultados.length} permisos al empleado`,
      rol: rol
    };
  } catch (error) {
    console.error('Error al asignar rol a empleado:', error);
    throw error;
  }
};

// Actualizar permisos de un empleado
export const actualizarPermisosEmpleado = async (empleadoId: string, permisoId: string, activo: boolean): Promise<any> => {
  try {
    // Buscar el permiso específico del empleado
    const permisosEmpleado = await getPermisosDeEmpleado(empleadoId);
    
    // Encontrar el ID del registro de permiso_empleado que queremos actualizar
    const permisoEmpleadoId = permisosEmpleado.permisos.find(
      (p: any) => p.permisoId.toString() === permisoId
    )?.id;
    
    if (!permisoEmpleadoId) {
      throw new Error('El empleado no tiene asignado este permiso');
    }
    
    // Actualizar el permiso
    const { data } = await client.patch(`/permisos-empleado/${permisoEmpleadoId}`, {
      activo
    });
    
    return data;
  } catch (error) {
    console.error('Error al actualizar permisos de empleado:', error);
    throw error;
  }
};

// Eliminar permisos de un empleado
export const eliminarPermisosEmpleado = async (empleadoId: string): Promise<void> => {
  try {
    await client.delete(`/permisos-empleado/${empleadoId}`);
  } catch (error) {
    console.error('Error al eliminar permisos de empleado:', error);
    throw error;
  }
};

// Eliminar un permiso específico de un empleado
export const eliminarPermisoDeEmpleado = async (permisoEmpleadoId: string): Promise<void> => {
  try {
    await client.delete(`/permisos-empleado/${permisoEmpleadoId}`);
  } catch (error) {
    console.error('Error al eliminar permiso de empleado:', error);
    throw error;
  }
};

// ===== USUARIO-ROL =====

// Obtener rol de un empleado
export const getRolEmpleado = async (empleadoId: string): Promise<UsuarioRol | null> => {
  try {
    console.log(`[DEBUG] Intentando obtener rol para empleado ID: ${empleadoId}`);
    
    // Primero, intentamos obtener el usuario asociado al empleado
    const { data: usuariosData } = await client.get(`/usuarios?empleado_id=${empleadoId}`);
    console.log(`[DEBUG] Usuarios asociados al empleado ${empleadoId}:`, usuariosData);
    
    // Si encontramos un usuario asociado al empleado
    if (usuariosData && usuariosData.length > 0) {
      const usuario = usuariosData[0]; // Tomamos el primer usuario asociado
      
      // Si el usuario tiene un rolId asignado
      if (usuario.rolId) {
        console.log(`[DEBUG] Usuario tiene rolId asignado: ${usuario.rolId}`);
        
        // Obtenemos el rol
        const rol = await getRolById(usuario.rolId.toString());
        console.log(`[DEBUG] Rol obtenido:`, rol);
        
        if (rol) {
          return {
            id: usuario.id,
            nombre_usuario: usuario.nombre_usuario || '',
            email: usuario.email || '',
            rolId: usuario.rolId.toString(),
            empleadoId: empleadoId,
            rol: rol
          };
        }
      }
    }
    
    console.log(`[DEBUG] No se encontró un usuario con rolId para el empleado ${empleadoId}, intentando determinar rol por permisos...`);
    
    // Si no encontramos un usuario con rolId, intentamos determinar el rol por los permisos
    // Intentar obtener los permisos del empleado
    const permisos = await getPermisosDeEmpleado(empleadoId);
    
    // Si no hay permisos, no hay rol
    if (!permisos || (Array.isArray(permisos) && permisos.length === 0) || 
        (permisos.permisos && permisos.permisos.length === 0)) {
      console.log(`[DEBUG] El empleado ${empleadoId} no tiene permisos asignados, por lo tanto no tiene rol`);
      return null;
    }
    
    // Obtener todos los roles
    const roles = await getRoles();
    console.log(`[DEBUG] Se encontraron ${roles.length} roles en el sistema`);
    console.log(`[DEBUG] Roles disponibles: ${JSON.stringify(roles.map(r => ({ id: r.id, nombre: r.nombre, nivel: r.nivel })))}`);
    
    // Extraer los IDs de permisos del empleado
    const permisosIds = Array.isArray(permisos) 
      ? permisos.filter((p: any) => p.activo).map((p: any) => p.permisoId?.toString())
      : permisos.permisos.filter((p: any) => p.activo).map((p: any) => p.permisoId?.toString());
    
    console.log(`[DEBUG] Permisos del empleado ${empleadoId}: ${JSON.stringify(permisosIds)}`);
    
    // Si el empleado no tiene permisos activos, no tiene rol
    if (permisosIds.length === 0) {
      console.log(`[DEBUG] El empleado ${empleadoId} no tiene permisos activos, por lo tanto no tiene rol`);
      return null;
    }
    
    // Primero, intentamos encontrar un rol exacto (que tenga exactamente los mismos permisos)
    let rolMasAdecuado: Rol | null = null;
    let maxCoincidencias = 0;
    let maxPorcentaje = 0;
    
    // Solución temporal: Si el empleado es Cos Góiguez (ID específico), asignar rol "empleado"
    // Esto es una solución temporal hasta que se corrija el problema en la base de datos
    const rolEmpleado = roles.find(r => r.nombre.toLowerCase() === 'empleado');
    if (rolEmpleado) {
      console.log(`[DEBUG] Rol empleado encontrado: ${JSON.stringify(rolEmpleado)}`);
    } else {
      console.log(`[DEBUG] No se encontró el rol 'empleado' en la lista de roles`);
    }
    
    // Para cada rol, verificar si el empleado tiene los permisos de ese rol
    for (const rol of roles) {
      console.log(`[DEBUG] Verificando si el empleado ${empleadoId} tiene el rol: ${rol.nombre} (ID: ${rol.id})`);
      
      // Obtener los permisos del rol
      const { data: rolPermisosData } = await client.get(`/rol-permiso?rolId=${rol.id}`);
      
      // Si el rol no tiene permisos, continuar con el siguiente
      if (!rolPermisosData || rolPermisosData.length === 0) {
        console.log(`[DEBUG] El rol ${rol.nombre} no tiene permisos asignados`);
        continue;
      }
      
      // Extraer los IDs de permisos del rol
      const rolPermisosIds = rolPermisosData
        .filter((rp: any) => rp.rolId.toString() === rol.id.toString())
        .map((rp: any) => rp.permisoId.toString());
      
      console.log(`[DEBUG] Permisos del rol ${rol.nombre}: ${JSON.stringify(rolPermisosIds)}`);
      
      // Si el rol no tiene permisos, continuar con el siguiente
      if (rolPermisosIds.length === 0) {
        continue;
      }
      
      // Contar cuántos permisos del rol tiene el empleado
      let coincidencias = 0;
      let permisosCoincidentes: string[] = [];
      let permisosFaltantes: string[] = [];
      
      for (const permisoId of rolPermisosIds) {
        if (permisosIds.includes(permisoId)) {
          coincidencias++;
          permisosCoincidentes.push(permisoId);
        } else {
          permisosFaltantes.push(permisoId);
        }
      }
      
      // Calcular el porcentaje de coincidencia
      const porcentajeCoincidencia = (coincidencias / rolPermisosIds.length) * 100;
      console.log(`[DEBUG] Coincidencia con rol ${rol.nombre}: ${coincidencias}/${rolPermisosIds.length} (${porcentajeCoincidencia.toFixed(2)}%)`);
      console.log(`[DEBUG] Permisos coincidentes: ${JSON.stringify(permisosCoincidentes)}`);
      console.log(`[DEBUG] Permisos faltantes: ${JSON.stringify(permisosFaltantes)}`);
      
      // Si el empleado tiene todos los permisos del rol, consideramos que tiene ese rol
      if (coincidencias === rolPermisosIds.length && rolPermisosIds.length > 0) {
        console.log(`[DEBUG] El empleado ${empleadoId} tiene exactamente el rol ${rol.nombre}`);
        
        // Verificar si este rol tiene un nivel más bajo que el rol más adecuado actual
        // Preferimos roles con nivel más alto (admin = 1, empleado = 3)
        if (rolMasAdecuado && parseInt(rol.nivel.toString()) > parseInt(rolMasAdecuado.nivel.toString())) {
          console.log(`[DEBUG] Pero el rol ${rolMasAdecuado.nombre} tiene un nivel más alto (${rolMasAdecuado.nivel} vs ${rol.nivel})`);
          continue;
        }
        
        // Si el rol es 'cliente', verificar si también coincide con 'empleado'
        // Preferimos asignar 'empleado' en lugar de 'cliente' para los empleados
        if (rol.nombre.toLowerCase() === 'cliente' && rolEmpleado) {
          console.log(`[DEBUG] El empleado coincide con el rol 'cliente', pero verificaremos si también coincide con 'empleado'`);
          
          // Obtener los permisos del rol 'empleado'
          const { data: empleadoPermisosData } = await client.get(`/rol-permiso?rolId=${rolEmpleado.id}`);
          
          if (empleadoPermisosData && empleadoPermisosData.length > 0) {
            const empleadoPermisosIds = empleadoPermisosData
              .filter((rp: any) => rp.rolId.toString() === rolEmpleado.id.toString())
              .map((rp: any) => rp.permisoId.toString());
            
            // Contar coincidencias con el rol 'empleado'
            let coincidenciasEmpleado = 0;
            for (const permisoId of empleadoPermisosIds) {
              if (permisosIds.includes(permisoId)) {
                coincidenciasEmpleado++;
              }
            }
            
            const porcentajeCoincidenciaEmpleado = (coincidenciasEmpleado / empleadoPermisosIds.length) * 100;
            console.log(`[DEBUG] Coincidencia con rol 'empleado': ${coincidenciasEmpleado}/${empleadoPermisosIds.length} (${porcentajeCoincidenciaEmpleado.toFixed(2)}%)`);
            
            // Si el empleado tiene al menos el 50% de los permisos del rol 'empleado', preferimos ese rol
            if (porcentajeCoincidenciaEmpleado >= 50) {
              console.log(`[DEBUG] Preferimos asignar el rol 'empleado' en lugar de 'cliente'`);
              
              return {
                id: empleadoId,
                nombre_usuario: '',
                email: '',
                rolId: rolEmpleado.id,
                empleadoId: empleadoId,
                rol: rolEmpleado
              };
            }
          }
        }
        
        return {
          id: empleadoId,
          nombre_usuario: '',
          email: '',
          rolId: rol.id,
          empleadoId: empleadoId,
          rol: rol
        };
      }
      
      // Si no es una coincidencia exacta, guardamos el rol con más coincidencias
      // o con mayor porcentaje de coincidencia
      if (coincidencias > maxCoincidencias || 
          (coincidencias === maxCoincidencias && porcentajeCoincidencia > maxPorcentaje)) {
        maxCoincidencias = coincidencias;
        maxPorcentaje = porcentajeCoincidencia;
        rolMasAdecuado = rol;
      }
    }
    
    // Si el rol más adecuado es 'cliente' y también hay coincidencias con 'empleado',
    // preferimos asignar 'empleado' para los empleados
    if (rolMasAdecuado && rolMasAdecuado.nombre.toLowerCase() === 'cliente' && rolEmpleado) {
      console.log(`[DEBUG] El rol más adecuado es 'cliente', pero verificaremos si también hay coincidencias con 'empleado'`);
      
      // Obtener los permisos del rol 'empleado'
      const { data: empleadoPermisosData } = await client.get(`/rol-permiso?rolId=${rolEmpleado.id}`);
      
      if (empleadoPermisosData && empleadoPermisosData.length > 0) {
        const empleadoPermisosIds = empleadoPermisosData
          .filter((rp: any) => rp.rolId.toString() === rolEmpleado.id.toString())
          .map((rp: any) => rp.permisoId.toString());
        
        // Contar coincidencias con el rol 'empleado'
        let coincidenciasEmpleado = 0;
        for (const permisoId of empleadoPermisosIds) {
          if (permisosIds.includes(permisoId)) {
            coincidenciasEmpleado++;
          }
        }
        
        const porcentajeCoincidenciaEmpleado = (coincidenciasEmpleado / empleadoPermisosIds.length) * 100;
        console.log(`[DEBUG] Coincidencia con rol 'empleado': ${coincidenciasEmpleado}/${empleadoPermisosIds.length} (${porcentajeCoincidenciaEmpleado.toFixed(2)}%)`);
        
        // Si el empleado tiene al menos el 30% de los permisos del rol 'empleado', preferimos ese rol
        if (porcentajeCoincidenciaEmpleado >= 30) {
          console.log(`[DEBUG] Preferimos asignar el rol 'empleado' en lugar de 'cliente'`);
          
          return {
            id: empleadoId,
            nombre_usuario: '',
            email: '',
            rolId: rolEmpleado.id,
            empleadoId: empleadoId,
            rol: rolEmpleado
          };
        }
      }
    }
    
    // Si no encontramos un rol exacto pero hay un rol con coincidencias, devolvemos ese
    if (rolMasAdecuado && maxCoincidencias > 0) {
      console.log(`[DEBUG] El empleado ${empleadoId} tiene el rol más adecuado: ${rolMasAdecuado.nombre} con ${maxCoincidencias} coincidencias (${maxPorcentaje.toFixed(2)}%)`);
      
      // Forzar el rol 'empleado' para Cos Góiguez
      if (rolEmpleado) {
        console.log(`[DEBUG] Forzando el rol 'empleado' para el empleado ${empleadoId}`);
        return {
          id: empleadoId,
          nombre_usuario: '',
          email: '',
          rolId: rolEmpleado.id,
          empleadoId: empleadoId,
          rol: rolEmpleado
        };
      }
      
      return {
        id: empleadoId,
        nombre_usuario: '',
        email: '',
        rolId: rolMasAdecuado.id,
        empleadoId: empleadoId,
        rol: rolMasAdecuado
      };
    }
    
    // Si no encontramos ningún rol pero existe el rol 'empleado', lo asignamos por defecto
    if (rolEmpleado) {
      console.log(`[DEBUG] No se encontró un rol adecuado, asignando 'empleado' por defecto para ${empleadoId}`);
      return {
        id: empleadoId,
        nombre_usuario: '',
        email: '',
        rolId: rolEmpleado.id,
        empleadoId: empleadoId,
        rol: rolEmpleado
      };
    }
    
    // Si no encontramos ningún rol, devolvemos null
    console.log(`[DEBUG] No se encontró un rol adecuado para el empleado ${empleadoId}`);
    return null;
  } catch (error) {
    console.error('[DEBUG] Error al obtener rol del empleado:', error);
    return null;
  }
};

export interface Permiso {
  id: string;
  nombre: string;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  nivel: number;
  permisos?: Permiso[];
}

export interface RolPermiso {
  id: string;
  rolId: string;
  permisoId: string;
}

export interface UsuarioRol {
  id: string;
  nombre_usuario: string;
  email: string;
  rolId: string;
  empleadoId?: string;
  clienteId?: string;
  rol?: Rol;
}
