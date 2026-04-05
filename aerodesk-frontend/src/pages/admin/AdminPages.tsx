import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { FileClock, LineChart, Search, ShieldCheck } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { api } from '@/lib/api';
import { PortalShell } from '@/components/layout/PortalShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AuditLog, User } from '@/lib/types';

const nav = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/admin/audit-logs', label: 'Audit Logs' },
  { to: '/admin/roles', label: 'Roles' },
  { to: '/admin/users', label: 'Users' },
];

const containerParams: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemParams: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export function AdminDashboardPage() {
  const revenueQuery = useQuery({ queryKey: ['admin-revenue'], queryFn: async () => (await api.get<Array<Record<string, string | number>>>('/admin/reports/revenue')).data });
  const occupancyQuery = useQuery({ queryKey: ['admin-occupancy'], queryFn: async () => (await api.get<Array<Record<string, string | number>>>('/admin/reports/occupancy')).data });
  const punctualityQuery = useQuery({ queryKey: ['admin-punctuality'], queryFn: async () => (await api.get<Array<Record<string, string | number>>>('/admin/reports/punctuality')).data });

  const PIE_COLORS = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <PortalShell title="Executive Dashboard" subtitle="CEO oversight" items={nav} mode="sidebar">
      <motion.div variants={containerParams} initial="hidden" animate="show" className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div variants={itemParams}><AdminTile title="Revenue" value={`${revenueQuery.data?.length ?? 0} metrics`} icon={<LineChart className="h-5 w-5 text-cyan-200" />} /></motion.div>
          <motion.div variants={itemParams}><AdminTile title="Audit readiness" value="Live" icon={<FileClock className="h-5 w-5 text-cyan-200" />} /></motion.div>
          <motion.div variants={itemParams}><AdminTile title="User governance" value="RBAC" icon={<ShieldCheck className="h-5 w-5 text-cyan-200" />} /></motion.div>
        </div>
        
        <div className="grid gap-6 xl:grid-cols-3">
          <motion.div variants={itemParams} className="xl:col-span-2">
            <ChartCard title="Revenue Flow">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueQuery.data ?? []}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="metric" stroke="rgba(255,255,255,0.55)" tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.55)" tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip contentStyle={{ background: '#091327', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} itemStyle={{ color: '#67e8f9' }} />
                  <Area type="monotone" dataKey="amount" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </motion.div>

          <motion.div variants={itemParams}>
            <ChartCard title="Punctuality Report">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={punctualityQuery.data ?? []} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5}>
                    {(punctualityQuery.data ?? []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#091327', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </motion.div>

          <motion.div variants={itemParams} className="xl:col-span-3">
            <ChartCard title="Occupancy Rates per Route">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyQuery.data ?? []} barSize={40}>
                  <defs>
                    <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="route" stroke="rgba(255,255,255,0.55)" tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.55)" tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#091327', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                  <Bar dataKey="occupancy" fill="url(#colorOccupancy)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </motion.div>
        </div>
      </motion.div>
    </PortalShell>
  );
}

export function AdminReportsPage() {
  const revenueQuery = useQuery({ queryKey: ['admin-revenue'], queryFn: async () => (await api.get<Array<Record<string, string | number>>>('/admin/reports/revenue')).data });
  const occupancyQuery = useQuery({ queryKey: ['admin-occupancy'], queryFn: async () => (await api.get<Array<Record<string, string | number>>>('/admin/reports/occupancy')).data });
  const punctualityQuery = useQuery({ queryKey: ['admin-punctuality'], queryFn: async () => (await api.get<Array<Record<string, string | number>>>('/admin/reports/punctuality')).data });

  const PIE_COLORS = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const todayRevenue = revenueQuery.data?.find((r) => r['metric'] === 'today')?.['amount'] ?? 0;
  const totalRevenue = revenueQuery.data?.find((r) => r['metric'] === 'total')?.['amount'] ?? 0;

  const topRoute = [...(occupancyQuery.data ?? [])].sort((a, b) => Number(b['occupancy']) - Number(a['occupancy']))[0];
  const arrivedCount = punctualityQuery.data?.find((r) => r['status'] === 'ARRIVED')?.['count'] ?? 0;
  const delayedCount = punctualityQuery.data?.find((r) => r['status'] === 'DELAYED')?.['count'] ?? 0;
  const cancelledCount = punctualityQuery.data?.find((r) => r['status'] === 'CANCELLED')?.['count'] ?? 0;
  const totalFlights = Number(arrivedCount) + Number(delayedCount) + Number(cancelledCount);
  const punctualityPct = totalFlights > 0 ? Math.round((Number(arrivedCount) / totalFlights) * 100) : 0;

  return (
    <PortalShell title="Analytics & Reports" subtitle="CEO oversight" items={nav} mode="sidebar">
      <motion.div variants={containerParams} initial="hidden" animate="show" className="space-y-6">
        {/* KPI tiles */}
        <div className="grid gap-6 lg:grid-cols-4">
          <motion.div variants={itemParams}>
            <ReportTile label="Today's Revenue" value={`₹${Number(todayRevenue).toLocaleString()}`} sub="Confirmed payments today" />
          </motion.div>
          <motion.div variants={itemParams}>
            <ReportTile label="Total Revenue" value={`₹${Number(totalRevenue).toLocaleString()}`} sub="All-time confirmed payments" />
          </motion.div>
          <motion.div variants={itemParams}>
            <ReportTile label="Punctuality Rate" value={`${punctualityPct}%`} sub={`${arrivedCount} arrived of ${totalFlights} completed`} />
          </motion.div>
          <motion.div variants={itemParams}>
            <ReportTile label="Busiest Route" value={topRoute ? String(topRoute['route']) : '—'} sub={topRoute ? `${topRoute['occupancy']}% occupancy` : 'No data'} />
          </motion.div>
        </div>

        {/* Occupancy table + chart */}
        <div className="grid gap-6 xl:grid-cols-2">
          <motion.div variants={itemParams}>
            <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
              <CardHeader><CardTitle>Occupancy by Route</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto p-0">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-white/10 text-white/60">
                    <tr>
                      <th className="px-6 py-4">Route</th>
                      <th className="px-6 py-4 text-right">Occupancy</th>
                      <th className="px-6 py-4">Bar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...(occupancyQuery.data ?? [])].sort((a, b) => Number(b['occupancy']) - Number(a['occupancy'])).map((row, i) => (
                      <tr key={i} className="border-b border-white/6">
                        <td className="px-6 py-3 font-medium">{String(row['route'])}</td>
                        <td className="px-6 py-3 text-right font-mono text-cyan-300">{Number(row['occupancy']).toFixed(1)}%</td>
                        <td className="px-6 py-3 w-32">
                          <div className="h-2 rounded-full bg-white/10">
                            <div className="h-2 rounded-full bg-cyan-400" style={{ width: `${Math.min(Number(row['occupancy']), 100)}%` }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                    {occupancyQuery.data?.length === 0 && <tr><td colSpan={3} className="px-6 py-8 text-center text-white/40">No occupancy data yet.</td></tr>}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemParams}>
            <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
              <CardHeader><CardTitle>Punctuality Breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-6">
                {[
                  { label: 'Arrived on time', count: arrivedCount, color: 'bg-emerald-400' },
                  { label: 'Delayed', count: delayedCount, color: 'bg-yellow-400' },
                  { label: 'Cancelled', count: cancelledCount, color: 'bg-red-400' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-4">
                    <div className="w-40 text-sm text-white/70">{row.label}</div>
                    <div className="flex-1 h-3 rounded-full bg-white/10">
                      <div className={`h-3 rounded-full ${row.color}`} style={{ width: totalFlights > 0 ? `${(Number(row.count) / totalFlights) * 100}%` : '0%' }} />
                    </div>
                    <div className="w-8 text-right font-mono text-sm text-white/60">{String(row.count)}</div>
                  </div>
                ))}
                <div className="mt-6 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={punctualityQuery.data ?? []} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={5}>
                        {(punctualityQuery.data ?? []).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#091327', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Revenue chart */}
        <motion.div variants={itemParams}>
          <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
            <CardHeader><CardTitle>Revenue Flow</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueQuery.data ?? []}>
                  <defs>
                    <linearGradient id="colorRevRpt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="metric" stroke="rgba(255,255,255,0.55)" tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.55)" tickLine={false} axisLine={false} tickFormatter={(val) => `₹${Number(val)/1000}k`} />
                  <Tooltip contentStyle={{ background: '#091327', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} itemStyle={{ color: '#67e8f9' }} />
                  <Area type="monotone" dataKey="amount" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorRevRpt)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </PortalShell>
  );
}

function ReportTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="text-xs uppercase tracking-widest text-white/45 mb-2">{label}</div>
        <div className="text-3xl font-bold text-cyan-200">{value}</div>
        <div className="mt-1 text-xs text-white/50">{sub}</div>
      </CardContent>
    </Card>
  );
}

export function AdminAuditLogsPage() {
  const logsQuery = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => (await api.get<AuditLog[]>('/admin/audit-logs')).data,
  });

  return (
    <PortalShell title="Audit Logs" subtitle="CEO oversight" items={nav} mode="sidebar">
      <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 text-white/60">
              <tr>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Entity</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Outcome</th>
                <th className="px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {(logsQuery.data ?? []).map((log) => (
                <tr key={log.id} className="border-b border-white/6">
                  <td className="px-6 py-4">{log.action}</td>
                  <td className="px-6 py-4">{log.entityType} #{log.entityId}</td>
                  <td className="px-6 py-4">{log.user?.email}</td>
                  <td className="px-6 py-4">
                    {log.outcome ? (
                      <span className={`rounded-full px-3 py-1 text-xs ${log.outcome === 'SUCCESS' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>
                        {log.outcome}
                      </span>
                    ) : (
                      <span className="text-white/40">SYSTEM</span>
                    )}
                  </td>
                  <td className="px-6 py-4">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </PortalShell>
  );
}

export function AdminRolesPage() {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [role, setRole] = useState('PASSENGER');
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get<User[]>('/admin/users')).data,
  });

  const mutation = useMutation({
    mutationFn: async () => (await api.post<User>('/admin/roles', { userId: selectedUser!.id, role })).data,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUser(data);
    },
  });

  const filteredUsers = search
    ? (usersQuery.data ?? []).filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <PortalShell title="RBAC Management" subtitle="CEO oversight" items={nav} mode="sidebar">
      <Card className="max-w-2xl border-white/10 bg-white/8 text-white backdrop-blur-xl">
        <CardHeader><CardTitle>Assign Role</CardTitle></CardHeader>
        <CardContent className="space-y-4 p-6">
          <Field label="Search user by name or email">
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelectedUser(null); mutation.reset(); }}
              placeholder="Start typing to find user…"
              className="border-white/12 bg-white/5 text-white"
            />
          </Field>

          {search && !selectedUser && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => { setSelectedUser(u); setRole(u.role); setSearch(''); }}
                  className="w-full text-left rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition-colors"
                >
                  <div className="font-medium">{u.name}</div>
                  <div className="text-sm text-white/55">{u.email} · {u.role}</div>
                </button>
              ))}
              {filteredUsers.length === 0 && <div className="text-white/40 text-sm px-2">No users found.</div>}
            </div>
          )}

          {selectedUser && (
            <div className="flex items-center justify-between rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <div>
                <div className="font-semibold">{selectedUser.name}</div>
                <div className="text-sm text-white/65">{selectedUser.email} · current: {selectedUser.role}</div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-white/40 hover:text-white text-xs">Change</button>
            </div>
          )}

          <Field label="New role">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-md border border-white/12 bg-white/5 px-3 py-2 text-white text-sm"
            >
              <option value="PASSENGER" className="bg-slate-900">PASSENGER</option>
              <option value="EMPLOYEE" className="bg-slate-900">EMPLOYEE</option>
              <option value="AIRPORT_MANAGER" className="bg-slate-900">AIRPORT_MANAGER</option>
              <option value="ADMIN" className="bg-slate-900">ADMIN</option>
            </select>
          </Field>

          <Button onClick={() => mutation.mutate()} disabled={!selectedUser || mutation.isPending}>
            {mutation.isPending ? 'Assigning…' : 'Assign Role'}
          </Button>
          {mutation.data && (
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              Updated <strong>{mutation.data.email}</strong> to <strong>{mutation.data.role}</strong>
            </div>
          )}
          {mutation.isError && (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-300 text-sm">
              {(mutation.error as any)?.response?.data?.error || 'Failed to assign role.'}
            </div>
          )}
        </CardContent>
      </Card>
    </PortalShell>
  );
}

export function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get<User[]>('/admin/users')).data,
  });

  const allUsers = usersQuery.data ?? [];
  const filtered = search
    ? allUsers.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
      )
    : allUsers;

  const roleCounts = allUsers.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});

  const roleColor: Record<string, string> = {
    ADMIN: 'border-purple-400/20 bg-purple-400/10 text-purple-200',
    AIRPORT_MANAGER: 'border-blue-400/20 bg-blue-400/10 text-blue-200',
    EMPLOYEE: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
    PASSENGER: 'border-white/10 bg-white/5 text-white/70',
  };

  return (
    <PortalShell title="All Users" subtitle="CEO oversight" items={nav} mode="sidebar">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          {Object.entries(roleCounts).map(([role, count]) => (
            <div key={role} className={`rounded-full px-4 py-1.5 text-xs font-medium border ${roleColor[role] ?? 'border-white/10 bg-white/5 text-white/70'}`}>
              {role}: {count}
            </div>
          ))}
          <div className="rounded-full px-4 py-1.5 text-xs font-medium border border-white/10 bg-white/5 text-white/50">
            Total: {allUsers.length}
          </div>
        </div>

        <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by name, email or role…"
                className="pl-9 border-white/12 bg-white/5 text-white"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((user) => (
            <Card key={user.id} className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <div className="text-xl font-semibold">{user.name}</div>
                  <div className="mt-1 text-sm text-white/65">{user.email}</div>
                  {user.phone && <div className="mt-1 text-xs text-white/40">{user.phone}</div>}
                </div>
                <div className={`rounded-full border px-4 py-2 text-sm ${roleColor[user.role] ?? 'border-white/10 bg-white/5 text-white/70'}`}>{user.role}</div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="lg:col-span-2 text-center text-white/40 py-12">
              {search ? `No users matching "${search}"` : 'No users found.'}
            </div>
          )}
        </div>
      </div>
    </PortalShell>
  );
}

function AdminTile({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm uppercase tracking-[0.35em] text-cyan-200/70">{title}</div>
          {icon}
        </div>
        <div className="mt-4 text-5xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="h-72">{children}</CardContent>
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
