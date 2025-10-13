// Type definitions for Otto AI Platform

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'agent';
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vehicle {
  id: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  licensePlate?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Call {
  id: string;
  customerId?: string;
  phoneNumber: string;
  direction: 'inbound' | 'outbound';
  status: 'active' | 'completed' | 'failed';
  duration?: number;
  recordingUrl?: string;
  transcript?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
