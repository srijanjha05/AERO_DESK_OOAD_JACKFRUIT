import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BellRing, Plane, PlaneTakeoff, RefreshCw, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { PortalShell } from '@/components/layout/PortalShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Flight, Refund } from '@/lib/types';

const nav = [
  { to: '/manager/dashboard', label: 'Dashboard' },
  { to: '/manager/flights', label: 'Flights' },
  { to: '/manager/flights/new', label: 'Schedule' },
  { to: '/manager/aircraft', label: 'Aircraft' },
  { to: '/manager/airports', label: 'Airports' },
  { to: '/manager/refunds', label: 'Refunds' },
  { to: '/manager/notifications', label: 'Notifications' },
];

export function ManagerDashboardPage() {
  const refundsQuery = useQuery({
    queryKey: ['manager-refunds'],
    queryFn: async () => (await api.get<Refund[]>('/manager/refunds')).data,
  });

  return (
    <PortalShell title="Airport Manager Dashboard" subtitle="Operations control" items={nav} mode="sidebar">
      <div className="grid gap-6 lg:grid-cols-3">
        <Tile title="Pending refunds" value={String(refundsQuery.data?.length ?? 0)} note="Approval queue ready" icon={<RefreshCw className="h-5 w-5 text-cyan-200" />} />
        <Tile title="Airports & aircraft" value="CRUD" note="Provision network infrastructure" icon={<Plane className="h-5 w-5 text-cyan-200" />} />
        <Tile title="Bulk notifications" value="Live" note="Send disruption notices by role or user list" icon={<BellRing className="h-5 w-5 text-cyan-200" />} />
      </div>
    </PortalShell>
  );
}

export function ManagerFlightsPage() {
  const [from, setFrom] = useState('DEL');
  const [to, setTo] = useState('BOM');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [results, setResults] = useState<Flight[]>([]);
  const queryClient = useQueryClient();

  const loadFlights = async () => {
    const response = await api.get<Flight[]>(`/flights/search?from=${from}&to=${to}&date=${date}`);
    setResults(response.data);
  };

  const statusMutation = useMutation({
    mutationFn: async ({ flightId, status, reason }: { flightId: number; status: string; reason?: string }) => (await api.patch(`/manager/flights/${flightId}/status`, { status, reason })).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['manager-refunds'] });
      await loadFlights();
    },
  });

  return (
    <PortalShell title="Flight Board" subtitle="Operations control" items={nav} mode="sidebar">
      <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
        <CardContent className="grid gap-4 p-6 md:grid-cols-4">
          <Field label="From"><Input value={from} onChange={(event) => setFrom(event.target.value.toUpperCase())} className="border-white/12 bg-white/5 text-white" /></Field>
          <Field label="To"><Input value={to} onChange={(event) => setTo(event.target.value.toUpperCase())} className="border-white/12 bg-white/5 text-white" /></Field>
          <Field label="Date"><Input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="border-white/12 bg-white/5 text-white" /></Field>
          <div className="flex items-end"><Button className="w-full" onClick={loadFlights}>Load flights</Button></div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4">
        {results.map((flight) => (
          <Card key={flight.id} className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
            <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">{flight.flightNumber}</div>
                <div className="mt-2 text-2xl font-semibold">{flight.originAirport.code} → {flight.destinationAirport.code}</div>
                <div className="mt-2 text-sm text-white/65">{new Date(flight.departureTime).toLocaleString()} · {flight.status}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {['BOARDING', 'DELAYED', 'ARRIVED', 'CANCELLED'].map((status) => (
                  <Button
                    key={status}
                    variant="outline"
                    className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                    onClick={() => {
                      let reason = '';
                      if (status === 'DELAYED' || status === 'CANCELLED') {
                        reason = window.prompt(`Enter context/reason for marking flight as ${status}:`) || '';
                      }
                      statusMutation.mutate({ flightId: flight.id, status, reason });
                    }}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PortalShell>
  );
}

export function ManagerFlightCreatePage() {
  const [form, setForm] = useState({
    flightNumber: '',
    originAirportId: '',
    destinationAirportId: '',
    departureTime: '',
    arrivalTime: '',
    price: '',
    aircraftId: '',
  });
  const mutation = useMutation({
    mutationFn: async () => {
      let dep = form.departureTime;
      if (dep && dep.length === 16) dep += ':00';
      let arr = form.arrivalTime;
      if (arr && arr.length === 16) arr += ':00';

      return (await api.post('/manager/flights', {
        ...form,
        originAirportId: Number(form.originAirportId),
        destinationAirportId: Number(form.destinationAirportId),
        aircraftId: Number(form.aircraftId),
        price: Number(form.price),
        departureTime: dep,
        arrivalTime: arr,
      })).data;
    }
  });

  const getError = () => {
    if (!mutation.isError) return '';
    const m = mutation.error as any;
    return m?.response?.data?.error || m?.response?.data?.message || m?.message || 'Failed to schedule flight. Check inputs.';
  };

  return (
    <PortalShell title="Schedule Flight" subtitle="Operations control" items={nav} mode="sidebar">
      <EntityForm
        title="Create flight instance"
        fields={[
          { label: 'Flight number', key: 'flightNumber' },
          { label: 'Origin airport ID', key: 'originAirportId' },
          { label: 'Destination airport ID', key: 'destinationAirportId' },
          { label: 'Departure time', key: 'departureTime', type: 'datetime-local' },
          { label: 'Arrival time', key: 'arrivalTime', type: 'datetime-local' },
          { label: 'Price', key: 'price', type: 'number' },
          { label: 'Aircraft ID', key: 'aircraftId', type: 'number' },
        ]}
        values={form}
        onChange={setForm}
        onSubmit={() => mutation.mutate()}
        success={mutation.isSuccess ? 'Flight created explicitly.' : ''}
        error={getError()}
      />
    </PortalShell>
  );
}

export function ManagerAircraftPage() {
  const [form, setForm] = useState({
    model: '',
    registrationNumber: '',
    totalSeats: '180',
    economySeats: '150',
    businessSeats: '20',
    firstClassSeats: '10',
  });
  const mutation = useMutation({
    mutationFn: async () => (await api.post('/manager/aircraft', {
      ...form,
      totalSeats: Number(form.totalSeats),
      economySeats: Number(form.economySeats),
      businessSeats: Number(form.businessSeats),
      firstClassSeats: Number(form.firstClassSeats),
    })).data,
  });

  return (
    <PortalShell title="Aircraft Management" subtitle="Operations control" items={nav} mode="sidebar">
      <EntityForm
        title="Register aircraft"
        fields={[
          { label: 'Model', key: 'model' },
          { label: 'Registration number', key: 'registrationNumber' },
          { label: 'Total seats', key: 'totalSeats', type: 'number' },
          { label: 'Economy seats', key: 'economySeats', type: 'number' },
          { label: 'Business seats', key: 'businessSeats', type: 'number' },
          { label: 'First class seats', key: 'firstClassSeats', type: 'number' },
        ]}
        values={form}
        onChange={setForm}
        onSubmit={() => mutation.mutate()}
        success={mutation.isSuccess ? 'Aircraft created with seat map.' : ''}
      />
    </PortalShell>
  );
}

export function ManagerAirportsPage() {
  const [form, setForm] = useState({ name: '', code: '', city: '' });
  const mutation = useMutation({
    mutationFn: async () => (await api.post('/manager/airports', form)).data,
  });

  return (
    <PortalShell title="Airport Management" subtitle="Operations control" items={nav} mode="sidebar">
      <EntityForm
        title="Create airport"
        fields={[
          { label: 'Name', key: 'name' },
          { label: 'Code', key: 'code' },
          { label: 'City', key: 'city' },
        ]}
        values={form}
        onChange={setForm}
        onSubmit={() => mutation.mutate()}
        success={mutation.isSuccess ? 'Airport created.' : ''}
      />
    </PortalShell>
  );
}

export function ManagerRefundsPage() {
  const queryClient = useQueryClient();
  const refundsQuery = useQuery({
    queryKey: ['manager-refunds'],
    queryFn: async () => (await api.get<Refund[]>('/manager/refunds')).data,
  });

  const decisionMutation = useMutation({
    mutationFn: async ({ refundId, action, reason }: { refundId: number; action: 'approve' | 'reject'; reason: string }) =>
      (await api.patch(`/manager/refunds/${refundId}/${action}`, { reason })).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['manager-refunds'] });
    },
  });

  return (
    <PortalShell title="Refund Queue" subtitle="Operations control" items={nav} mode="sidebar">
      <div className="grid gap-4">
        {(refundsQuery.data ?? []).map((refund) => (
          <Card key={refund.id} className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
            <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-xl font-semibold">₹{refund.refundAmount}</div>
                <div className="mt-2 text-sm text-white/65">{refund.reason}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.3em] text-cyan-200/70">Transaction {refund.payment.transactionId}</div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => decisionMutation.mutate({ refundId: refund.id, action: 'approve', reason: 'Approved by airport manager' })}>Approve</Button>
                <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10" onClick={() => decisionMutation.mutate({ refundId: refund.id, action: 'reject', reason: 'Rejected by airport manager' })}>
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PortalShell>
  );
}

export function ManagerNotificationsPage() {
  const [message, setMessage] = useState('Flight update from AeroDesk operations');
  const [type, setType] = useState('BULK_ALERT');
  const [roles, setRoles] = useState('PASSENGER');
  const mutation = useMutation({
    mutationFn: async () => (await api.post('/manager/notifications/bulk', {
      message,
      type,
      roles: roles.split(',').map((value) => value.trim()).filter(Boolean),
    })).data,
  });

  return (
    <PortalShell title="Bulk Notifications" subtitle="Operations control" items={nav} mode="sidebar">
      <Card className="max-w-3xl border-white/10 bg-white/8 text-white backdrop-blur-xl">
        <CardHeader><CardTitle>Send network-wide message</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Message"><Input value={message} onChange={(event) => setMessage(event.target.value)} className="border-white/12 bg-white/5 text-white" /></Field>
          <Field label="Type"><Input value={type} onChange={(event) => setType(event.target.value)} className="border-white/12 bg-white/5 text-white" /></Field>
          <Field label="Target roles"><Input value={roles} onChange={(event) => setRoles(event.target.value)} className="border-white/12 bg-white/5 text-white" /></Field>
          <Button onClick={() => mutation.mutate()}><Send className="mr-2 h-4 w-4" />Send notifications</Button>
          {mutation.isSuccess ? <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">Notifications created successfully.</div> : null}
        </CardContent>
      </Card>
    </PortalShell>
  );
}

function Tile({ title, value, note, icon }: { title: string; value: string; note: string; icon: React.ReactNode }) {
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

interface EntityFormProps<T extends Record<string, string>> {
  title: string;
  fields: Array<{ label: string; key: keyof T; type?: string }>;
  values: T;
  onChange: (value: T) => void;
  onSubmit: () => void;
  success: string;
  error?: string;
}

function EntityForm<T extends Record<string, string>>({ title, fields, values, onChange, onSubmit, success, error }: EntityFormProps<T>) {
  return (
    <Card className="max-w-4xl border-white/10 bg-white/8 text-white backdrop-blur-xl">
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <Field key={String(field.key)} label={field.label}>
            <Input
              type={field.type}
              value={values[field.key]}
              onChange={(event) => onChange({ ...values, [field.key]: event.target.value })}
              className="border-white/12 bg-white/5 text-white"
            />
          </Field>
        ))}
        <div className="md:col-span-2">
          <Button onClick={onSubmit}><PlaneTakeoff className="mr-2 h-4 w-4" />Submit</Button>
        </div>
        {success ? <div className="md:col-span-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">{success}</div> : null}
        {error ? <div className="md:col-span-2 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 font-semibold text-red-200">{error}</div> : null}
      </CardContent>
    </Card>
  );
}
