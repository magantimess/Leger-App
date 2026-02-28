"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Wallet, Loader2, ShieldAlert, UserPlus } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      showSuccess("Welcome back!");
    } catch (error: any) {
      showError("Invalid credentials. Please contact your administrator.");
    } finally {
      setLoading(false);
    }
  };

  const handleSeedAdmin = async () => {
    setSeedLoading(true);
    const adminEmail = "madhu2131@ledger.com";
    const adminPass = "Madhu2131";
    const adminName = "Madhu2131";

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPass);
      const newUser = userCredential.user;

      await updateProfile(newUser, { displayName: adminName });

      await setDoc(doc(db, "users", newUser.uid), {
        email: adminEmail,
        displayName: adminName,
        role: 'admin',
        createdAt: new Date().toISOString()
      });

      showSuccess("Admin account created! You can now log in.");
      setEmail(adminEmail);
      setPassword(adminPass);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        showError("Admin account already exists. Try logging in.");
        setEmail(adminEmail);
        setPassword(adminPass);
      } else {
        showError(error.message);
      }
    } finally {
      setSeedLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-2xl bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden">
        <CardHeader className="text-center pt-10 pb-6">
          <div className="mx-auto bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
            <Wallet className="text-indigo-600" size={32} />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">Daily Ledger</CardTitle>
          <CardDescription className="text-gray-500 mt-2">
            Sign in to access your secure financial dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 text-lg font-semibold mt-4"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-8 space-y-4">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
              <ShieldAlert className="text-amber-600 shrink-0" size={20} />
              <p className="text-xs text-amber-800 leading-relaxed">
                Public registration is disabled. Only an administrator can create new accounts.
              </p>
            </div>

            <Button 
              variant="outline" 
              onClick={handleSeedAdmin}
              disabled={seedLoading}
              className="w-full rounded-xl border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            >
              {seedLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : <UserPlus className="mr-2" size={16} />}
              Setup Initial Admin (Madhu2131)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;