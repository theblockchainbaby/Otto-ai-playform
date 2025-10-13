export type User = {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Lead = {
  id: string;
  customerId: string;
  vehicleId: string;
  status: 'new' | 'contacted' | 'converted' | 'lost';
  createdAt: Date;
  updatedAt: Date;
};

export type Call = {
  id: string;
  customerId: string;
  duration: number;
  recorded: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Appointment = {
  id: string;
  customerId: string;
  vehicleId: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
};