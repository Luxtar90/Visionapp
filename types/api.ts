/**
 * API Types
 * Centralized type definitions for API requests and responses
 */

// Common API response structure
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// Pagination metadata
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Paginated response
export interface PaginatedResponse<T> extends ApiResponse<T> {
  meta: PaginationMeta;
}

// Authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: {
      id: number;
      nombre: string;
      descripcion: string;
    } | string;
  };
}

// User
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: {
    id: number;
    nombre: string;
    descripcion: string;
  } | string;
  createdAt: string;
  updatedAt: string;
}

// Appointments
export interface Appointment {
  id: number;
  userId: number;
  studioId: number;
  serviceId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  service?: Service;
  studio?: Studio;
}

export interface AppointmentRequest {
  studioId: number;
  serviceId: number;
  date: string;
  startTime: string;
  notes?: string;
}

// Services
export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  studioId: number;
  createdAt: string;
  updatedAt: string;
}

// Studios
export interface Studio {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  openingHours: {
    monday: { open: string; close: string };
    tuesday: { open: string; close: string };
    wednesday: { open: string; close: string };
    thursday: { open: string; close: string };
    friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  };
  createdAt: string;
  updatedAt: string;
  services?: Service[];
}

// Products
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  category: string;
}
