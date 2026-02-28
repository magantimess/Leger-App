"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Wallet, Loader2, ShieldAlert, UserPlus } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const Login = () => {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  
  const [username, setUsername] = useState('');
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
      // Query the custom users collection
      const q = query(
        collection(db, "users"), 
        where("username", "==", username),
        where("password", "==", password)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        
        signIn({
          id: userDoc.id,
          username: userData.username,
          role: userData.role,
          displayName: userData.displayName || userData.username
        });
        
        showSuccess("Welcome back!");
      } else {
        showError("Invalid username or password.");
      }
    } catch (error: any) {
      showError("Database error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedAdmin = async () => {
    setSeedLoading(true);
    const adminUsername = "Madhu2131";
    const adminPass = "Madhu2131";

    try {
      // Check if admin already exists in the collection
      const q = query(collection(db, "users"), where("username", "==", adminUsername));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        await addDoc(collection(db, "users"), {
          username: adminUsername,
          password: adminPass,
          displayName: adminUsername,
          role: 'admin',
          timestamp: Timestamp.now()
        });
        showSuccess("Admin account created in Firestore!");
      } else {
        showError("Admin account already exists.");
      }
      
      setUsername(adminUsername);
      setPassword(adminPass);
    } catch (error: any) {
      showError(error.message);
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
            Sign in using your Firestore credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                type="text" 
                placeholder="Enter your username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                Authentication is now handled via the Firestore "users" collection.
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