import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole, RolePermissions, RolePermissionsMap } from '../types/roles';

export const useRolePermissions = () => {
  const [role, setRole] = useState<UserRole>(UserRole.GUEST);
  const [permissions, setPermissions] = useState<RolePermissions>(RolePermissionsMap[UserRole.GUEST]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    try {
      const userRole = await AsyncStorage.getItem('userRole');
      if (userRole && Object.values(UserRole).includes(userRole as UserRole)) {
        setRole(userRole as UserRole);
        setPermissions(RolePermissionsMap[userRole as UserRole]);
      }
    } catch (error) {
      console.error('Error loading user role:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: keyof RolePermissions): boolean => {
    return permissions[permission];
  };

  return {
    role,
    permissions,
    hasPermission,
    loading
  };
};
