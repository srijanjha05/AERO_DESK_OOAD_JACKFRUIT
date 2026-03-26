export type Role = 'PASSENGER' | 'EMPLOYEE' | 'AIRPORT_MANAGER' | 'ADMIN';

export interface Airport {
  id: number;
  name: string;
  code: string;
  city: string;
}

export interface Aircraft {
  id: number;
  model: string;
  registrationNumber: string;
  totalSeats: number;
}

export interface Seat {
  id: number;
  seatNumber: string;
  classType: 'ECONOMY' | 'BUSINESS' | 'FIRST';
  isAvailable: boolean;
}

export interface Flight {
  id: number;
  flightNumber: string;
  originAirport: Airport;
  destinationAirport: Airport;
  departureTime: string;
  arrivalTime: string;
  status: 'SCHEDULED' | 'DELAYED' | 'CANCELLED' | 'BOARDING' | 'DEPARTED' | 'ARRIVED';
  price: number;
  aircraft: Aircraft;
}

export interface Booking {
  id: number;
  pnrCode: string;
  passenger: User;
  flight: Flight;
  bookingDate: string;
  status: 'PAYMENT_PENDING' | 'CONFIRMED' | 'CANCELLED';
  totalAmount: number;
  seats: Seat[];
  travelerName: string;
  travelerDateOfBirth: string;
  travelerGender: string;
  travelerEmail: string;
  travelerPhone: string;
  travelerNationality?: string;
  travelerPassportNumber?: string;
}

export interface Payment {
  id: number;
  booking: Booking;
  amount: number;
  paymentMethod: 'CARD' | 'UPI' | 'CASH';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  transactionId: string;
  paidAt?: string;
}

export interface Refund {
  id: number;
  payment: Payment;
  refundAmount: number;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'PROCESSED';
  requestDate: string;
  reason: string;
}

export interface CheckIn {
  id: number;
  booking: Booking;
  checkInTime: string;
  method: 'WEB' | 'COUNTER';
}

export interface BoardingPass {
  id: number;
  checkIn: CheckIn;
  gate: string;
  boardingTime: string;
  barcodeData: string;
}

export interface Notification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  ipAddress: string;
  user: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  nationality?: string;
  passportNumber?: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface AuthResponse {
  token: string | null;
  message: string;
  userId: number;
  role: Role;
  requiresOtp: boolean;
}

export interface BookingDraft {
  flight?: Flight;
  selectedSeats: Seat[];
  bookingId?: number;
  totalAmount?: number;
  pnrCode?: string;
  passengerId?: number;
  travelerName?: string;
  travelerDateOfBirth?: string;
  travelerGender?: string;
  travelerEmail?: string;
  travelerPhone?: string;
  travelerNationality?: string;
  travelerPassportNumber?: string;
}
