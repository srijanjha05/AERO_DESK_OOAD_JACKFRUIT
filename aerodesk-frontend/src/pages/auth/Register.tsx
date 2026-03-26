import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserRoundPlus } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AuthResponse } from '@/lib/types';

interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
  gender: string;
  addressLine: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export default function Register() {
  const { register, handleSubmit } = useForm<RegisterForm>();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const submit = async (data: RegisterForm) => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    setAuth(response.data.token ?? '', response.data.role, response.data.userId);
    navigate('/search');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.24),_transparent_35%),linear-gradient(135deg,_#08101f_0%,_#0f1830_45%,_#112149_100%)] px-4 py-10 text-white">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <Card className="border-white/10 bg-white/8 text-white backdrop-blur-2xl">
          <CardHeader>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10">
              <UserRoundPlus className="h-7 w-7 text-cyan-200" />
            </div>
            <CardTitle className="text-3xl">Passenger Registration</CardTitle>
            <CardDescription className="text-white/62">Create your AeroDesk account and move straight into search and booking.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(submit)}>
              <div className="md:col-span-2 space-y-2">
                <Label className="text-white/75">Full name</Label>
                <Input {...register('name')} className="border-white/12 bg-white/5 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/75">Email</Label>
                <Input {...register('email')} type="email" className="border-white/12 bg-white/5 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/75">Phone</Label>
                <Input {...register('phone')} className="border-white/12 bg-white/5 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/75">Passport number</Label>
                <Input {...register('passportNumber')} className="border-white/12 bg-white/5 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/75">Nationality</Label>
                <Input {...register('nationality')} className="border-white/12 bg-white/5 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/75">Date of birth</Label>
                <Input {...register('dateOfBirth')} type="date" className="border-white/12 bg-white/5 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/75">Gender</Label>
                <Input {...register('gender')} placeholder="Male / Female / Other" className="border-white/12 bg-white/5 text-white" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="text-white/75">Address</Label>
                <Input {...register('addressLine')} className="border-white/12 bg-white/5 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/75">Emergency contact name</Label>
                <Input {...register('emergencyContactName')} className="border-white/12 bg-white/5 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/75">Emergency contact phone</Label>
                <Input {...register('emergencyContactPhone')} className="border-white/12 bg-white/5 text-white" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="text-white/75">Password</Label>
                <Input {...register('password')} type="password" className="border-white/12 bg-white/5 text-white" />
              </div>
              <div className="md:col-span-2 flex flex-col gap-3 pt-2">
                <Button>Create account</Button>
                <div className="text-center text-sm text-white/60">
                  Already registered? <Link to="/login" className="text-cyan-200 hover:underline">Sign in</Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
