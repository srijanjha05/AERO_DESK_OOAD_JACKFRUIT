import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import Landing from '@/pages/public/Landing';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import { useAuthStore } from '@/store/useAuthStore';
import {
  BoardingPassPage,
  BookingConfirmPage,
  BookingDetailPage,
  BookingPaymentPage,
  BookingSuccessPage,
  CheckInPage,
  FlightSearchPage,
  MyBookingsPage,
  NotificationsPage,
  PassengerHomePage,
  SeatSelectionPage,
} from '@/pages/passenger/PassengerPages';
import {
  EmployeeBookingAssistPage,
  EmployeeCheckInPage,
  EmployeeDashboardPage,
  EmployeePassengerProfilePage,
  EmployeePassengersPage,
  EmployeeRefundsPage,
} from '@/pages/employee/EmployeePages';
import {
  ManagerAircraftPage,
  ManagerAirportsPage,
  ManagerDashboardPage,
  ManagerFlightCreatePage,
  ManagerFlightsPage,
  ManagerNotificationsPage,
  ManagerRefundsPage,
} from '@/pages/manager/ManagerPages';
import {
  AdminAuditLogsPage,
  AdminDashboardPage,
  AdminReportsPage,
  AdminRolesPage,
  AdminUsersPage,
} from '@/pages/admin/AdminPages';
import type { Role } from '@/lib/types';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/employee/login" element={<Login />} />
      <Route path="/manager/login" element={<Login />} />
      <Route path="/admin/login" element={<Login />} />

      <Route path="/search" element={<ProtectedRoute allowed={['PASSENGER']}><FlightSearchPage /></ProtectedRoute>} />
      <Route path="/flights/:id/seats" element={<ProtectedRoute allowed={['PASSENGER']}><SeatSelectionPage /></ProtectedRoute>} />
      <Route path="/booking/confirm" element={<ProtectedRoute allowed={['PASSENGER']}><BookingConfirmPage /></ProtectedRoute>} />
      <Route path="/booking/payment" element={<ProtectedRoute allowed={['PASSENGER']}><BookingPaymentPage /></ProtectedRoute>} />
      <Route path="/booking/success" element={<ProtectedRoute allowed={['PASSENGER']}><BookingSuccessPage /></ProtectedRoute>} />
      <Route path="/my-bookings" element={<ProtectedRoute allowed={['PASSENGER']}><MyBookingsPage /></ProtectedRoute>} />
      <Route path="/my-bookings/:id" element={<ProtectedRoute allowed={['PASSENGER']}><BookingDetailPage /></ProtectedRoute>} />
      <Route path="/checkin/:bookingId" element={<ProtectedRoute allowed={['PASSENGER']}><CheckInPage /></ProtectedRoute>} />
      <Route path="/boarding-pass/:id" element={<ProtectedRoute allowed={['PASSENGER', 'EMPLOYEE', 'AIRPORT_MANAGER', 'ADMIN']}><BoardingPassPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute allowed={['PASSENGER', 'EMPLOYEE', 'AIRPORT_MANAGER', 'ADMIN']}><NotificationsPage /></ProtectedRoute>} />
      <Route path="/passenger/dashboard" element={<ProtectedRoute allowed={['PASSENGER']}><PassengerHomePage /></ProtectedRoute>} />

      <Route path="/employee/dashboard" element={<ProtectedRoute allowed={['EMPLOYEE', 'ADMIN']}><EmployeeDashboardPage /></ProtectedRoute>} />
      <Route path="/employee/passengers" element={<ProtectedRoute allowed={['EMPLOYEE', 'ADMIN']}><EmployeePassengersPage /></ProtectedRoute>} />
      <Route path="/employee/passengers/:id" element={<ProtectedRoute allowed={['EMPLOYEE', 'ADMIN']}><EmployeePassengerProfilePage /></ProtectedRoute>} />
      <Route path="/employee/book" element={<ProtectedRoute allowed={['EMPLOYEE', 'ADMIN']}><EmployeeBookingAssistPage /></ProtectedRoute>} />
      <Route path="/employee/checkin" element={<ProtectedRoute allowed={['EMPLOYEE', 'ADMIN']}><EmployeeCheckInPage /></ProtectedRoute>} />
      <Route path="/employee/refunds" element={<ProtectedRoute allowed={['EMPLOYEE', 'ADMIN']}><EmployeeRefundsPage /></ProtectedRoute>} />

      <Route path="/manager/dashboard" element={<ProtectedRoute allowed={['AIRPORT_MANAGER', 'ADMIN']}><ManagerDashboardPage /></ProtectedRoute>} />
      <Route path="/manager/flights" element={<ProtectedRoute allowed={['AIRPORT_MANAGER', 'ADMIN']}><ManagerFlightsPage /></ProtectedRoute>} />
      <Route path="/manager/flights/new" element={<ProtectedRoute allowed={['AIRPORT_MANAGER', 'ADMIN']}><ManagerFlightCreatePage /></ProtectedRoute>} />
      <Route path="/manager/flights/:id" element={<ProtectedRoute allowed={['AIRPORT_MANAGER', 'ADMIN']}><ManagerFlightsPage /></ProtectedRoute>} />
      <Route path="/manager/aircraft" element={<ProtectedRoute allowed={['AIRPORT_MANAGER', 'ADMIN']}><ManagerAircraftPage /></ProtectedRoute>} />
      <Route path="/manager/airports" element={<ProtectedRoute allowed={['AIRPORT_MANAGER', 'ADMIN']}><ManagerAirportsPage /></ProtectedRoute>} />
      <Route path="/manager/refunds" element={<ProtectedRoute allowed={['AIRPORT_MANAGER', 'ADMIN']}><ManagerRefundsPage /></ProtectedRoute>} />
      <Route path="/manager/notifications" element={<ProtectedRoute allowed={['AIRPORT_MANAGER', 'ADMIN']}><ManagerNotificationsPage /></ProtectedRoute>} />

      <Route path="/admin/dashboard" element={<ProtectedRoute allowed={['ADMIN']}><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowed={['ADMIN']}><AdminReportsPage /></ProtectedRoute>} />
      <Route path="/admin/audit-logs" element={<ProtectedRoute allowed={['ADMIN']}><AdminAuditLogsPage /></ProtectedRoute>} />
      <Route path="/admin/roles" element={<ProtectedRoute allowed={['ADMIN']}><AdminRolesPage /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowed={['ADMIN']}><AdminUsersPage /></ProtectedRoute>} />

      <Route path="*" element={<FallbackRedirect />} />
    </Routes>
  );
}

function ProtectedRoute({ children, allowed }: { children: ReactNode; allowed: Role[] }) {
  const location = useLocation();
  const { token, role } = useAuthStore();

  if (!token || !role) {
    const loginPath = location.pathname.startsWith('/employee')
      ? '/employee/login'
      : location.pathname.startsWith('/manager')
        ? '/manager/login'
        : location.pathname.startsWith('/admin')
          ? '/admin/login'
          : '/login';
    return <Navigate to={loginPath} replace />;
  }

  if (!allowed.includes(role as Role)) {
    return <Navigate to={defaultRoute(role as Role)} replace />;
  }

  return <>{children}</>;
}

function FallbackRedirect() {
  const { token, role } = useAuthStore();
  if (!token || !role) {
    return <Navigate to="/" replace />;
  }
  return <Navigate to={defaultRoute(role as Role)} replace />;
}

function defaultRoute(role: Role) {
  if (role === 'ADMIN') return '/admin/dashboard';
  if (role === 'AIRPORT_MANAGER') return '/manager/dashboard';
  if (role === 'EMPLOYEE') return '/employee/dashboard';
  return '/passenger/dashboard';
}
