import { Bell, LogOut, Plane, ShieldCheck, UserCog, Users } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import type { ReactNode } from 'react';

interface NavItem {
  to: string;
  label: string;
}

interface ShellProps {
  title: string;
  subtitle: string;
  items: NavItem[];
  mode: 'topbar' | 'sidebar';
  children: ReactNode;
}

export function PortalShell({ title, subtitle, items, mode, children }: ShellProps) {
  const navigate = useNavigate();
  const { logout, role } = useAuthStore();

  const icon = role === 'ADMIN'
    ? <ShieldCheck className="h-5 w-5 text-cyan-300" />
    : role === 'AIRPORT_MANAGER'
      ? <UserCog className="h-5 w-5 text-cyan-300" />
      : role === 'EMPLOYEE'
        ? <Users className="h-5 w-5 text-cyan-300" />
        : <Plane className="h-5 w-5 text-cyan-300" />;

  const logOut = () => {
    logout();
    navigate('/login');
  };

  if (mode === 'sidebar') {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.28),_transparent_32%),linear-gradient(145deg,_#08101f_0%,_#0b1224_45%,_#111c38_100%)] text-white">
        <div className="mx-auto flex min-h-screen max-w-[1600px]">
          <aside className="hidden w-72 border-r border-white/10 bg-white/6 px-6 py-8 backdrop-blur-xl lg:block">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/40 bg-cyan-400/10">
                {icon}
              </div>
              <div>
                <div className="font-semibold tracking-[0.3em] text-cyan-200">AERODESK</div>
                <div className="text-sm text-white/60">{subtitle}</div>
              </div>
            </Link>
            <nav className="mt-10 space-y-2">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `block rounded-2xl px-4 py-3 text-sm transition ${
                      isActive ? 'bg-cyan-400/15 text-cyan-100 shadow-[0_0_0_1px_rgba(103,232,249,0.2)]' : 'text-white/70 hover:bg-white/8 hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
          <div className="flex-1">
            <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b1325]/70 px-5 py-4 backdrop-blur-xl lg:px-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">{subtitle}</div>
                  <h1 className="text-2xl font-semibold">{title}</h1>
                </div>
                <div className="flex items-center gap-3">
                  <Link to="/notifications" className="rounded-full border border-white/10 bg-white/6 p-2.5 text-white/80 hover:text-white">
                    <Bell className="h-4 w-4" />
                  </Link>
                  <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10" onClick={logOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </header>
            <main className="p-5 lg:p-8">{children}</main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.18),_transparent_30%),linear-gradient(180deg,_#09101f_0%,_#0b1428_55%,_#0f1d38_100%)] text-white">
      <header className="border-b border-white/10 bg-[#0b1325]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/40 bg-cyan-400/10">
              {icon}
            </div>
            <div>
              <div className="font-semibold tracking-[0.35em] text-cyan-200">AERODESK</div>
              <div className="text-sm text-white/65">{subtitle}</div>
            </div>
          </Link>
          <nav className="flex flex-wrap gap-2">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm transition ${
                    isActive ? 'bg-cyan-400/15 text-cyan-100' : 'text-white/70 hover:bg-white/8 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/notifications" className="rounded-full border border-white/10 bg-white/6 p-2.5 text-white/80 hover:text-white">
              <Bell className="h-4 w-4" />
            </Link>
            <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10" onClick={logOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-6">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          {children}
        </motion.div>
      </main>
    </div>
  );
}
