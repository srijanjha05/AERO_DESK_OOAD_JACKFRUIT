import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { FileClock, LineChart, ShieldCheck } from 'lucide-react';
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
  return <AdminDashboardPage />;
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
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('PASSENGER');
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => (await api.post<User>('/admin/roles', { userId: Number(userId), role })).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  return (
    <PortalShell title="RBAC Management" subtitle="CEO oversight" items={nav} mode="sidebar">
      <Card className="max-w-2xl border-white/10 bg-white/8 text-white backdrop-blur-xl">
        <CardHeader><CardTitle>Assign role</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="User ID"><Input value={userId} onChange={(event) => setUserId(event.target.value)} className="border-white/12 bg-white/5 text-white" /></Field>
          <Field label="Role"><Input value={role} onChange={(event) => setRole(event.target.value)} className="border-white/12 bg-white/5 text-white" /></Field>
          <Button onClick={() => mutation.mutate()}>Assign role</Button>
          {mutation.data ? <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">Updated {mutation.data.email} to {mutation.data.role}</div> : null}
        </CardContent>
      </Card>
    </PortalShell>
  );
}

export function AdminUsersPage() {
  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get<User[]>('/admin/users')).data,
  });

  return (
    <PortalShell title="All Users" subtitle="CEO oversight" items={nav} mode="sidebar">
      <div className="grid gap-4 lg:grid-cols-2">
        {(usersQuery.data ?? []).map((user) => (
          <Card key={user.id} className="border-white/10 bg-white/8 text-white backdrop-blur-xl">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <div className="text-xl font-semibold">{user.name}</div>
                <div className="mt-2 text-sm text-white/65">{user.email}</div>
              </div>
              <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">{user.role}</div>
            </CardContent>
          </Card>
        ))}
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
