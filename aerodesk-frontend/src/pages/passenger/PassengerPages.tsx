import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowRight, Bell, CheckCircle2, Clock3, CreditCard, Download, Plane, PlaneLanding, Search, Ticket, Wallet } from 'lucide-react';
import { api } from '@/lib/api';
import { getBookingDraft, setBookingDraft } from '@/lib/bookingDraft';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PortalShell } from '@/components/layout/PortalShell';
import type { BoardingPass, Booking, CheckIn, Flight, Notification, Seat } from '@/lib/types';

const passengerNav = [
  { to: '/search', label: 'Search' },
  { to: '/my-bookings', label: 'Bookings' },
  { to: '/notifications', label: 'Notifications' },
];

export function PassengerHomePage() {
  const bookingsQuery = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => (await api.get<Booking[]>('/bookings/my')).data,
  });

  const chartData = useMemo(() => {
    const bookings = bookingsQuery.data ?? [];
    return bookings.slice(0, 6).map((booking) => ({
      route: `${booking.flight.originAirport.code}-${booking.flight.destinationAirport.code}`,
      amount: booking.totalAmount,
    }));
  }, [bookingsQuery.data]);

  return (
    <PortalShell title="Passenger Portal" subtitle="Traveler workspace" items={passengerNav} mode="topbar">
      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
          <CardContent className="grid gap-8 p-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
                <Plane className="h-4 w-4" />
                Search, seat hold, payment, check-in
              </div>
              <h2 className="mt-6 text-4xl font-semibold">Your next route starts here.</h2>
              <p className="mt-4 max-w-xl text-white/68">
                AeroDesk keeps the whole trip visible from search to boarding pass with live booking state, status badges, and notification feed.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/search"><Button>Search flights</Button></Link>
                <Link to="/my-bookings"><Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">My bookings</Button></Link>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-[#091327] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-sm uppercase tracking-[0.35em] text-cyan-200/70">Recent spend</div>
                  <div className="text-2xl font-semibold">Booking value</div>
                </div>
                <Wallet className="h-5 w-5 text-cyan-200" />
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="passengerGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.7} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="route" stroke="rgba(255,255,255,0.55)" />
                    <YAxis stroke="rgba(255,255,255,0.55)" />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18 }} />
                    <Area type="monotone" dataKey="amount" stroke="#67e8f9" fill="url(#passengerGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <StatCard title="My bookings" value={String(bookingsQuery.data?.length ?? 0)} note="Across all statuses" />
          <StatCard title="Confirmed trips" value={String((bookingsQuery.data ?? []).filter((booking) => booking.status === 'CONFIRMED').length)} note="Ready for check-in" />
          <StatCard title="Pending actions" value={String((bookingsQuery.data ?? []).filter((booking) => booking.status === 'PAYMENT_PENDING').length)} note="Awaiting payment" />
        </div>
      </section>
    </PortalShell>
  );
}

export function FlightSearchPage() {
  const [from, setFrom] = useState('DEL');
  const [to, setTo] = useState('BOM');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [results, setResults] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await api.get<Flight[]>(`/flights/search?from=${from}&to=${to}&date=${date}`);
      setResults(response.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalShell title="Flight Search" subtitle="Traveler workspace" items={passengerNav} mode="topbar">
      <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
        <CardContent className="p-6">
          <form className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={onSearch}>
            <Field label="From"><Input value={from} onChange={(event) => setFrom(event.target.value.toUpperCase())} className="border-white/12 bg-white/5 text-white" /></Field>
            <Field label="To"><Input value={to} onChange={(event) => setTo(event.target.value.toUpperCase())} className="border-white/12 bg-white/5 text-white" /></Field>
            <Field label="Date"><Input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="border-white/12 bg-white/5 text-white" /></Field>
            <div className="flex items-end"><Button className="w-full lg:w-auto"><Search className="mr-2 h-4 w-4" />Search</Button></div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4">
        {loading ? <PlaceholderCard label="Searching flights..." /> : null}
        {!loading && results.length === 0 ? <PlaceholderCard label="No flights loaded yet. Search DEL to BOM or DEL to BLR with seeded dates." /> : null}
        {results.map((flight) => (
          <Card key={flight.id} className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
            <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.32em] text-cyan-200/70">{flight.flightNumber}</div>
                <div className="mt-2 flex items-center gap-3 text-3xl font-semibold">
                  <span>{flight.originAirport.code}</span>
                  <ArrowRight className="h-5 w-5 text-cyan-200" />
                  <span>{flight.destinationAirport.code}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/65">
                  <span>{new Date(flight.departureTime).toLocaleString()}</span>
                  <span>{flight.status}</span>
                  <span>{flight.aircraft?.model}</span>
                </div>
              </div>
              <div className="text-left lg:text-right">
                <div className="text-sm uppercase tracking-[0.32em] text-cyan-200/70">Starting fare</div>
                <div className="mt-2 text-3xl font-semibold">₹{flight.price}</div>
                <Button className="mt-4" onClick={() => navigate(`/flights/${flight.id}/seats`, { state: { flight } })}>
                  Select seats
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PortalShell>
  );
}

export function SeatSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [selected, setSelected] = useState<Seat[]>([]);
  const flightId = Number(id);

  const flightQuery = useQuery({
    queryKey: ['flight-seats', flightId],
    queryFn: async () => (await api.get<Seat[]>(`/flights/${flightId}/seats`)).data,
    enabled: Number.isFinite(flightId),
  });

  const flight = (location.state as { flight?: Flight } | null)?.flight ?? getBookingDraft()?.flight;
  const grouped = useMemo(() => {
    const seats = flightQuery.data ?? [];
    return ['FIRST', 'BUSINESS', 'ECONOMY'].map((classType) => ({
      classType,
      seats: seats.filter((seat) => seat.classType === classType),
    }));
  }, [flightQuery.data]);

  const totalAmount = (flight?.price ?? 0) * selected.length;

  const toggleSeat = (seat: Seat) => {
    if (!seat.isAvailable) return;
    setSelected((current) => current.some((item) => item.id === seat.id) ? current.filter((item) => item.id !== seat.id) : [...current, seat].slice(0, 6));
  };

  return (
    <PortalShell title="Seat Map" subtitle="Traveler workspace" items={passengerNav} mode="topbar">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
          <CardHeader><CardTitle>Interactive seat selection</CardTitle></CardHeader>
          <CardContent className="space-y-8">
            {grouped.map((group) => (
              <div key={group.classType}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-lg font-semibold">{group.classType}</div>
                  <div className="text-sm text-white/60">{group.seats.length} seats</div>
                </div>
                <div className="grid grid-cols-6 gap-3">
                  {group.seats.map((seat) => {
                    const isSelected = selected.some((item) => item.id === seat.id);
                    const className = !seat.isAvailable
                      ? 'bg-rose-500/25 text-rose-100 border-rose-400/30'
                      : isSelected
                        ? 'bg-blue-500 text-white border-blue-300'
                        : 'bg-emerald-500/20 text-emerald-100 border-emerald-400/30';
                    return (
                      <button
                        key={seat.id}
                        type="button"
                        className={`rounded-2xl border px-3 py-4 text-sm transition hover:scale-[1.02] ${className}`}
                        onClick={() => toggleSeat(seat)}
                      >
                        {seat.seatNumber}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
          <CardHeader><CardTitle>Selection summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Summary label="Flight" value={flight?.flightNumber ?? 'Selected route'} />
            <Summary label="Seats" value={selected.length ? selected.map((seat) => seat.seatNumber).join(', ') : 'None'} />
            <Summary label="Price" value={`₹${totalAmount || 0}`} />
            <div className="rounded-2xl border border-white/10 bg-[#091327] p-4 text-sm text-white/65">
              Green seats are available, red seats are unavailable, blue seats are selected for this booking draft.
            </div>
            <Button
              className="w-full"
              disabled={!selected.length || !flight}
              onClick={() => {
                if (!flight) return;
                setBookingDraft({ flight, selectedSeats: selected, totalAmount });
                navigate('/booking/confirm');
              }}
            >
              Continue to details
            </Button>
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}

export function BookingConfirmPage() {
  const navigate = useNavigate();
  const draft = getBookingDraft();
  const [travelerName, setTravelerName] = useState(draft?.travelerName ?? '');
  const [travelerDateOfBirth, setTravelerDateOfBirth] = useState(draft?.travelerDateOfBirth ?? '');
  const [travelerGender, setTravelerGender] = useState(draft?.travelerGender ?? '');
  const [travelerEmail, setTravelerEmail] = useState(draft?.travelerEmail ?? '');
  const [travelerPhone, setTravelerPhone] = useState(draft?.travelerPhone ?? '');
  const [travelerNationality, setTravelerNationality] = useState(draft?.travelerNationality ?? 'Indian');
  const [travelerPassportNumber, setTravelerPassportNumber] = useState(draft?.travelerPassportNumber ?? '');
  const confirmedDraft = draft ?? null;
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!confirmedDraft?.flight) throw new Error('No draft flight selected');
      return (await api.post<Booking>('/bookings', {
        flightId: confirmedDraft.flight.id,
        seatIds: confirmedDraft.selectedSeats.map((seat) => seat.id),
        travelerName,
        travelerDateOfBirth,
        travelerGender,
        travelerEmail,
        travelerPhone,
        travelerNationality,
        travelerPassportNumber,
      })).data;
    },
    onSuccess: (booking) => {
      if (!confirmedDraft) return;
      setBookingDraft({
        flight: confirmedDraft.flight,
        selectedSeats: confirmedDraft.selectedSeats,
        bookingId: booking.id,
        totalAmount: booking.totalAmount,
        pnrCode: booking.pnrCode,
        travelerName: booking.travelerName,
        travelerDateOfBirth: booking.travelerDateOfBirth,
        travelerGender: booking.travelerGender,
        travelerEmail: booking.travelerEmail,
        travelerPhone: booking.travelerPhone,
        travelerNationality: booking.travelerNationality,
        travelerPassportNumber: booking.travelerPassportNumber,
      });
      navigate('/booking/payment');
    },
  });

  if (!draft?.flight) {
    return (
      <PortalShell title="Booking Details" subtitle="Traveler workspace" items={passengerNav} mode="topbar">
        <PlaceholderCard label="No booking draft found. Start with flight search and seat selection." />
      </PortalShell>
    );
  }

  return (
    <PortalShell title="Booking Details" subtitle="Traveler workspace" items={passengerNav} mode="topbar">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
          <CardHeader><CardTitle>Trip summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Summary label="Route" value={`${draft.flight.originAirport.code} → ${draft.flight.destinationAirport.code}`} />
            <Summary label="Flight" value={draft.flight.flightNumber} />
            <Summary label="Seats" value={draft.selectedSeats.map((seat) => seat.seatNumber).join(', ')} />
            <Summary label="Departure" value={new Date(draft.flight.departureTime).toLocaleString()} />
            <Summary label="Estimated total" value={`₹${draft.totalAmount ?? draft.flight.price * draft.selectedSeats.length}`} />
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
          <CardHeader><CardTitle>Traveler details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="Traveler name"><Input value={travelerName} onChange={(event) => setTravelerName(event.target.value)} className="border-white/12 bg-white/5 text-white" /></Field>
            <Field label="Date of birth"><Input type="date" value={travelerDateOfBirth} onChange={(event) => setTravelerDateOfBirth(event.target.value)} className="border-white/12 bg-white/5 text-white" /></Field>
            <Field label="Gender"><Input value={travelerGender} onChange={(event) => setTravelerGender(event.target.value)} className="border-white/12 bg-white/5 text-white" /></Field>
            <Field label="Email"><Input type="email" value={travelerEmail} onChange={(event) => setTravelerEmail(event.target.value)} className="border-white/12 bg-white/5 text-white" /></Field>
            <Field label="Phone"><Input value={travelerPhone} onChange={(event) => setTravelerPhone(event.target.value)} className="border-white/12 bg-white/5 text-white" /></Field>
            <Field label="Nationality"><Input value={travelerNationality} onChange={(event) => setTravelerNationality(event.target.value)} className="border-white/12 bg-white/5 text-white" /></Field>
            <Field label="Passport number"><Input value={travelerPassportNumber} onChange={(event) => setTravelerPassportNumber(event.target.value)} className="border-white/12 bg-white/5 text-white" /></Field>
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">
              The backend will hold these seats for 10 minutes while payment remains pending.
            </div>
            <Button
              className="w-full"
              onClick={() => {
                setBookingDraft({
                  ...draft,
                  travelerName,
                  travelerDateOfBirth,
                  travelerGender,
                  travelerEmail,
                  travelerPhone,
                  travelerNationality,
                  travelerPassportNumber,
                });
                createMutation.mutate();
              }}
              disabled={
                createMutation.isPending
                || !travelerName
                || !travelerDateOfBirth
                || !travelerGender
                || !travelerEmail
                || !travelerPhone
              }
            >
              {createMutation.isPending ? 'Creating booking...' : 'Create booking'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}

export function BookingPaymentPage() {
  const navigate = useNavigate();
  const draft = getBookingDraft();
  const paymentMutation = useMutation({
    mutationFn: async (paymentMethod: 'CARD' | 'UPI' | 'CASH') => {
      if (!draft?.bookingId || !draft.totalAmount) throw new Error('Missing booking');
      return (await api.post(`/bookings/${draft.bookingId}/pay`, {
        paymentMethod,
        amount: draft.totalAmount,
      })).data;
    },
    onSuccess: () => navigate('/booking/success'),
  });

  return (
    <PortalShell title="Payment" subtitle="Traveler workspace" items={passengerNav} mode="topbar">
      <div className="grid gap-6 lg:grid-cols-3">
        {[
          { key: 'CARD', title: 'Card', icon: <CreditCard className="h-5 w-5 text-cyan-200" /> },
          { key: 'UPI', title: 'UPI', icon: <Wallet className="h-5 w-5 text-cyan-200" /> },
          { key: 'CASH', title: 'Cash', icon: <Ticket className="h-5 w-5 text-cyan-200" /> },
        ].map((method) => (
          <Card key={method.key} className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-xl font-semibold">{method.title}</div>
                {method.icon}
              </div>
              <div className="mt-4 text-sm text-white/65">Demo payment mode. This will mark the booking as paid and confirmed.</div>
              <Button className="mt-6 w-full" onClick={() => paymentMutation.mutate(method.key as 'CARD' | 'UPI' | 'CASH')}>
                Pay ₹{draft?.totalAmount ?? 0}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </PortalShell>
  );
}

export function BookingSuccessPage() {
  const draft = getBookingDraft();
  return (
    <PortalShell title="Booking Confirmed" subtitle="Traveler workspace" items={passengerNav} mode="topbar">
      <Card className="mx-auto max-w-3xl border-white/10 bg-white/8 text-white backdrop-blur-xl">
        <CardContent className="p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10">
            <CheckCircle2 className="h-8 w-8 text-emerald-300" />
          </div>
          <h2 className="mt-6 text-4xl font-semibold">Your trip is booked.</h2>
          <p className="mt-3 text-white/68">Payment completed successfully. Use the PNR below to manage this booking.</p>
          <div className="mt-8 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-6">
            <div className="text-sm uppercase tracking-[0.35em] text-cyan-100/70">PNR code</div>
            <div className="mt-3 text-5xl font-semibold tracking-[0.24em] text-cyan-100">{draft?.pnrCode ?? 'AERODK'}</div>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/my-bookings"><Button>View my bookings</Button></Link>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
              onClick={() => window.print()}
            >
              <Download className="mr-2 h-4 w-4" />
              Download ticket
            </button>
          </div>
        </CardContent>
      </Card>
    </PortalShell>
  );
}

export function MyBookingsPage() {
  const query = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => (await api.get<Booking[]>('/bookings/my')).data,
  });

  return (
    <PortalShell title="My Bookings" subtitle="Traveler workspace" items={passengerNav} mode="topbar">
      <div className="grid gap-4">
        {(query.data ?? []).map((booking) => (
          <Card key={booking.id} className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
            <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.35em] text-cyan-200/70">{booking.pnrCode}</div>
                <div className="mt-2 text-2xl font-semibold">{booking.flight.originAirport.code} → {booking.flight.destinationAirport.code}</div>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/65">
                  <span>{booking.flight.flightNumber}</span>
                  <span>{new Date(booking.flight.departureTime).toLocaleString()}</span>
                  <span>{booking.status}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to={`/my-bookings/${booking.id}`}><Button>Manage booking</Button></Link>
                {booking.status === 'CONFIRMED' ? <Link to={`/checkin/${booking.id}`}><Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">Check in</Button></Link> : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PortalShell>
  );
}

export function BookingDetailPage() {
  const params = useParams();
  const bookingId = Number(params.id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const bookingQuery = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => (await api.get<Booking>(`/bookings/${bookingId}`)).data,
  });

  const cancelMutation = useMutation({
    mutationFn: async () => (await api.post(`/bookings/${bookingId}/cancel`)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      await queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
    },
  });

  const booking = bookingQuery.data;

  return (
    <PortalShell title="Booking Detail" subtitle="Traveler workspace" items={passengerNav} mode="topbar">
      {!booking ? <PlaceholderCard label="Loading booking detail..." /> : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
            <CardHeader><CardTitle>Trip data</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Summary label="PNR" value={booking.pnrCode} />
              <Summary label="Route" value={`${booking.flight.originAirport.city} → ${booking.flight.destinationAirport.city}`} />
              <Summary label="Status" value={booking.status} />
              <Summary label="Seats" value={booking.seats.map((seat) => seat.seatNumber).join(', ')} />
              <Summary label="Traveler" value={booking.travelerName} />
              <Summary label="DOB / Gender" value={`${new Date(booking.travelerDateOfBirth).toLocaleDateString()} / ${booking.travelerGender}`} />
              <Summary label="Contact" value={`${booking.travelerEmail} / ${booking.travelerPhone}`} />
              <Summary label="Total" value={`₹${booking.totalAmount}`} />
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
            <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {booking.status === 'CONFIRMED' ? (
                <Button className="w-full" onClick={() => navigate(`/checkin/${booking.id}`)}>Open web check-in</Button>
              ) : null}
              {booking.status !== 'CANCELLED' ? (
                <Button variant="outline" className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10" onClick={() => cancelMutation.mutate()}>
                  Cancel booking
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}
    </PortalShell>
  );
}

export function CheckInPage() {
  const params = useParams();
  const bookingId = Number(params.bookingId);
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: async () => (await api.post<CheckIn>(`/checkin/${bookingId}`)).data,
    onSuccess: (data) => navigate(`/boarding-pass/${data.id}`),
  });

  return (
    <PortalShell title="Web Check-In" subtitle="Traveler workspace" items={passengerNav} mode="topbar">
      <Card className="mx-auto max-w-2xl border-white/10 bg-white/8 text-white backdrop-blur-xl">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 text-cyan-200">
            <Clock3 className="h-5 w-5" />
            Check-in opens 24 hours before departure and closes 1 hour before departure.
          </div>
          <Button className="mt-8 w-full" onClick={() => mutation.mutate()}>
            Complete check-in
          </Button>
        </CardContent>
      </Card>
    </PortalShell>
  );
}

export function BoardingPassPage() {
  const params = useParams();
  const checkInId = Number(params.id);
  const query = useQuery({
    queryKey: ['boarding-pass', checkInId],
    queryFn: async () => (await api.get<BoardingPass>(`/boarding-pass/${checkInId}`)).data,
  });

  const pass = query.data;

  return (
    <PortalShell title="Boarding Pass" subtitle="Traveler workspace" items={passengerNav} mode="topbar">
      {!pass ? <PlaceholderCard label="Loading boarding pass..." /> : (
        <Card className="mx-auto max-w-3xl border-white/10 bg-white/8 text-white backdrop-blur-xl print:shadow-none">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.35em] text-cyan-200/70">AeroDesk boarding pass</div>
                <div className="mt-2 text-4xl font-semibold">{pass.checkIn.booking.flight.originAirport.code} → {pass.checkIn.booking.flight.destinationAirport.code}</div>
              </div>
              <PlaneLanding className="h-8 w-8 text-cyan-200" />
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <Summary label="PNR" value={pass.checkIn.booking.pnrCode} />
              <Summary label="Gate" value={pass.gate} />
              <Summary label="Boarding time" value={new Date(pass.boardingTime).toLocaleString()} />
              <Summary label="Barcode data" value={pass.barcodeData.slice(0, 24)} />
            </div>
            <Button className="mt-8 w-full" onClick={() => window.print()}>
              <Download className="mr-2 h-4 w-4" />
              Print boarding pass
            </Button>
          </CardContent>
        </Card>
      )}
    </PortalShell>
  );
}

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get<Notification[]>('/notifications')).data,
  });

  const markMutation = useMutation({
    mutationFn: async (notificationId: number) => (await api.patch(`/notifications/${notificationId}/read`)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return (
    <PortalShell title="Notifications" subtitle="Traveler workspace" items={passengerNav} mode="topbar">
      <div className="grid gap-4">
        {(notificationsQuery.data ?? []).map((notification) => (
          <Card key={notification.id} className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
            <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-cyan-200"><Bell className="h-4 w-4" /> {notification.type}</div>
                <div className="mt-2 text-lg">{notification.message}</div>
                <div className="mt-2 text-sm text-white/60">{new Date(notification.createdAt).toLocaleString()}</div>
              </div>
              {!notification.isRead ? <Button onClick={() => markMutation.mutate(notification.id)}>Mark as read</Button> : <div className="text-sm text-emerald-300">Read</div>}
            </CardContent>
          </Card>
        ))}
      </div>
    </PortalShell>
  );
}

function StatCard({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="text-sm uppercase tracking-[0.35em] text-cyan-200/70">{title}</div>
        <div className="mt-3 text-5xl font-semibold">{value}</div>
        <div className="mt-2 text-sm text-white/60">{note}</div>
      </CardContent>
    </Card>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#091327] px-4 py-3">
      <div className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">{label}</div>
      <div className="mt-2 text-sm text-white">{value}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-white/72">{label}</Label>
      {children}
    </div>
  );
}

function PlaceholderCard({ label }: { label: string }) {
  return (
    <Card className="border-dashed border-white/12 bg-white/5 text-white/68 backdrop-blur-xl">
      <CardContent className="flex min-h-40 items-center justify-center p-6 text-center">{label}</CardContent>
    </Card>
  );
}
