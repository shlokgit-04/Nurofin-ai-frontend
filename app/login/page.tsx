'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, KeyRound, Mail, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { authService } from '@/services/auth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'vincent@nurofin.com',
      password: 'password123',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await authService.login(data.email, data.password);
      router.push('/dashboard');
    } catch (err) {
      setErrorMsg('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-primary p-4">
      {/* Brand logo card wrapper */}
      <div className="w-full max-w-md bg-background-secondary border border-border-subtle rounded-lg shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center gap-2 mb-2">
            <div className="w-10 h-10 relative overflow-hidden flex items-center justify-center rounded-lg bg-surface-card border border-border-subtle p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/logo-white.svg" 
                alt="N" 
                className="h-9 max-w-none absolute left-1" 
                style={{ clipPath: 'inset(0px 102px 0px 0px)' }}
              />
            </div>
            <span className="font-sans font-bold text-xl text-text-primary tracking-wider">
              Nurofin EOS
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            Enter credentials to access the Executive Operating System.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-accent-red/10 border border-accent-red/30 rounded p-3 text-center text-xs text-accent-red font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email Address
            </label>
            <Input
              type="email"
              placeholder="vincent@nurofin.com"
              {...register('email')}
              className={errors.email ? 'border-accent-red focus-visible:ring-accent-red' : ''}
            />
            {errors.email && (
              <span className="text-[10px] text-accent-red font-medium">{errors.email.message}</span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" /> Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className={errors.password ? 'border-accent-red focus-visible:ring-accent-red' : ''}
            />
            {errors.password && (
              <span className="text-[10px] text-accent-red font-medium">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 mt-2 bg-accent-blue hover:bg-accent-blue-hover text-white rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Login Session'
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <span className="text-[10px] text-text-muted">
            Authorized Personnel Only • TLS 1.3 Certified
          </span>
        </div>
      </div>
    </div>
  );
}
