import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Search, TicketCheck, UserSearch, Wallet } from 'lucide-react';
import { api } from '@/lib/api';
import { PortalShell } from '@/components/layout/PortalShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Booking, CheckIn, Flight, Refund, Seat, User } from '@/lib/types';

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
        <Panel title="Counter check-in" value="Live" note="Use PNR to look up booking, then issue check-in and boarding pass." icon={<TicketCheck className="h-5 w-5 text-cyan-200" />} />
        <Panel title="Refund requests" value="Staff" note="Look up cancelled booking by PNR and submit refund request." icon={<Wallet className="h-5 w-5 text-cyan-200" />} />
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
        {results.isFetched && results.data?.length === 0 && (
          <div className="text-center text-white/50 py-8">No passengers found for "{searchTerm}"</div>
        )}
      </div>
    </PortalShell>
  );
}

export function EmployeePassengerProfilePage() {
  const { id } = useParams<{ id: string }>();

  const passengerQuery = useQuery({
    queryKey: ['emp-passenger', id],
    queryFn: async () => (await api.get<User>(`/admin/passengers/${id}`)).data,
    enabled: !!id,
  });

  const bookingsQuery = useQuery({
    queryKey: ['emp-passenger-bookings', id],
    queryFn: async () => (await api.get<Booking[]>(`/admin/passengers/${id}/bookings`)).data,
    enabled: !!id,
  });

  const passenger = passengerQuery.data;
  const bookings = bookingsQuery.data ?? [];

  return (
    <PortalShell title="Passenger Profile" subtitle="Front desk operations" items={nav} mode="sidebar">
      {passenger ? (
        <div className="space-y-6">
          <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
            <CardHeader><CardTitle>Passenger Details</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3 p-6">
              <InfoItem label="Name" value={passenger.name} />
              <InfoItem label="Email" value={passenger.email} />
              <InfoItem label="Phone" value={passenger.phone ?? '—'} />
              <InfoItem label="Nationality" value={passenger.nationality ?? '—'} />
              <InfoItem label="Passport" value={passenger.passportNumber ?? '—'} />
              <InfoItem label="Date of Birth" value={passenger.dateOfBirth ?? '—'} />
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Booking History <span className="text-white/50 text-base font-normal">({bookings.length} bookings)</span></CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              {bookings.length === 0 ? (
                <div className="p-8 text-center text-white/50">No bookings found for this passenger.</div>
              ) : (
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-white/10 text-white/60">
                    <tr>
                      <th className="px-6 py-4">PNR</th>
                      <th className="px-6 py-4">Flight</th>
                      <th className="px-6 py-4">Route</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id} className="border-b border-white/6">
                        <td className="px-6 py-4 font-mono font-semibold text-cyan-300">{b.pnrCode}</td>
                        <td className="px-6 py-4">{b.flight?.flightNumber ?? '—'}</td>
                        <td className="px-6 py-4">
                          {b.flight ? `${b.flight.originAirport.code} → ${b.flight.destinationAirport.code}` : '—'}
                        </td>
                        <td className="px-6 py-4">{b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs ${
                            b.status === 'CONFIRMED' ? 'bg-emerald-400/10 text-emerald-400' :
                            b.status === 'CANCELLED' ? 'bg-red-400/10 text-red-400' :
                            'bg-yellow-400/10 text-yellow-400'
                          }`}>{b.status}</span>
                        </td>
                        <td className="px-6 py-4">₹{b.totalAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
          <CardContent className="p-8 text-white/70">
            {passengerQuery.isLoading ? 'Loading passenger…' : 'Passenger not found.'}
          </CardContent>
        </Card>
      )}
    </PortalShell>
  );
}

export function EmployeeBookingAssistPage() {
  // Step 1: Passenger
  const [passengerQuery, setPassengerQuery] = useState('');
  const [passengerSearch, setPassengerSearch] = useState('');
  const [selectedPassenger, setSelectedPassenger] = useState<User | null>(null);

  // Step 2: Flight
  const [flightFrom, setFlightFrom] = useState('DEL');
  const [flightTo, setFlightTo] = useState('BOM');
  const [flightDate, setFlightDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10);
  });
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  // Step 3: Seats
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);

  // Step 4: Traveler
  const [traveler, setTraveler] = useState({
    name: '', email: '', phone: '', gender: 'MALE', dateOfBirth: '',
  });

  const passengersQuery = useQuery({
    queryKey: ['emp-assist-passengers', passengerSearch],
    queryFn: async () => (await api.get<User[]>(`/admin/passengers/search?q=${passengerSearch}`)).data,
    enabled: passengerSearch.length > 1,
  });

  const seatsQuery = useQuery({
    queryKey: ['emp-assist-seats', selectedFlight?.id],
    queryFn: async () => (await api.get<Seat[]>(`/flights/${selectedFlight!.id}/seats`)).data,
    enabled: !!selectedFlight,
  });

  const loadFlights = async () => {
    const res = await api.get<Flight[]>(`/flights/search?from=${flightFrom}&to=${flightTo}&date=${flightDate}`);
    setFlights(res.data);
    setSelectedFlight(null);
    setSelectedSeatIds([]);
  };

  const bookingMutation = useMutation({
    mutationFn: async () => (await api.post<Booking>('/admin/bookings', {
      flightId: selectedFlight!.id,
      passengerId: selectedPassenger!.id,
      seatIds: selectedSeatIds,
      travelerName: traveler.name,
      travelerEmail: traveler.email,
      travelerPhone: traveler.phone,
      travelerGender: traveler.gender,
      travelerDateOfBirth: traveler.dateOfBirth,
    })).data,
  });

  const toggleSeat = (seatId: number) => {
    setSelectedSeatIds((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
    );
  };

  const seats = seatsQuery.data ?? [];
  const seatsByClass = {
    FIRST: seats.filter((s) => s.classType === 'FIRST'),
    BUSINESS: seats.filter((s) => s.classType === 'BUSINESS'),
    ECONOMY: seats.filter((s) => s.classType === 'ECONOMY'),
  };

  return (
    <PortalShell title="Assisted Booking" subtitle="Front desk operations" items={nav} mode="sidebar">
      <div className="space-y-6 max-w-5xl">

        {/* Step 1: Passenger */}
        <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
          <CardHeader><CardTitle className="flex items-center gap-3"><StepBadge n={1} />Search Passenger</CardTitle></CardHeader>
          <CardContent className="space-y-4 p-6">
            {selectedPassenger ? (
              <div className="flex items-center justify-between rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                <div>
                  <div className="font-semibold">{selectedPassenger.name}</div>
                  <div className="text-sm text-white/65">{selectedPassenger.email}</div>
                </div>
                <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10 text-xs" onClick={() => setSelectedPassenger(null)}>Change</Button>
              </div>
            ) : (
              <>
                <div className="flex gap-3">
                  <Input
                    value={passengerQuery}
                    onChange={(e) => setPassengerQuery(e.target.value)}
                    placeholder="Name or email"
                    className="border-white/12 bg-white/5 text-white"
                  />
                  <Button onClick={() => setPassengerSearch(passengerQuery)}><Search className="h-4 w-4" /></Button>
                </div>
                <div className="space-y-2">
                  {(passengersQuery.data ?? []).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPassenger(p)}
                      className="w-full text-left rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition-colors"
                    >
                      <div className="font-medium">{p.name}</div>
                      <div className="text-sm text-white/55">{p.email}</div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Flight */}
        <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
          <CardHeader><CardTitle className="flex items-center gap-3"><StepBadge n={2} />Select Flight</CardTitle></CardHeader>
          <CardContent className="space-y-4 p-6">
            {selectedFlight ? (
              <div className="flex items-center justify-between rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                <div>
                  <div className="font-semibold">{selectedFlight.flightNumber} — {selectedFlight.originAirport.code} → {selectedFlight.destinationAirport.code}</div>
                  <div className="text-sm text-white/65">{new Date(selectedFlight.departureTime).toLocaleString()} · ₹{selectedFlight.price}</div>
                </div>
                <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10 text-xs" onClick={() => { setSelectedFlight(null); setSelectedSeatIds([]); }}>Change</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-3">
                  <Field label="From"><Input value={flightFrom} onChange={(e) => setFlightFrom(e.target.value.toUpperCase())} className="border-white/12 bg-white/5 text-white" /></Field>
                  <Field label="To"><Input value={flightTo} onChange={(e) => setFlightTo(e.target.value.toUpperCase())} className="border-white/12 bg-white/5 text-white" /></Field>
                  <Field label="Date"><Input type="date" value={flightDate} onChange={(e) => setFlightDate(e.target.value)} className="border-white/12 bg-white/5 text-white" /></Field>
                  <div className="flex items-end"><Button className="w-full" onClick={loadFlights}>Search</Button></div>
                </div>
                <div className="space-y-2">
                  {flights.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFlight(f)}
                      className="w-full text-left rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition-colors"
                    >
                      <div className="font-medium">{f.flightNumber} · {f.originAirport.code} → {f.destinationAirport.code}</div>
                      <div className="text-sm text-white/55">{new Date(f.departureTime).toLocaleString()} · ₹{f.price} · {f.status}</div>
                    </button>
                  ))}
                  {flights.length === 0 && <div className="text-white/40 text-sm">Search for flights above.</div>}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Step 3: Seats */}
        {selectedFlight && (
          <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <StepBadge n={3} />Select Seats
                {selectedSeatIds.length > 0 && <span className="text-sm font-normal text-cyan-300">{selectedSeatIds.length} selected</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {seatsQuery.isLoading && <div className="text-white/50">Loading seats…</div>}
              {(['FIRST', 'BUSINESS', 'ECONOMY'] as const).map((cls) => (
                seatsByClass[cls].length > 0 && (
                  <div key={cls}>
                    <div className="mb-2 text-xs uppercase tracking-widest text-white/50">{cls}</div>
                    <div className="flex flex-wrap gap-2">
                      {seatsByClass[cls].map((seat) => {
                        const selected = selectedSeatIds.includes(seat.id);
                        const unavailable = !seat.isAvailable;
                        return (
                          <button
                            key={seat.id}
                            disabled={unavailable}
                            onClick={() => toggleSeat(seat.id)}
                            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors border ${
                              unavailable
                                ? 'border-white/5 bg-white/5 text-white/20 cursor-not-allowed'
                                : selected
                                  ? 'border-cyan-400 bg-cyan-400/20 text-cyan-200'
                                  : 'border-white/15 bg-white/5 text-white hover:bg-white/10'
                            }`}
                          >
                            {seat.seatNumber}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )
              ))}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Traveler Details */}
        <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
          <CardHeader><CardTitle className="flex items-center gap-3"><StepBadge n={4} />Traveler Details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 p-6">
            <Field label="Full Name"><Input value={traveler.name} onChange={(e) => setTraveler({ ...traveler, name: e.target.value })} className="border-white/12 bg-white/5 text-white" /></Field>
            <Field label="Email"><Input type="email" value={traveler.email} onChange={(e) => setTraveler({ ...traveler, email: e.target.value })} className="border-white/12 bg-white/5 text-white" /></Field>
            <Field label="Phone"><Input value={traveler.phone} onChange={(e) => setTraveler({ ...traveler, phone: e.target.value })} className="border-white/12 bg-white/5 text-white" /></Field>
            <Field label="Gender">
              <select
                value={traveler.gender}
                onChange={(e) => setTraveler({ ...traveler, gender: e.target.value })}
                className="w-full rounded-md border border-white/12 bg-white/5 px-3 py-2 text-white text-sm"
              >
                <option value="MALE" className="bg-slate-900">Male</option>
                <option value="FEMALE" className="bg-slate-900">Female</option>
                <option value="OTHER" className="bg-slate-900">Other</option>
              </select>
            </Field>
            <Field label="Date of Birth"><Input type="date" value={traveler.dateOfBirth} onChange={(e) => setTraveler({ ...traveler, dateOfBirth: e.target.value })} className="border-white/12 bg-white/5 text-white" /></Field>
            <div className="md:col-span-2 pt-2">
              <Button
                className="w-full"
                disabled={!selectedPassenger || !selectedFlight || selectedSeatIds.length === 0 || !traveler.name || bookingMutation.isPending}
                onClick={() => bookingMutation.mutate()}
              >
                {bookingMutation.isPending ? 'Creating booking…' : 'Create Booking'}
              </Button>
            </div>
            {bookingMutation.isError && (
              <div className="md:col-span-2 text-red-400 font-semibold p-4 bg-red-400/10 rounded-2xl border border-red-400/20">
                {(bookingMutation.error as any)?.response?.data?.error || 'Error creating booking.'}
              </div>
            )}
            {bookingMutation.data && (
              <div className="md:col-span-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                Booking created. PNR <span className="font-mono font-bold text-cyan-300">{bookingMutation.data.pnrCode}</span> · ID {bookingMutation.data.id} · ₹{bookingMutation.data.totalAmount}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}

export function EmployeeCheckInPage() {
  const [pnr, setPnr] = useState('');
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null);

  const lookupMutation = useMutation({
    mutationFn: async () => (await api.get<Booking>(`/admin/bookings/pnr/${pnr.trim().toUpperCase()}`)).data,
    onSuccess: (data) => setFoundBooking(data),
  });

  const checkInMutation = useMutation({
    mutationFn: async () => (await api.post<CheckIn>(`/admin/checkin/${foundBooking!.id}`)).data,
  });

  return (
    <PortalShell title="Counter Check-In" subtitle="Front desk operations" items={nav} mode="sidebar">
      <div className="max-w-2xl space-y-6">
        <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
          <CardHeader><CardTitle>PNR Lookup</CardTitle></CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="flex gap-3">
              <Input
                value={pnr}
                onChange={(e) => { setPnr(e.target.value); setFoundBooking(null); checkInMutation.reset(); }}
                placeholder="Enter 6-character PNR code"
                className="border-white/12 bg-white/5 text-white font-mono uppercase"
                maxLength={6}
              />
              <Button onClick={() => lookupMutation.mutate()} disabled={pnr.trim().length < 4 || lookupMutation.isPending}>
                {lookupMutation.isPending ? 'Looking up…' : 'Lookup'}
              </Button>
            </div>
            {lookupMutation.isError && (
              <div className="text-red-400 text-sm p-3 bg-red-400/10 rounded-xl border border-red-400/20">
                No booking found for PNR "{pnr}". Please check and try again.
              </div>
            )}
          </CardContent>
        </Card>

        {foundBooking && (
          <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
            <CardHeader><CardTitle>Booking Details</CardTitle></CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <InfoItem label="PNR" value={<span className="font-mono text-cyan-300">{foundBooking.pnrCode}</span>} />
                <InfoItem label="Status" value={
                  <span className={`rounded-full px-3 py-1 text-xs ${
                    foundBooking.status === 'CONFIRMED' ? 'bg-emerald-400/10 text-emerald-400' :
                    foundBooking.status === 'CANCELLED' ? 'bg-red-400/10 text-red-400' :
                    'bg-yellow-400/10 text-yellow-400'
                  }`}>{foundBooking.status}</span>
                } />
                <InfoItem label="Traveler" value={foundBooking.travelerName} />
                <InfoItem label="Flight" value={foundBooking.flight ? `${foundBooking.flight.flightNumber} · ${foundBooking.flight.originAirport.code} → ${foundBooking.flight.destinationAirport.code}` : '—'} />
                <InfoItem label="Departure" value={foundBooking.flight ? new Date(foundBooking.flight.departureTime).toLocaleString() : '—'} />
                <InfoItem label="Seats" value={foundBooking.seats?.map((s) => s.seatNumber).join(', ') || '—'} />
              </div>

              {foundBooking.status === 'CONFIRMED' ? (
                <>
                  <Button
                    className="w-full mt-2"
                    disabled={checkInMutation.isPending || checkInMutation.isSuccess}
                    onClick={() => checkInMutation.mutate()}
                  >
                    {checkInMutation.isPending ? 'Issuing check-in…' : 'Issue Counter Check-In'}
                  </Button>
                  {checkInMutation.data && (
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                      Check-in issued. Check-in ID: <strong>{checkInMutation.data.id}</strong>. Boarding pass generated.
                    </div>
                  )}
                  {checkInMutation.isError && (
                    <div className="text-red-400 text-sm p-3 bg-red-400/10 rounded-xl border border-red-400/20">
                      {(checkInMutation.error as any)?.response?.data?.error || 'Failed to issue check-in.'}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-yellow-400 text-sm p-3 bg-yellow-400/10 rounded-xl border border-yellow-400/20">
                  Check-in is only available for CONFIRMED bookings. This booking is {foundBooking.status}.
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PortalShell>
  );
}

export function EmployeeRefundsPage() {
  const [pnr, setPnr] = useState('');
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null);
  const [reason, setReason] = useState('Manual refund request from counter');

  const lookupMutation = useMutation({
    mutationFn: async () => (await api.get<Booking>(`/admin/bookings/pnr/${pnr.trim().toUpperCase()}`)).data,
    onSuccess: (data) => setFoundBooking(data),
  });

  const refundMutation = useMutation({
    mutationFn: async () => (await api.post<Refund>('/admin/refunds', {
      bookingId: foundBooking!.id,
      reason,
    })).data,
  });

  return (
    <PortalShell title="Refund Desk" subtitle="Front desk operations" items={nav} mode="sidebar">
      <div className="max-w-2xl space-y-6">
        <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
          <CardHeader><CardTitle>Find Booking by PNR</CardTitle></CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="flex gap-3">
              <Input
                value={pnr}
                onChange={(e) => { setPnr(e.target.value); setFoundBooking(null); refundMutation.reset(); }}
                placeholder="6-character PNR code"
                className="border-white/12 bg-white/5 text-white font-mono uppercase"
                maxLength={6}
              />
              <Button onClick={() => lookupMutation.mutate()} disabled={pnr.trim().length < 4 || lookupMutation.isPending}>
                {lookupMutation.isPending ? 'Looking up…' : 'Find'}
              </Button>
            </div>
            {lookupMutation.isError && (
              <div className="text-red-400 text-sm p-3 bg-red-400/10 rounded-xl border border-red-400/20">
                No booking found for PNR "{pnr}".
              </div>
            )}
          </CardContent>
        </Card>

        {foundBooking && (
          <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
            <CardHeader><CardTitle>Booking Details</CardTitle></CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <InfoItem label="PNR" value={<span className="font-mono text-cyan-300">{foundBooking.pnrCode}</span>} />
                <InfoItem label="Status" value={
                  <span className={`rounded-full px-3 py-1 text-xs ${
                    foundBooking.status === 'CONFIRMED' ? 'bg-emerald-400/10 text-emerald-400' :
                    foundBooking.status === 'CANCELLED' ? 'bg-red-400/10 text-red-400' :
                    'bg-yellow-400/10 text-yellow-400'
                  }`}>{foundBooking.status}</span>
                } />
                <InfoItem label="Traveler" value={foundBooking.travelerName} />
                <InfoItem label="Amount" value={`₹${foundBooking.totalAmount}`} />
              </div>

              {foundBooking.status === 'CANCELLED' ? (
                <>
                  <Field label="Reason for refund">
                    <Input value={reason} onChange={(e) => setReason(e.target.value)} className="border-white/12 bg-white/5 text-white" />
                  </Field>
                  <Button
                    className="w-full"
                    disabled={refundMutation.isPending || refundMutation.isSuccess}
                    onClick={() => refundMutation.mutate()}
                  >
                    {refundMutation.isPending ? 'Submitting…' : 'Submit Refund Request'}
                  </Button>
                  {refundMutation.data && (
                    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                      Refund request created. Amount: <strong>₹{refundMutation.data.refundAmount}</strong>. Pending manager approval.
                    </div>
                  )}
                  {refundMutation.isError && (
                    <div className="text-red-400 text-sm p-3 bg-red-400/10 rounded-xl border border-red-400/20">
                      {(refundMutation.error as any)?.response?.data?.error || 'Failed to create refund request.'}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-yellow-400 text-sm p-3 bg-yellow-400/10 rounded-xl border border-yellow-400/20">
                  Refunds can only be created for CANCELLED bookings. This booking is {foundBooking.status}.
                  {foundBooking.status === 'CONFIRMED' && ' Cancel the booking first via the passenger portal.'}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PortalShell>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400/20 text-sm font-bold text-cyan-300 border border-cyan-400/30">
      {n}
    </span>
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-white/45 mb-1">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
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
