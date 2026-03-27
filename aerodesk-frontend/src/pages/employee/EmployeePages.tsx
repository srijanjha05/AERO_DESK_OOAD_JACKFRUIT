import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Search, TicketCheck, UserSearch, Wallet } from 'lucide-react';
import { api } from '@/lib/api';
import { PortalShell } from '@/components/layout/PortalShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Booking, CheckIn, Refund, User } from '@/lib/types';

const nav = [
  { to: '/employee/dashboard', label: 'Dashboard' },
  { to: '/employee/passengers', label: 'Passengers' },
  { to: '/employee/book', label: 'Assist Booking' },
  { to: '/employee/checkin', label: 'Counter Check-In' },
  { to: '/employee/refunds', label: 'Refunds' },
];

export function EmployeeDashboardPage() {
  return (
    <PortalShell title="Employee Dashboard" subtitle="Front desk operations" items={nav} mode="sidebar">
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Passenger lookup" value="CRM" note="Search by name or email and inspect booking history." icon={<UserSearch className="h-5 w-5 text-cyan-200" />} />
        <Panel title="Counter check-in" value="Live" note="Use booking ID to issue check-in and boarding pass." icon={<TicketCheck className="h-5 w-5 text-cyan-200" />} />
        <Panel title="Refund requests" value="Staff" note="Create refund request after cancellation workflow." icon={<Wallet className="h-5 w-5 text-cyan-200" />} />
      </div>
    </PortalShell>
  );
}

export function EmployeePassengersPage() {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const results = useQuery({
    queryKey: ['employee-passengers', searchTerm],
    queryFn: async () => (await api.get<User[]>(`/admin/passengers/search?q=${searchTerm}`)).data,
    enabled: !!searchTerm,
  });

  return (
    <PortalShell title="Passenger Search" subtitle="Front desk operations" items={nav} mode="sidebar">
      <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
        <CardContent className="p-6">
          <form className="flex gap-3" onSubmit={(event) => { event.preventDefault(); setSearchTerm(query); }}>
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search passenger by name or email" className="border-white/12 bg-white/5 text-white" />
            <Button><Search className="mr-2 h-4 w-4" />Search</Button>
          </form>
        </CardContent>
      </Card>
      <div className="mt-6 grid gap-4">
        {(results.data ?? []).map((passenger) => (
          <Card key={passenger.id} className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <div className="text-xl font-semibold">{passenger.name}</div>
                <div className="mt-2 text-sm text-white/65">{passenger.email}</div>
              </div>
              <a href={`/employee/passengers/${passenger.id}`} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">Open profile</a>
            </CardContent>
          </Card>
        ))}
      </div>
    </PortalShell>
  );
}

export function EmployeePassengerProfilePage() {
  return (
    <PortalShell title="Passenger Profile" subtitle="Front desk operations" items={nav} mode="sidebar">
      <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
        <CardContent className="p-8 text-white/70">
          Use the passenger search to open a profile, then use booking ID driven actions from the booking desk or refund desk. The backend currently exposes detail lookup but not a dedicated booking-history endpoint.
        </CardContent>
      </Card>
    </PortalShell>
  );
}

export function EmployeeBookingAssistPage() {
  const [form, setForm] = useState({
    flightId: '', passengerId: '', seatIds: '',
    travelerName: '', travelerEmail: '', travelerPhone: '',
    travelerGender: 'MALE', travelerDateOfBirth: '',
  });

  const bookingMutation = useMutation({
    mutationFn: async () => (await api.post<Booking>('/admin/bookings', {
      flightId: Number(form.flightId),
      passengerId: Number(form.passengerId),
      seatIds: form.seatIds.split(',').map((value) => Number(value.trim())).filter(Boolean),
      travelerName: form.travelerName,
      travelerEmail: form.travelerEmail,
      travelerPhone: form.travelerPhone,
      travelerGender: form.travelerGender,
      travelerDateOfBirth: form.travelerDateOfBirth,
    })).data,
  });

  return (
    <PortalShell title="Assisted Booking" subtitle="Front desk operations" items={nav} mode="sidebar">
      <Card className="max-w-4xl border-white/10 bg-white/8 text-white backdrop-blur-xl">
        <CardHeader><CardTitle>Create booking for passenger</CardTitle></CardHeader>
        <CardContent className="grid gap-4 p-6 md:grid-cols-2">
          <Field label="Passenger ID"><Input value={form.passengerId} onChange={(event) => setForm({ ...form, passengerId: event.target.value })} className="border-white/12 bg-white/5" /></Field>
          <Field label="Flight ID"><Input value={form.flightId} onChange={(event) => setForm({ ...form, flightId: event.target.value })} className="border-white/12 bg-white/5" /></Field>
          <Field label="Seat IDs (comma-separated)"><Input value={form.seatIds} onChange={(event) => setForm({ ...form, seatIds: event.target.value })} className="border-white/12 bg-white/5" /></Field>
          <div className="hidden md:block" />
          <Field label="Traveler Name"><Input value={form.travelerName} onChange={(event) => setForm({ ...form, travelerName: event.target.value })} className="border-white/12 bg-white/5" /></Field>
          <Field label="Traveler Email"><Input type="email" value={form.travelerEmail} onChange={(event) => setForm({ ...form, travelerEmail: event.target.value })} className="border-white/12 bg-white/5" /></Field>
          <Field label="Traveler Phone"><Input value={form.travelerPhone} onChange={(event) => setForm({ ...form, travelerPhone: event.target.value })} className="border-white/12 bg-white/5" /></Field>
          <Field label="Gender (MALE/FEMALE)"><Input value={form.travelerGender} onChange={(event) => setForm({ ...form, travelerGender: event.target.value })} className="border-white/12 bg-white/5" /></Field>
          <Field label="Date of Birth"><Input type="date" value={form.travelerDateOfBirth} onChange={(event) => setForm({ ...form, travelerDateOfBirth: event.target.value })} className="border-white/12 bg-white/5" /></Field>
          
          <div className="md:col-span-2 flex items-end mt-4"><Button className="w-full" onClick={() => bookingMutation.mutate()}>Create booking</Button></div>
          {bookingMutation.isError ? <div className="md:col-span-2 text-red-400 font-semibold p-4 bg-red-400/10 rounded-2xl border border-red-400/20">{(bookingMutation.error as any)?.response?.data?.error || 'Error creating booking. Verify inputs.'}</div> : null}
          {bookingMutation.data ? <div className="md:col-span-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">Booking created. ID {bookingMutation.data.id}, PNR {bookingMutation.data.pnrCode}</div> : null}
        </CardContent>
      </Card>
    </PortalShell>
  );
}

export function EmployeeCheckInPage() {
  const [bookingId, setBookingId] = useState('');
  const mutation = useMutation({
    mutationFn: async () => (await api.post<CheckIn>(`/admin/checkin/${bookingId}`)).data,
  });

  return (
    <PortalShell title="Counter Check-In" subtitle="Front desk operations" items={nav} mode="sidebar">
      <Card className="max-w-2xl border-white/10 bg-white/8 text-white backdrop-blur-xl">
        <CardContent className="space-y-4 p-6">
          <Field label="Booking ID"><Input value={bookingId} onChange={(event) => setBookingId(event.target.value)} className="border-white/12 bg-white/5 text-white" /></Field>
          <Button onClick={() => mutation.mutate()}>Issue counter check-in</Button>
          {mutation.data ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">Check-in created. Check-in ID {mutation.data.id}</div> : null}
        </CardContent>
      </Card>
    </PortalShell>
  );
}

export function EmployeeRefundsPage() {
  const [bookingId, setBookingId] = useState('');
  const [reason, setReason] = useState('Manual refund request from counter');
  const mutation = useMutation({
    mutationFn: async () => (await api.post<Refund>('/admin/refunds', {
      bookingId: Number(bookingId),
      reason,
    })).data,
  });

  return (
    <PortalShell title="Refund Desk" subtitle="Front desk operations" items={nav} mode="sidebar">
      <Card className="max-w-2xl border-white/10 bg-white/8 text-white backdrop-blur-xl">
        <CardContent className="space-y-4 p-6">
          <Field label="Cancelled booking ID"><Input value={bookingId} onChange={(event) => setBookingId(event.target.value)} className="border-white/12 bg-white/5 text-white" /></Field>
          <Field label="Reason"><Input value={reason} onChange={(event) => setReason(event.target.value)} className="border-white/12 bg-white/5 text-white" /></Field>
          <Button onClick={() => mutation.mutate()}>Submit refund request</Button>
          {mutation.data ? <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">Refund request created for amount ₹{mutation.data.refundAmount}</div> : null}
        </CardContent>
      </Card>
    </PortalShell>
  );
}

function Panel({ title, value, note, icon }: { title: string; value: string; note: string; icon: React.ReactNode }) {
  return (
    <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">{title}</div>
          {icon}
        </div>
        <div className="mt-4 text-5xl font-semibold">{value}</div>
        <div className="mt-2 text-sm text-white/65">{note}</div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-white/72">{label}</Label>
      {children}
    </div>
  );
}
