"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const Admin = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');

  if (role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
        <Card className="max-w-md text-center p-8 rounded-3xl border-none shadow-xl">
          <ShieldCheck className="mx-auto text-rose-500 mb-4" size={48} />
          <CardTitle className="text-2xl font-bold mb-2">Access Denied</CardTitle>
          <CardDescription>You do not have permission to view this page.</CardDescription>
          <Button onClick={() => navigate('/')} className="mt-6 rounded-xl">Return Home</Button>
        </Card>
      </div>
    );
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if username already exists
      const q = query(collection(db, "users"), where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        showError("Username already exists.");
        setLoading(false);
        return;
      }

      // Create user document directly in Firestore
      await addDoc(collection(db, "users"), {
        username,
        password, // Storing as requested
        displayName: name,
        role: userRole,
        timestamp: Timestamp.now()
      });
      
      showSuccess(`User ${username} created successfully!`);
      setUsername('');
      setPassword('');
      setName('');
      setUserRole('user');
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')} 
          className="mb-6 rounded-xl hover:bg-white"
        >
          <ArrowLeft className="mr-2" size={18} />
          Back to Dashboard
        </Button>

        <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-indigo-600 text-white p-8">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl">
                <UserPlus size={24} />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">User Management</CardTitle>
                <CardDescription className="text-indigo-100">
                  Create new accounts in the Firestore database
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleAddUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    placeholder="johndoe" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">System Role</Label>
                  <Select value={userRole} onValueChange={(v: any) => setUserRole(v)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Standard User</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input 
                  id="name" 
                  placeholder="John Doe" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="text" 
                  placeholder="Enter password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 text-lg font-semibold"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <UserPlus className="mr-2" size={20} />}
                Create Account
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;