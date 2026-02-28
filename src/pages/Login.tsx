"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { ThemeToggle } from "@/components/ThemeToggle";

const Login = () => {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 transition-colors duration-300 relative">
      <div className="absolute top-8 right-8">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md border-none shadow-2xl bg-card/80 backdrop-blur-md rounded-3xl overflow-hidden">
        <CardHeader className="text-center pt-10 pb-6">
          <div className="mx-auto mb-6">
            <img 
              src="https://wskwblytqmyjqcgsxeky.supabase.co/storage/v1/object/public/project_assets/maganti_logo.png" 
              alt="MagantiMess Logo" 
              className="w-32 h-32 object-contain rounded-full shadow-lg border-4 border-indigo-500/20"
            />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">MagantiMess Ledger</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Sign in using your organization credentials
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
                className="rounded-xl bg-background border-border"
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
                className="rounded-xl bg-background border-border"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 text-lg font-semibold mt-4 transition-all"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;