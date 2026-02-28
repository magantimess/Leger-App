"use client";

import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet } from 'lucide-react';

const Login = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-2xl bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden">
        <CardHeader className="text-center pt-10 pb-6">
          <div className="mx-auto bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
            <Wallet className="text-indigo-600" size={32} />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">Welcome Back</CardTitle>
          <CardDescription className="text-gray-500 mt-2">
            Sign in to manage your daily ledger
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-10">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#4f46e5',
                    brandAccent: '#4338ca',
                  },
                  radii: {
                    buttonRadius: '12px',
                    inputRadius: '12px',
                  }
                }
              }
            }}
            providers={[]}
            theme="light"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;