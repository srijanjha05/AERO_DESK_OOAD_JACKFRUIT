import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LockKeyhole, PlaneTakeoff, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AuthResponse } from '@/lib/types';

interface LoginForm {
  email: string;
  password: string;
  otpCode?: string;
}

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm<LoginForm>();
  const { setAuth } = useAuthStore();
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);
  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const [serverMessage, setServerMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [otpMode, setOtpMode] = useState(false);

  const targetRole = useMemo(() => {
    const pathname = location.pathname;
    if (pathname.startsWith('/employee')) return 'EMPLOYEE';
    if (pathname.startsWith('/manager')) return 'AIRPORT_MANAGER';
    if (pathname.startsWith('/admin')) return 'ADMIN';
    return 'PASSENGER';
  }, [location.pathname]);

  const submitCredentials = async (data: LoginForm) => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email: data.email,
        password: data.password,
      });

      if (response.data.requiresOtp) {
        setOtpMode(true);
        setPendingUserId(response.data.userId);
        setPendingRole(response.data.role);
        setServerMessage(response.data.message);
        setError('');
        return;
      }

      if (response.data.role !== targetRole && targetRole !== 'PASSENGER') {
        setError(`This portal is restricted to ${targetRole} users.`);
        return;
      }

      setAuth(response.data.token ?? '', response.data.role, response.data.userId);
      navigate(defaultPathForRole(response.data.role));
    } catch (err: any) {
      setError(
        err.response?.data?.error
          ?? err.response?.data?.message
          ?? (err.request ? 'Backend unreachable. Start the Spring Boot server on port 8080.' : 'Login failed')
      );
    }
  };

  const submitOtp = async (data: LoginForm) => {
    if (!pendingUserId) return;
    try {
      const response = await api.post<AuthResponse>('/auth/verify-otp', {
        userId: pendingUserId,
        otpCode: data.otpCode,
      });
      setAuth(response.data.token ?? '', response.data.role, response.data.userId);
      navigate(defaultPathForRole(response.data.role));
    } catch (err: any) {
      setError(
        err.response?.data?.error
          ?? err.response?.data?.message
          ?? (err.request ? 'Backend unreachable. Start the Spring Boot server on port 8080.' : 'OTP verification failed')
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.35),_transparent_35%),linear-gradient(135deg,_#08101f_0%,_#0b152a_45%,_#112147_100%)] px-4 py-10 text-white">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="grid w-full max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
            <PlaneTakeoff className="h-4 w-4" />
            AeroDesk secure access
          </div>
          <h1 className="mt-8 max-w-2xl text-6xl font-semibold leading-tight">
            Airline control, check-in, and booking in one secure interface.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">
            Passengers enter directly. Employees, airport managers, and admins complete OTP verification before the JWT session opens.
          </p>
          <div className="mt-8 space-y-4 text-white/72">
            <div className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
              Passenger demo: `test@passenger.com` / `Test@1234`
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
              Staff demo: `emp001`, `mgr001`, `admin001` / `Test@1234`
            </div>
          </div>
        </div>

        <Card className="border-white/10 bg-white/8 text-white shadow-[0_40px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <CardHeader>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10">
              {otpMode ? <ShieldCheck className="h-7 w-7 text-cyan-200" /> : <LockKeyhole className="h-7 w-7 text-cyan-200" />}
            </div>
            <CardTitle className="text-3xl">{otpMode ? 'Verify OTP' : 'Sign In'}</CardTitle>
            <CardDescription className="text-white/62">
              {otpMode ? 'Use the OTP returned by the backend for demo mode.' : `Portal target: ${targetRole.replace('_', ' ')}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {serverMessage ? <div className="mb-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm text-cyan-100">{serverMessage}</div> : null}
            {error ? <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-100">{error}</div> : null}

            {!otpMode ? (
              <form className="space-y-5" onSubmit={handleSubmit(submitCredentials)}>
                <div className="space-y-2">
                  <Label className="text-white/75">Email or Staff ID</Label>
                  <Input {...register('email')} placeholder="test@passenger.com or emp001" className="border-white/12 bg-white/5 text-white placeholder:text-white/35" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/75">Password</Label>
                  <Input {...register('password')} type="password" placeholder="Test@1234" className="border-white/12 bg-white/5 text-white placeholder:text-white/35" />
                </div>
                <Button className="w-full">Continue</Button>
                <div className="text-center text-sm text-white/60">
                  Passenger registration lives here. <Link to="/register" className="text-cyan-200 hover:underline">Create account</Link>
                </div>
              </form>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit(submitOtp)}>
                <div className="space-y-2">
                  <Label className="text-white/75">One-time password</Label>
                  <Input {...register('otpCode')} maxLength={6} placeholder="123456" className="border-white/12 bg-white/5 text-center text-2xl tracking-[0.45em] text-white placeholder:text-white/35" />
                </div>
                <Button className="w-full">Verify and enter</Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-white/12 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => {
                    setOtpMode(false);
                    setPendingUserId(null);
                    setPendingRole(null);
                    setServerMessage('');
                    setError('');
                    reset();
                  }}
                >
                  Back
                </Button>
              </form>
            )}
            {pendingRole ? <div className="mt-4 text-center text-xs uppercase tracking-[0.3em] text-cyan-200/70">Awaiting {pendingRole.replace('_', ' ')} verification</div> : null}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function defaultPathForRole(role: string) {
  if (role === 'ADMIN') return '/admin/dashboard';
  if (role === 'AIRPORT_MANAGER') return '/manager/dashboard';
  if (role === 'EMPLOYEE') return '/employee/dashboard';
  return '/my-bookings';
}
