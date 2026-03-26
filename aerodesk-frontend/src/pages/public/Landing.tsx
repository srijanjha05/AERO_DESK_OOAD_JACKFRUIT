import { ArrowRight, PlaneTakeoff, Radar, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const stats = [
  { label: 'Routes Managed', value: '120+' },
  { label: 'Live Ops Panels', value: '4' },
  { label: 'Seat Hold Window', value: '10 min' },
];

export default function Landing() {
  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.35),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.22),_transparent_24%),linear-gradient(135deg,_#08101f_0%,_#0b1426_42%,_#101d39_100%)] text-white">
      <div className="mx-auto max-w-7xl px-5 py-6 lg:px-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/40 bg-cyan-400/10">
              <PlaneTakeoff className="h-6 w-6 text-cyan-300" />
            </div>
            <div>
              <div className="font-semibold tracking-[0.35em] text-cyan-200">AERODESK</div>
              <div className="text-sm text-white/60">Airline Reservation & Management System</div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/login"><Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">Login</Button></Link>
            <Link to="/register"><Button>Register</Button></Link>
          </div>
        </header>

        <section className="grid items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
              <Sparkles className="h-4 w-4" />
              Deep navy passenger experience with ops-grade control panels
            </div>
            <h1 className="mt-8 max-w-3xl text-5xl font-semibold leading-tight lg:text-7xl">
              One desk for booking, airport operations, refunds, check-in, and executive reporting.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
              AeroDesk unifies the passenger journey and airline back office in one glassy interface layer backed by Spring Boot, JWT security, OTP access, and MySQL.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/search">
                <Button size="lg" className="rounded-full px-6">
                  Search Flights
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/employee/login">
                <Button size="lg" variant="outline" className="rounded-full border-white/15 bg-white/5 px-6 text-white hover:bg-white/10">
                  Staff Access
                </Button>
              </Link>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <Card key={stat.label} className="border-white/10 bg-white/6 text-white shadow-none backdrop-blur-xl">
                  <CardContent className="p-5">
                    <div className="text-3xl font-semibold text-cyan-200">{stat.value}</div>
                    <div className="mt-2 text-sm text-white/65">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute -left-4 top-8 h-28 w-28 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="absolute -right-4 bottom-8 h-32 w-32 rounded-full bg-blue-500/20 blur-3xl" />
            <Card className="border-white/10 bg-white/8 text-white shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
              <CardContent className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm uppercase tracking-[0.32em] text-cyan-200/70">Control Surface</div>
                    <div className="mt-2 text-2xl font-semibold">Ops snapshot</div>
                  </div>
                  <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-3">
                    <Radar className="h-6 w-6 text-cyan-200" />
                  </div>
                </div>
                <div className="grid gap-4">
                  <div className="rounded-3xl border border-white/10 bg-[#0f1a31] p-5">
                    <div className="flex items-center justify-between text-sm text-white/60">
                      <span>Flight punctuality</span>
                      <span>87%</span>
                    </div>
                    <div className="mt-4 h-3 rounded-full bg-white/10">
                      <div className="h-3 w-[87%] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-[#0f1a31] p-5">
                      <div className="flex items-center gap-2 text-cyan-200"><Shield className="h-4 w-4" /> OTP-secured staff login</div>
                      <div className="mt-3 text-sm leading-6 text-white/65">Employees, managers, and admins authenticate with password plus OTP before JWT issuance.</div>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-[#0f1a31] p-5">
                      <div className="text-cyan-200">Demo credentials</div>
                      <div className="mt-3 space-y-2 text-sm text-white/70">
                        <div>`test@passenger.com` / `Test@1234`</div>
                        <div>`emp001`, `mgr001`, `admin001` / `Test@1234`</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
