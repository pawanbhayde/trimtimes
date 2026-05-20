'use client';

export interface Tenant {
  id: string; // URL slug like 'grand-classic'
  name: string;
  ownerName: string;
  ownerEmail: string;
  schemaName: string; // tenant schema
  status: 'Active' | 'Inactive';
  createdDate: string;
  rating: number;
  phone: string;
  address: string;
  image: string;
}

export interface Barber {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
}

export interface Service {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  status: 'Active' | 'Inactive';
}

export interface Appointment {
  id: string;
  tenantId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceId: string;
  serviceName: string;
  barberId: string;
  barberName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  price: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes?: string;
  createdAt: string;
}

const DEFAULT_TENANTS: Tenant[] = [
  {
    id: 'grand-classic',
    name: 'Grand Classic Barber',
    ownerName: 'Julian Vance',
    ownerEmail: 'julian@grandclassic.com',
    schemaName: 'tenant_grand_classic',
    status: 'Active',
    createdDate: '2026-01-15',
    rating: 4.9,
    phone: '(555) 123-4567',
    address: '412 Amber Avenue, Old Town',
    image: 'https://picsum.photos/seed/barber1/800/600',
  },
  {
    id: 'vintage-clipper',
    name: 'The Vintage Clipper',
    ownerName: 'Marcus Stone',
    ownerEmail: 'marcus@vintageclipper.com',
    schemaName: 'tenant_vintage_clipper',
    status: 'Active',
    createdDate: '2026-02-10',
    rating: 4.8,
    phone: '(555) 765-4321',
    address: '88 Charcoal Street, West Side',
    image: 'https://picsum.photos/seed/barber2/800/600',
  },
  {
    id: 'urban-blade',
    name: 'Urban Blade Co.',
    ownerName: 'Leo Sterling',
    ownerEmail: 'leo@urbanblade.com',
    schemaName: 'tenant_urban_blade',
    status: 'Inactive',
    createdDate: '2026-03-01',
    rating: 4.7,
    phone: '(555) 987-6543',
    address: '109 Bronze Court, Midtown Metro',
    image: 'https://picsum.photos/seed/barber3/800/600',
  },
];

const DEFAULT_SERVICES: Service[] = [
  // Grand Classic
  {
    id: 'gc-1',
    tenantId: 'grand-classic',
    name: 'Classic Haircut & Style',
    description: 'Custom scissors and clipper work, premium styling product finish, hot lather neck cleanup.',
    duration: 45,
    price: 45,
    status: 'Active',
  },
  {
    id: 'gc-2',
    tenantId: 'grand-classic',
    name: 'Signature Hot Towel Shave',
    description: 'Straight razor hot lather shave, warm towel sequence, cooling essential oils, head and neck massage.',
    duration: 30,
    price: 35,
    status: 'Active',
  },
  {
    id: 'gc-3',
    tenantId: 'grand-classic',
    name: 'Beard Sculpting & Trim',
    description: 'Detailed beard lineup, trim, straight razor contouring, premium botanical beard oil conditioning.',
    duration: 30,
    price: 25,
    status: 'Active',
  },
  {
    id: 'gc-4',
    tenantId: 'grand-classic',
    name: 'Royal Treatment Suite',
    description: 'Ultimate package combining the Classic Haircut, Signature Hot Towel Shave, and deep conditioning treatment.',
    duration: 75,
    price: 75,
    status: 'Active',
  },
  // Vintage Clipper
  {
    id: 'vc-1',
    tenantId: 'vintage-clipper',
    name: 'Gentleman Trim',
    description: 'Quick clean up trim, sideburn shaping and hot foam neck razor.',
    duration: 30,
    price: 35,
    status: 'Active',
  },
  {
    id: 'vc-2',
    tenantId: 'vintage-clipper',
    name: 'Classic Straight Razor Shave',
    description: 'Perfect close shave utilizing a standard straight razor, bay rum tonic splash.',
    duration: 40,
    price: 40,
    status: 'Active',
  },
];

const DEFAULT_BARBERS: Record<string, Barber[]> = {
  'grand-classic': [
    { id: 'b-gc-1', name: 'Vince "Razor" Spade', avatar: 'https://picsum.photos/seed/barb1/150/150', specialty: 'Straight Razor & Shaving' },
    { id: 'b-gc-2', name: 'Charles Sterling', avatar: 'https://picsum.photos/seed/barb2/150/150', specialty: 'Classic Scissor Cuts' },
    { id: 'b-gc-3', name: 'Daniel Craig', avatar: 'https://picsum.photos/seed/barb3/150/150', specialty: 'Modern Skin Fades' },
  ],
  'vintage-clipper': [
    { id: 'b-vc-1', name: 'Marcus Stone', avatar: 'https://picsum.photos/seed/barb4/150/150', specialty: 'Vintage Beard Styling' },
    { id: 'b-vc-2', name: 'Tommy Shelby', avatar: 'https://picsum.photos/seed/barb5/150/150', specialty: 'Textured Crops' },
  ],
  'urban-blade': [
    { id: 'b-ub-1', name: 'Leo Sterling', avatar: 'https://picsum.photos/seed/barb6/150/150', specialty: 'Fades & Lineups' },
  ],
};

const DEFAULT_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    tenantId: 'grand-classic',
    customerName: 'Pawan Bhayde',
    customerEmail: 'pawanbhayde721@gmail.com',
    customerPhone: '(555) 901-2345',
    serviceId: 'gc-1',
    serviceName: 'Classic Haircut & Style',
    barberId: 'b-gc-1',
    barberName: 'Vince "Razor" Spade',
    date: '2026-05-21',
    time: '10:00',
    price: 45,
    status: 'Confirmed',
    notes: 'Keep the sides very tight, styled with heavy pomade.',
    createdAt: '2026-05-19T14:30:00Z',
  },
  {
    id: 'apt-2',
    tenantId: 'grand-classic',
    customerName: 'Pawan Bhayde',
    customerEmail: 'pawanbhayde721@gmail.com',
    customerPhone: '(555) 901-2345',
    serviceId: 'gc-3',
    serviceName: 'Beard Sculpting & Trim',
    barberId: 'b-gc-2',
    barberName: 'Charles Sterling',
    date: '2026-05-22',
    time: '14:30',
    price: 25,
    status: 'Pending',
    notes: 'No oil, please. Just beard shape.',
    createdAt: '2026-05-20T10:15:00Z',
  },
  {
    id: 'apt-3',
    tenantId: 'grand-classic',
    customerName: 'James Smith',
    customerEmail: 'james.smith@domain.com',
    customerPhone: '(555) 111-2222',
    serviceId: 'gc-4',
    serviceName: 'Royal Treatment Suite',
    barberId: 'b-gc-3',
    barberName: 'Daniel Craig',
    date: '2026-05-20',
    time: '09:00',
    price: 75,
    status: 'Completed',
    notes: 'First time royal treatment.',
    createdAt: '2026-05-18T11:00:00Z',
  },
  {
    id: 'apt-4',
    tenantId: 'grand-classic',
    customerName: 'David Miller',
    customerEmail: 'david@miller.co',
    customerPhone: '(555) 444-5555',
    serviceId: 'gc-2',
    serviceName: 'Signature Hot Towel Shave',
    barberId: 'b-gc-1',
    barberName: 'Vince "Razor" Spade',
    date: '2026-05-20',
    time: '15:00',
    price: 35,
    status: 'Cancelled',
    notes: 'Rescheduling later',
    createdAt: '2026-05-19T09:00:00Z',
  },
];

export function getTenants(): Tenant[] {
  if (typeof window === 'undefined') return DEFAULT_TENANTS;
  const stored = localStorage.getItem('tt_tenants');
  if (!stored) {
    localStorage.setItem('tt_tenants', JSON.stringify(DEFAULT_TENANTS));
    return DEFAULT_TENANTS;
  }
  return JSON.parse(stored);
}

export function saveTenants(tenants: Tenant[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tt_tenants', JSON.stringify(tenants));
  }
}

export function getServices(tenantId?: string): Service[] {
  if (typeof window === 'undefined') {
    return tenantId ? DEFAULT_SERVICES.filter(s => s.tenantId === tenantId) : DEFAULT_SERVICES;
  }
  const stored = localStorage.getItem('tt_services');
  let services = DEFAULT_SERVICES;
  if (!stored) {
    localStorage.setItem('tt_services', JSON.stringify(DEFAULT_SERVICES));
  } else {
    services = JSON.parse(stored);
  }
  return tenantId ? services.filter(s => s.tenantId === tenantId) : services;
}

export function saveServices(services: Service[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tt_services', JSON.stringify(services));
  }
}

export function getBarbers(tenantId: string): Barber[] {
  return DEFAULT_BARBERS[tenantId] || [];
}

export function getAppointments(tenantId?: string): Appointment[] {
  if (typeof window === 'undefined') {
    return tenantId ? DEFAULT_APPOINTMENTS.filter(a => a.tenantId === tenantId) : DEFAULT_APPOINTMENTS;
  }
  const stored = localStorage.getItem('tt_appointments');
  let appointments = DEFAULT_APPOINTMENTS;
  if (!stored) {
    localStorage.setItem('tt_appointments', JSON.stringify(DEFAULT_APPOINTMENTS));
  } else {
    appointments = JSON.parse(stored);
  }
  return tenantId ? appointments.filter(a => a.tenantId === tenantId) : appointments;
}

export function saveAppointments(appointments: Appointment[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tt_appointments', JSON.stringify(appointments));
  }
}

export function getCurrentUser() {
  if (typeof window === 'undefined') {
    return { name: 'Pawan Bhayde', email: 'pawanbhayde721@gmail.com', role: 'customer' };
  }
  const stored = localStorage.getItem('tt_current_user');
  if (!stored) {
    const user = { name: 'Pawan Bhayde', email: 'pawanbhayde721@gmail.com', role: 'customer' };
    localStorage.setItem('tt_current_user', JSON.stringify(user));
    return user;
  }
  return JSON.parse(stored);
}

export function setCurrentUser(user: { name: string; email: string; role: string }) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tt_current_user', JSON.stringify(user));
  }
}
