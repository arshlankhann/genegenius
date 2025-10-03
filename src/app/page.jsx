"use client";

import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Upload, FileText, AlertCircle, CheckCircle2, Clock, 
  Download, Mail, Filter, Search, ChevronRight, Home,
  User, Settings, LogOut, Menu, X, RefreshCw, 
  BarChart3, TrendingUp, FileCheck, AlertTriangle, Dna,
  Shield, Info, Activity, Bell, HelpCircle, ChevronDown
} from 'lucide-react';

// Authentication Context
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('genegenius_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('genegenius_user');
      }
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token, user } = res.data;
      setUser(user);
      localStorage.setItem('genegenius_user', JSON.stringify(user));
      localStorage.setItem('genegenius_token', token);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.response?.data?.message || 'Login failed. Please try again.' };
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/signup', { name, email, password });
      setLoading(false);
      return { success: true, message: res.data.message };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.response?.data?.message || 'Signup failed. Please try again.' };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      localStorage.removeItem('genegenius_user');
      localStorage.removeItem('genegenius_token');
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Main Application
export default function GeneGeniusApp() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading GeneGenius...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPages />;
  }

  const navigateTo = (page, data) => {
    setCurrentPage(page);
    if (page === 'job-detail') setSelectedJob(data);
    if (page === 'variant-detail') setSelectedVariant(data);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigateTo('dashboard')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md">
                <Dna className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">GeneGenius</h1>
                <p className="text-xs text-slate-600 font-medium">Clinical Genomics Platform</p>
              </div>
            </button>
            
            <nav className="hidden lg:flex items-center gap-2">
              <NavButton 
                icon={Home} 
                label="Dashboard" 
                active={currentPage === 'dashboard'}
                onClick={() => navigateTo('dashboard')}
              />
              <NavButton 
                icon={Upload} 
                label="Upload" 
                active={currentPage === 'upload'}
                onClick={() => navigateTo('upload')}
              />
              <NavButton 
                icon={Activity} 
                label="Analysis Jobs" 
                active={currentPage === 'jobs'}
                onClick={() => navigateTo('jobs')}
              />
              <NavButton 
                icon={FileText} 
                label="Reports" 
                active={currentPage === 'reports'}
                onClick={() => navigateTo('reports')}
              />
            </nav>

            <div className="flex items-center gap-4">
              <button className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 transition-colors">
                <Bell className="h-5 w-5 text-slate-600" />
              </button>
              <button className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 transition-colors">
                <HelpCircle className="h-5 w-5 text-slate-600" />
              </button>
              <UserMenu user={user} navigateTo={navigateTo} />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <nav className="lg:hidden mt-4 pb-4 space-y-2 border-t border-slate-200 pt-4">
              <MobileNavButton icon={Home} label="Dashboard" onClick={() => navigateTo('dashboard')} />
              <MobileNavButton icon={Upload} label="Upload" onClick={() => navigateTo('upload')} />
              <MobileNavButton icon={Activity} label="Analysis Jobs" onClick={() => navigateTo('jobs')} />
              <MobileNavButton icon={FileText} label="Reports" onClick={() => navigateTo('reports')} />
            </nav>
          )}
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {currentPage === 'dashboard' && <Dashboard navigateTo={navigateTo} />}
        {currentPage === 'upload' && <UploadPage navigateTo={navigateTo} />}
        {currentPage === 'jobs' && <JobsPage navigateTo={navigateTo} />}
        {currentPage === 'job-detail' && <JobDetailPage navigateTo={navigateTo} job={selectedJob} />}
        {currentPage === 'results' && <ResultsPage navigateTo={navigateTo} job={selectedJob} />}
        {currentPage === 'variant-detail' && <VariantDetailPage navigateTo={navigateTo} variant={selectedVariant} />}
        {currentPage === 'reports' && <ReportsPage navigateTo={navigateTo} />}
        {currentPage === 'profile' && <ProfilePage />}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-16 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-slate-600">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm text-slate-600">FDA Validated</span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-slate-600">ACMG Guidelines</span>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              © 2024 GeneGenius. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Navigation Components
function NavButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
        active 
          ? 'bg-blue-50 text-blue-700 shadow-sm' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm">{label}</span>
    </button>
  );
}

function MobileNavButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left hover:bg-slate-100 transition-colors"
    >
      <Icon className="h-5 w-5 text-slate-600" />
      <span className="font-medium text-slate-900">{label}</span>
    </button>
  );
}

function UserMenu({ user, navigateTo }) {
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-3 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors"
      >
        <Avatar className="border-2 border-slate-200">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="bg-blue-600 text-white font-semibold">
            {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-slate-900">{user.name}</p>
          <p className="text-xs text-slate-500">{user.role}</p>
        </div>
        <ChevronDown className="hidden md:block h-4 w-4 text-slate-400" />
      </button>

      {menuOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
              <p className="text-xs text-slate-500 mt-1">{user.institution}</p>
            </div>
            <button
              onClick={() => { navigateTo('profile'); setMenuOpen(false); }}
              className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-slate-50 text-left transition-colors"
            >
              <User className="h-4 w-4 text-slate-600" />
              <span className="text-sm text-slate-700">My Profile</span>
            </button>
            <button
              onClick={() => { navigateTo('settings'); setMenuOpen(false); }}
              className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-slate-50 text-left transition-colors"
            >
              <Settings className="h-4 w-4 text-slate-600" />
              <span className="text-sm text-slate-700">Settings</span>
            </button>
            <div className="border-t border-slate-100 mt-2 pt-2">
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-red-50 text-left transition-colors"
              >
                <LogOut className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600 font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Authentication Pages
function AuthPages() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);
      if (isLogin) {
        const res = await login(formData.email, formData.password);
        setLoading(false);
        if (!res.success) setError(res.error);
      } else {
        // For signup, we now require OTP verification first
        if (!otpRequested) {
          setError('Please request and verify OTP before creating account');
          setLoading(false);
          return;
        }
        
        if (!otp) {
          setError('Please enter the OTP code');
          setLoading(false);
          return;
        }

        // First verify OTP, then create account
        try {
          const otpResponse = await fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email, otp }),
          });
          const otpData = await otpResponse.json();
          
          if (!otpResponse.ok) {
            setError(otpData.message || 'Invalid OTP code');
            setLoading(false);
            return;
          }

          // If OTP is valid, proceed with account creation
          const res = await signup(formData.name, formData.email, formData.password);
          setLoading(false);
          if (res.success) {
            // Account created successfully, switch to login mode
            setIsLogin(true);
            setOtpRequested(false);
            setOtp('');
            setFormData({ name: '', email: '', password: '' });
            setError('');
            // Show success message
            alert('Account created successfully! You can now log in.');
          } else {
            setError(res.error);
          }
        } catch (err) {
          setLoading(false);
          setError('Account creation failed. Please try again.');
        }
      }
    };

    const handleGetOtp = async () => {
      if (!formData.email) {
        setError('Please enter your email address first');
        return;
      }
      
      setOtpLoading(true);
      setOtpError('');
      
      try {
        const response = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
        });
        
        const data = await response.json();
        setOtpLoading(false);
        
        if (response.ok) {
          setOtpRequested(true);
          setError('');
        } else {
          setOtpError(data.message || 'Failed to send OTP');
        }
      } catch (err) {
        setOtpLoading(false);
        setOtpError('Failed to send OTP. Please try again.');
      }
    };

    const handleOtpSubmit = async (e) => {
      e.preventDefault();
      setOtpError('');
      setOtpLoading(true);
      try {
        const response = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, otp }),
        });
        const data = await response.json();
        setOtpLoading(false);
        if (response.ok) {
          setOtpStep(false);
          setIsLogin(true);
        } else {
          setOtpError(data.message || 'OTP verification failed');
        }
      } catch (err) {
        setOtpLoading(false);
        setOtpError('OTP verification failed');
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-slate-200 shadow-xl bg-white">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex justify-center">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg">
                <Dna className="h-10 w-10 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-slate-900">GeneGenius</CardTitle>
              <CardDescription className="text-base text-slate-600 mt-2">
                Clinical Genomics Interpretation Platform
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {!otpStep ? (
              <form onSubmit={handleSubmit} className="space-y-5 ">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required={!isLogin}
                      placeholder="Dr. John Smith"
                      className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="doctor@hospital.com"
                    className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    placeholder="Minimum 8 characters"
                    className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {!isLogin && otpRequested && (
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-sm font-medium text-slate-700">
                      Enter OTP Code
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      placeholder="6-digit code from your email"
                      className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                )}

                {(error || otpError) && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{error || otpError}</span>
                  </div>
                )}

                <Button 
                  type={isLogin ? "submit" : "button"}
                  onClick={isLogin ? undefined : (!otpRequested ? handleGetOtp : handleSubmit)}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm" 
                  disabled={loading || otpLoading}
                >
                  {(loading || otpLoading) ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {isLogin ? 'Sign In' : (!otpRequested ? 'Get OTP' : 'Create Account')}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm font-medium text-slate-700">
                    Enter OTP Code
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    placeholder="6-digit code from your email"
                    className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                {otpError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{otpError}</span>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
                  disabled={otpLoading}
                >
                  {otpLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Verify OTP
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setOtpStep(false);
                  setOtpRequested(false);
                  setOtp('');
                  setOtpError('');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : 'Already have an account? Sign in'}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>HIPAA Compliant</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Secure</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
}

// Dashboard Page
function Dashboard({ navigateTo }) {
  const [stats] = useState({
    totalJobs: 45,
    processing: 3,
    completed: 38,
    failed: 4,
  });

  const [recentJobs] = useState([
    { id: 'job_001', filename: 'patient_sample_001.vcf', status: 'completed', date: '2024-01-15', variants: 234, priority: 'high' },
    { id: 'job_002', filename: 'trio_analysis_002.vcf', status: 'processing', date: '2024-01-16', variants: null, priority: 'urgent' },
    { id: 'job_003', filename: 'wgs_sample_003.vcf', status: 'completed', date: '2024-01-16', variants: 567, priority: 'normal' },
  ]);

  const activityData = [
    { month: 'Aug', jobs: 8 },
    { month: 'Sep', jobs: 12 },
    { month: 'Oct', jobs: 15 },
    { month: 'Nov', jobs: 18 },
    { month: 'Dec', jobs: 22 },
    { month: 'Jan', jobs: 28 },
  ];

  const pathogenicityData = [
    { name: 'Pathogenic', value: 45, color: '#dc2626' },
    { name: 'Likely Pathogenic', value: 32, color: '#ea580c' },
    { name: 'VUS', value: 156, color: '#ca8a04' },
    { name: 'Likely Benign', value: 89, color: '#16a34a' },
    { name: 'Benign', value: 234, color: '#059669' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Clinical Dashboard</h2>
          <p className="text-slate-600 mt-1">Overview of your genomic analysis workflow</p>
        </div>
        <Button 
          onClick={() => navigateTo('upload')}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <Upload className="h-4 w-4 mr-2" />
          New Analysis
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FileCheck}
          title="Total Analyses"
          value={stats.totalJobs}
          subtitle="All time cases"
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={Clock}
          title="In Progress"
          value={stats.processing}
          subtitle="Currently analyzing"
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
        <StatCard
          icon={CheckCircle2}
          title="Completed"
          value={stats.completed}
          subtitle="Successfully analyzed"
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          icon={AlertTriangle}
          title="Requires Review"
          value={stats.failed}
          subtitle="Needs attention"
          color="text-red-600"
          bgColor="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900">Analysis Activity</CardTitle>
            <CardDescription className="text-slate-600">Monthly case volume trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Bar dataKey="jobs" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900">Variant Classification</CardTitle>
            <CardDescription className="text-slate-600">ACMG pathogenicity distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pathogenicityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pathogenicityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900">Recent Cases</CardTitle>
              <CardDescription className="text-slate-600">Latest genomic analyses</CardDescription>
            </div>
            <Button variant="outline" onClick={() => navigateTo('jobs')} className="border-slate-200">
              View All
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <JobListItem key={job.id} job={job} navigateTo={navigateTo} />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900">Start New Analysis</CardTitle>
            <CardDescription className="text-slate-600">Upload VCF file for AI-powered interpretation</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigateTo('upload')}>
              <Upload className="h-4 w-4 mr-2" />
              Upload VCF File
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 ">Clinical Reports</CardTitle>
            <CardDescription className="text-slate-600">Download comprehensive analysis reports</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full border-slate-300" onClick={() => navigateTo('reports')}>
              <FileText className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, subtitle, color, bgColor }) {
  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-xl ${bgColor}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function JobListItem({ job, navigateTo }) {
  const statusConfig = {
    completed: { 
      color: 'text-green-700', 
      bg: 'bg-green-50', 
      border: 'border-green-200',
      icon: CheckCircle2 
    },
    processing: { 
      color: 'text-amber-700', 
      bg: 'bg-amber-50', 
      border: 'border-amber-200',
      icon: Clock 
    },

    
    failed: { 
      color: 'text-red-700', 
      bg: 'bg-red-50', 
      border: 'border-red-200',
      icon: AlertCircle 
    },
  };

  const priorityConfig = {
    urgent: { color: 'text-red-600', bg: 'bg-red-100', label: 'Urgent' },
    high: { color: 'text-orange-600', bg: 'bg-orange-100', label: 'High' },
    normal: { color: 'text-slate-600', bg: 'bg-slate-100', label: 'Normal' },
  };

  const config = statusConfig[job.status];
  const priority = priorityConfig[job.priority];
  const StatusIcon = config.icon;

  return (
    <button
      onClick={() => navigateTo('job-detail', job)}
      className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${config.bg} border ${config.border}`}>
          <StatusIcon className={`h-5 w-5 ${config.color}`} />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-slate-900">{job.filename}</p>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${priority.bg} ${priority.color}`}>
              {priority.label}
            </span>
          </div>
          <p className="text-sm text-slate-500">Case ID: {job.id}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-semibold capitalize ${config.color}`}>{job.status}</p>
        <p className="text-xs text-slate-500 mt-1">{job.date}</p>
        {job.variants && (
          <p className="text-xs text-slate-500">{job.variants} variants</p>
        )}
      </div>
    </button>
  );
}

// Upload Page
function UploadPage({ navigateTo }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = React.useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');

    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileSelect = (e) => {
    setError('');
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const handleSelectButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.vcf')) {
      setError('Only VCF (Variant Call Format) files are accepted');
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) {
      setError('File size must not exceed 100MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploading(false);
            navigateTo('jobs');
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Upload Genomic Data</h2>
        <p className="text-slate-600 mt-1">Submit VCF file for AI-powered clinical interpretation</p>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all  ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
            }`}
          >
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              file ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              {file ? (
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              ) : (
                <Upload className="h-8 w-8 text-blue-600" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {file ? file.name : 'Drop VCF file here'}
            </h3>
            <p className="text-slate-600 mb-6">
              {file 
                ? `File size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`
                : 'or click to browse from your computer'}
            </p>
            
            {!file && (
              <>
                <Button variant="outline" className="cursor-pointer border-slate-300" type="button" onClick={handleSelectButtonClick}>
                  <FileText className="h-4 w-4 mr-2" />
                  Select VCF File
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".vcf"
                  onChange={handleFileSelect}
                  className="hidden"
                  ref={fileInputRef}
                />
              </>
            )}

            {file && !uploading && (
              <div className="flex gap-3 justify-center">
                <Button onClick={handleUpload} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Upload className="h-4 w-4 mr-2" />
                  Start Analysis
                </Button>
                <Button variant="outline" onClick={() => setFile(null)} className="border-slate-300">
                  Remove File
                </Button>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {uploading && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 font-medium">Uploading to secure server...</span>
                <span className="font-semibold text-blue-600">{uploadProgress.toFixed(0)}%</span>
              </div>
              <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">Analysis will begin automatically after upload completes</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-slate-900">File Requirements</CardTitle>
          <CardDescription className="text-slate-600">Ensure your file meets these clinical standards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RequirementItem 
            icon={FileCheck}
            title="File Format"
            description="VCF (Variant Call Format) version 4.0 or higher"
            status="required"
          />
          <RequirementItem 
            icon={TrendingUp}
            title="File Size"
            description="Maximum 100MB per upload (up to 1M variants)"
            status="required"
          />
          <RequirementItem 
            icon={Clock}
            title="Processing Time"
            description="Typical analysis: 5-15 minutes for standard exomes"
            status="info"
          />
          <RequirementItem 
            icon={Shield}
            title="Data Security"
            description="End-to-end encryption, HIPAA compliant storage"
            status="verified"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function RequirementItem({ icon: Icon, title, description, status }) {
  const statusConfig = {
    required: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    info: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    verified: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-start gap-4">
      <div className={`p-2.5 rounded-lg ${config.bg} border ${config.border}`}>
        <Icon className={`h-5 w-5 ${config.color}`} />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-slate-900">{title}</h4>
        <p className="text-sm text-slate-600 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

// Jobs Page
function JobsPage({ navigateTo }) {
  const [jobs] = useState([
    { id: 'GG-2024-001', filename: 'patient_sample_001.vcf', status: 'completed', date: '2024-01-15', variants: 234, size: '45.2 MB', priority: 'high', patient: 'Patient A' },
    { id: 'GG-2024-002', filename: 'trio_analysis_002.vcf', status: 'processing', date: '2024-01-16', variants: null, size: '78.5 MB', priority: 'urgent', patient: 'Family B' },
    { id: 'GG-2024-003', filename: 'wgs_sample_003.vcf', status: 'completed', date: '2024-01-16', variants: 567, size: '92.1 MB', priority: 'normal', patient: 'Patient C' },
  ]);

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = jobs.filter(job => {
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    const matchesSearch = job.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.patient.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 ">
      <div className="flex items-center justify-between ">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Analysis Cases</h2>
          <p className="text-slate-600 mt-1">Manage and monitor your genomic analyses</p>
        </div>
        <Button onClick={() => navigateTo('upload')} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Upload className="h-4 w-4 mr-2" />
          New Analysis
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by case ID, filename, or patient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-slate-200 focus:border-blue-500"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48 border-slate-200 ">
                <Filter className="h-4 w-4 mr-2 " />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="processing">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filteredJobs.map((job) => (
              <DetailedJobCard key={job.id} job={job} navigateTo={navigateTo} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailedJobCard({ job, navigateTo }) {
  const statusConfig = {
    completed: { 
      color: 'text-green-700', 
      bg: 'bg-green-50', 
      border: 'border-green-200',
      icon: CheckCircle2,
      label: 'Completed'
    },
    processing: { 
      color: 'text-amber-700', 
      bg: 'bg-amber-50', 
      border: 'border-amber-200',
      icon: Clock,
      label: 'In Progress'
    },
    failed: { 
      color: 'text-red-700', 
      bg: 'bg-red-50', 
      border: 'border-red-200',
      icon: AlertCircle,
      label: 'Failed'
    },
  };

  const priorityConfig = {
    urgent: { color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300', label: 'URGENT' },
    high: { color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-300', label: 'High Priority' },
    normal: { color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-300', label: 'Normal' },
  };

  const config = statusConfig[job.status];
  const priority = priorityConfig[job.priority];
  const StatusIcon = config.icon;

  return (
    <div className="p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all bg-white">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${config.bg} border ${config.border}`}>
            <StatusIcon className={`h-6 w-6 ${config.color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg text-slate-900">{job.filename}</h3>
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${priority.bg} ${priority.color} border ${priority.border}`}>
                {priority.label}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span className="font-medium">Case ID: {job.id}</span>
              {job.patient && (
                <>
                  <span>•</span>
                  <span>{job.patient}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${config.bg} ${config.color} border ${config.border}`}>
          {config.label}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Submission Date</p>
          <p className="text-sm font-semibold text-slate-900">{job.date}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">File Size</p>
          <p className="text-sm font-semibold text-slate-900">{job.size}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Variants Detected</p>
          <p className="text-sm font-semibold text-slate-900">{job.variants || 'Processing'}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Status</p>
          <p className={`text-sm font-semibold capitalize ${config.color}`}>{job.status}</p>
        </div>
      </div>

      <div className="flex gap-3">
        {job.status === 'completed' && (
          <>
            <Button size="sm" onClick={() => navigateTo('results', job)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <FileCheck className="h-4 w-4 mr-2" />
              View Results
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigateTo('reports')} className="border-slate-300">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </>
        )}
        {job.status === 'processing' && (
          <Button size="sm" onClick={() => navigateTo('job-detail', job)} className="bg-amber-600 hover:bg-amber-700 text-white">
            <Activity className="h-4 w-4 mr-2" />
            Track Progress
          </Button>
        )}
        {job.status === 'failed' && (
          <Button size="sm" variant="destructive">
            <AlertCircle className="h-4 w-4 mr-2" />
            View Error Details
          </Button>
        )}
      </div>
    </div>
  );
}

// Job Detail Page
function JobDetailPage({ navigateTo, job }) {
  const [progress] = useState(65);

  const steps = [
    { id: 'parsing', label: 'VCF Parsing', status: 'completed', description: 'File uploaded and validated' },
    { id: 'annotation', label: 'Variant Annotation', status: 'completed', description: 'ClinVar and gnomAD lookup' },
    { id: 'ai-analysis', label: 'AI Analysis', status: 'processing', description: 'BioBERT interpretation' },
    { id: 'classification', label: 'ACMG Classification', status: 'pending', description: 'Pathogenicity scoring' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Analysis Progress</h2>
          <p className="text-slate-600 mt-1">Case ID: {job?.id || 'GG-2024-002'}</p>
        </div>
        <Button variant="outline" onClick={() => navigateTo('jobs')} className="border-slate-300">
          <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
          Back to Cases
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-slate-900">Real-time Analysis Status</CardTitle>
          <CardDescription className="text-slate-600">{job?.filename || 'trio_analysis_002.vcf'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 font-medium">Overall Progress</span>
              <span className="font-bold text-blue-600">{progress}%</span>
            </div>
            <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">Estimated completion in 8-12 minutes</p>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <ProcessStep
                key={step.id}
                step={step}
                isLast={index === steps.length - 1}
              />
            ))}
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">Currently Processing</p>
                <p className="text-sm text-slate-600 mt-1">
                  BioBERT AI model is analyzing variants against PubMed literature and clinical databases.
                  This step ensures accurate pathogenicity predictions based on latest research.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-slate-900">Case Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">File Name</p>
            <p className="font-semibold text-slate-900">{job?.filename || 'trio_analysis_002.vcf'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">File Size</p>
            <p className="font-semibold text-slate-900">{job?.size || '78.5 MB'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Submission Time</p>
            <p className="font-semibold text-slate-900">2024-01-16 14:23:45</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Processing Started</p>
            <p className="font-semibold text-slate-900">2024-01-16 14:24:12</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProcessStep({ step, isLast }) {
  const statusConfig = {
    completed: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    processing: { icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    pending: { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200' },
  };

  const config = statusConfig[step.status];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-4">
      <div className="relative">
        <div className={`p-3 rounded-lg ${config.bg} border ${config.border}`}>
          <Icon className={`h-5 w-5 ${config.color} ${step.status === 'processing' ? 'animate-spin' : ''}`} />
        </div>
        {!isLast && (
          <div className="absolute left-1/2 top-full h-8 w-0.5 bg-slate-200 transform -translate-x-1/2" />
        )}
      </div>
      <div className="flex-1 pt-2">
        <h4 className="font-semibold text-slate-900">{step.label}</h4>
        <p className="text-sm text-slate-600 mt-0.5">{step.description}</p>
        <p className={`text-xs font-medium capitalize mt-1 ${config.color}`}>{step.status}</p>
      </div>
    </div>
  );
}

// Results Page
function ResultsPage({ navigateTo, job }) {
  const [filterGene, setFilterGene] = useState('');
  const [filterClassification, setFilterClassification] = useState('all');

  const variants = [
    { 
      id: 'var_001', 
      gene: 'BRCA1', 
      position: 'chr17:41245466',
      ref: 'C',
      alt: 'T',
      classification: 'Pathogenic',
      confidence: 0.95,
      frequency: 0.0001,
      impact: 'HIGH'
    },
    {
      id: 'var_002',
      gene: 'TP53',
      position: 'chr17:7577548',
      ref: 'G',
      alt: 'A',
      classification: 'Likely Pathogenic',
      confidence: 0.88,
      frequency: 0.00023,
      impact: 'HIGH'
    },
    {
      id: 'var_003',
      gene: 'APOE',
      position: 'chr19:45411941',
      ref: 'T',
      alt: 'C',
      classification: 'VUS',
      confidence: 0.65,
      frequency: 0.15,
      impact: 'MODERATE'
    },
  ];

  const classificationData = [
    { name: 'Pathogenic', value: 12, color: '#dc2626' },
    { name: 'Likely Pathogenic', value: 18, color: '#ea580c' },
    { name: 'VUS', value: 145, color: '#ca8a04' },
    { name: 'Likely Benign', value: 34, color: '#16a34a' },
    { name: 'Benign', value: 25, color: '#059669' },
  ];

  const filteredVariants = variants.filter(variant => {
    const matchesGene = !filterGene || variant.gene.toLowerCase().includes(filterGene.toLowerCase());
    const matchesClass = filterClassification === 'all' || variant.classification === filterClassification;
    return matchesGene && matchesClass;
  });

  return (
    <div className="space-y-8 ">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Clinical Analysis Results</h2>
          <p className="text-slate-600 mt-1">Case: {job?.filename || 'patient_sample_001.vcf'}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigateTo('reports')} className="border-slate-300">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
          <Button onClick={() => navigateTo('jobs')} className="bg-blue-600 hover:bg-blue-700 text-white">
            Back to Cases
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900">ACMG Classification</CardTitle>
            <CardDescription className="text-slate-600">Pathogenicity distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={classificationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {classificationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900">Summary Statistics</CardTitle>
            <CardDescription className="text-slate-600">Key clinical metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SummaryItem label="Total Variants Analyzed" value="234" />
            <SummaryItem label="Pathogenic/Likely Pathogenic" value="30" color="text-red-600" />
            <SummaryItem label="Variants of Uncertain Significance" value="145" color="text-amber-600" />
            <SummaryItem label="Benign/Likely Benign" value="59" color="text-green-600" />
            <SummaryItem label="Average Confidence Score" value="76%" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-slate-900">Variant Details</CardTitle>
          <CardDescription className="text-slate-600">Comprehensive analysis results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Filter by gene name..."
              value={filterGene}
              onChange={(e) => setFilterGene(e.target.value)}
              className="flex-1 border-slate-200"
            />
            <Select value={filterClassification} onValueChange={setFilterClassification}>
              <SelectTrigger className="w-full md:w-64 border-slate-200">
                <SelectValue placeholder="Filter by classification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classifications</SelectItem>
                <SelectItem value="Pathogenic">Pathogenic</SelectItem>
                <SelectItem value="Likely Pathogenic">Likely Pathogenic</SelectItem>
                <SelectItem value="VUS">VUS</SelectItem>
                <SelectItem value="Likely Benign">Likely Benign</SelectItem>
                <SelectItem value="Benign">Benign</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredVariants.map((variant) => (
              <VariantCard key={variant.id} variant={variant} navigateTo={navigateTo} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryItem({ label, value, color = 'text-slate-900' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-lg font-bold ${color}`}>{value}</span>
    </div>
  );
}

function VariantCard({ variant, navigateTo }) {
  const classColors = {
    'Pathogenic': 'text-red-700 bg-red-50 border-red-200',
    'Likely Pathogenic': 'text-orange-700 bg-orange-50 border-orange-200',
    'VUS': 'text-amber-700 bg-amber-50 border-amber-200',
    'Likely Benign': 'text-green-700 bg-green-50 border-green-200',
    'Benign': 'text-green-800 bg-green-50 border-green-200',
  };

  return (
    <button
      onClick={() => navigateTo('variant-detail', variant)}
      className="w-full p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all text-left bg-white"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-1">{variant.gene}</h3>
          <p className="text-sm text-slate-600">{variant.position}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${classColors[variant.classification]}`}>
          {variant.classification}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Reference</p>
          <p className="text-sm font-semibold text-slate-900">{variant.ref}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Alternate</p>
          <p className="text-sm font-semibold text-slate-900">{variant.alt}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Impact</p>
          <p className="text-sm font-semibold text-slate-900">{variant.impact}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Frequency</p>
          <p className="text-sm font-semibold text-slate-900">{(variant.frequency * 100).toFixed(4)}%</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 font-medium">AI Confidence Score</span>
          <span className="font-bold text-blue-600">{(variant.confidence * 100).toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
            style={{ width: `${variant.confidence * 100}%` }}
          />
        </div>
      </div>
    </button>
  );
}

// Variant Detail Page
function VariantDetailPage({ navigateTo, variant }) {
  const variantData = variant || {
    gene: 'BRCA1',
    position: 'chr17:41245466',
    ref: 'C',
    alt: 'T',
    classification: 'Pathogenic',
    confidence: 0.95,
    frequency: 0.0001,
    impact: 'HIGH',
    transcript: 'NM_007294.3',
    protein: 'p.Arg1443Ter',
    consequence: 'stop_gained',
  };

  const acmgCriteria = [
    { code: 'PVS1', description: 'Null variant in a gene where loss of function is known mechanism', strength: 'Very Strong' },
    { code: 'PS3', description: 'Well-established functional studies show damaging effect', strength: 'Strong' },
    { code: 'PM2', description: 'Absent from controls in population databases', strength: 'Moderate' },
    { code: 'PP3', description: 'Multiple computational evidence support deleterious effect', strength: 'Supporting' },
  ];

  const populationData = [
    { database: 'gnomAD', frequency: 0.0001, samples: 125748 },
    { database: 'ExAC', frequency: 0.00012, samples: 60706 },
    { database: 'ClinVar', classification: 'Pathogenic', submissions: 12 },
  ];

  const pubmedRefs = [
    { pmid: '12345678', title: 'Functional analysis of BRCA1 variants in breast cancer susceptibility', year: '2023' },
    { pmid: '87654321', title: 'Clinical implications of BRCA1 mutations in hereditary cancer syndromes', year: '2022' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 ">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Variant Clinical Report</h2>
          <p className="text-slate-600 mt-1">{variantData.gene} - {variantData.position}</p>
        </div>
        <Button variant="outline" onClick={() => navigateTo('results')} className="border-slate-300">
          <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
          Back to Results
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900">Variant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <DetailItem label="Gene Symbol" value={variantData.gene} />
              <DetailItem label="Genomic Position" value={variantData.position} />
              <DetailItem label="Reference Allele" value={variantData.ref} />
              <DetailItem label="Alternate Allele" value={variantData.alt} />
              <DetailItem label="Transcript ID" value={variantData.transcript} />
              <DetailItem label="Protein Change" value={variantData.protein} />
              <DetailItem label="Consequence Type" value={variantData.consequence} />
              <DetailItem label="Clinical Impact" value={variantData.impact} />
            </div>

            <div className="pt-6 border-t border-slate-200">
              <h4 className="font-bold text-slate-900 mb-4">ACMG Classification Criteria</h4>
              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <span className="text-lg font-bold text-slate-900">{variantData.classification}</span>
                <span className="text-sm font-medium text-slate-600">AI Confidence: {(variantData.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="space-y-3">
                {acmgCriteria.map((criteria) => (
                  <div key={criteria.code} className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                      {criteria.code}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-slate-900 font-medium">{criteria.description}</p>
                      <p className="text-xs text-slate-600 mt-1">Evidence Strength: {criteria.strength}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-slate-900">AI Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-6xl font-bold text-blue-600 mb-2">
                  {(variantData.confidence * 100).toFixed(0)}%
                </div>
                <p className="text-sm text-slate-600">Classification Confidence</p>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                  style={{ width: `${variantData.confidence * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-3 text-center">
                Based on BioBERT AI model analysis
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Clinical Action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">High Priority Variant</p>
                  <p className="text-xs text-slate-600 mt-1">Requires immediate clinical review</p>
                </div>
              </div>
              <div className="text-xs text-slate-600 space-y-2 pt-3 border-t border-red-200">
                <p>• Genetic counseling recommended</p>
                <p>• Consider family screening</p>
                <p>• Review preventive measures</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-slate-900">Population Frequency Data</CardTitle>
          <CardDescription className="text-slate-600">Allele frequencies from public databases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {populationData.map((data, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50">
                <div>
                  <p className="font-semibold text-slate-900">{data.database}</p>
                  {data.samples && (
                    <p className="text-sm text-slate-600">{data.samples.toLocaleString()} samples analyzed</p>
                  )}
                </div>
                <div className="text-right">
                  {data.frequency !== undefined && (
                    <p className="font-bold text-slate-900">{(data.frequency * 100).toFixed(4)}%</p>
                  )}
                  {data.classification && (
                    <>
                      <p className="text-sm font-medium text-red-600">{data.classification}</p>
                      <p className="text-xs text-slate-500">{data.submissions} submissions</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-slate-900">Supporting Literature</CardTitle>
          <CardDescription className="text-slate-600">PubMed references identified by BioBERT AI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pubmedRefs.map((ref) => (
              <div key={ref.pmid} className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900 flex-1">{ref.title}</h4>
                  <span className="text-sm text-slate-500 ml-4">{ref.year}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-600">PMID: {ref.pmid}</span>
                  <Button size="sm" variant="outline" className="border-slate-300">
                    <FileText className="h-3 w-3 mr-2" />
                    View Article
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
      <p className="font-semibold text-slate-900">{value}</p>
    </div>
  );
}

// Reports Page
function ReportsPage({ navigateTo }) {
  const [reports] = useState([
    { 
      id: 'rep_001', 
      jobId: 'GG-2024-001', 
      filename: 'patient_sample_001.vcf',
      generatedDate: '2024-01-15',
      variants: 234,
      pathogenic: 12,
      patient: 'Patient A',
    },
    { 
      id: 'rep_003', 
      jobId: 'GG-2024-003', 
      filename: 'wgs_sample_003.vcf',
      generatedDate: '2024-01-16',
      variants: 567,
      pathogenic: 23,
      patient: 'Patient C',
    },
  ]);

  return (
    <div className="space-y-8 ">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 ">Clinical Reports</h2>
        <p className="text-slate-600 mt-1">Download and manage your genomic analysis reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="pt-6 ">
            <div className="text-center">
              <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <p className="text-4xl font-bold text-slate-900 mb-1">{reports.length}</p>
              <p className="text-sm text-slate-600">Total Reports Generated</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <Download className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-4xl font-bold text-slate-900 mb-1">156</p>
              <p className="text-sm text-slate-600">Total Downloads</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <p className="text-4xl font-bold text-slate-900 mb-1">23</p>
              <p className="text-sm text-slate-600">Reports Emailed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-slate-900">Available Reports</CardTitle>
          <CardDescription className="text-slate-600">Download or share your clinical reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportCard({ report }) {
  const handleDownload = (format) => {
    console.log(`Downloading ${format} report for ${report.id}`);
  };

  const handleEmail = () => {
    console.log(`Emailing report ${report.id}`);
  };

  return (
    <div className="p-6 rounded-xl border border-slate-200 hover:shadow-md transition-all bg-white">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">{report.filename}</h3>
            <div className="flex items-center gap-3 text-sm text-slate-600 mt-1">
              <span>Report ID: {report.id}</span>
              <span>•</span>
              <span>{report.patient}</span>
            </div>
          </div>
        </div>
        <span className="text-sm text-slate-500">{report.generatedDate}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Case ID</p>
          <p className="text-sm font-semibold text-slate-900">{report.jobId}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Total Variants</p>
          <p className="text-sm font-semibold text-slate-900">{report.variants}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Pathogenic</p>
          <p className="text-sm font-semibold text-red-600">{report.pathogenic}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Generated</p>
          <p className="text-sm font-semibold text-slate-900">{report.generatedDate}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button size="sm" onClick={() => handleDownload('pdf')} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Download className="h-4 w-4 mr-2" />
          PDF Report
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleDownload('csv')} className="border-slate-300">
          <Download className="h-4 w-4 mr-2" />
          CSV Data
        </Button>
        <Button size="sm" variant="outline" onClick={handleEmail} className="border-slate-300">
          <Mail className="h-4 w-4 mr-2" />
          Email
        </Button>
      </div>
    </div>
  );
}

// Profile Page
function ProfilePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    institution: user?.institution || '',
    specialization: '',
    phone: '',
    license: '',
    notifications: true,
    emailReports: true,
  });

  const handleSave = () => {
    console.log('Saving profile:', formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Profile Settings</h2>
        <p className="text-slate-600 mt-1">Manage your account information and preferences</p>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-slate-900">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-slate-200">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="text-2xl bg-blue-600 text-white font-bold">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm" className="border-slate-300">
                <Upload className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
              <p className="text-sm text-slate-500 mt-2">JPG or PNG. Maximum size 2MB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution" className="text-sm font-medium text-slate-700">Institution</Label>
              <Input
                id="institution"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                placeholder="Hospital or Research Center"
                className="border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialization" className="text-sm font-medium text-slate-700">Specialization</Label>
              <Select 
                value={formData.specialization} 
                onValueChange={(value) => setFormData({ ...formData, specialization: value })}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clinical-genetics">Clinical Genetics</SelectItem>
                  <SelectItem value="oncology">Oncology</SelectItem>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="license" className="text-sm font-medium text-slate-700">Medical License</Label>
              <Input
                id="license"
                value={formData.license}
                onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                placeholder="License Number"
                className="border-slate-200"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-slate-900">Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-semibold text-slate-900">Email Notifications</p>
              <p className="text-sm text-slate-600">Receive updates about analysis completion</p>
            </div>
            <input
              type="checkbox"
              checked={formData.notifications}
              onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
              className="h-5 w-5 text-blue-600"
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-semibold text-slate-900">Auto-email Reports</p>
              <p className="text-sm text-slate-600">Automatically send reports when ready</p>
            </div>
            <input
              type="checkbox"
              checked={formData.emailReports}
              onChange={(e) => setFormData({ ...formData, emailReports: e.target.checked })}
              className="h-5 w-5 text-blue-600"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-slate-900">Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full border-slate-300">
            <Settings className="h-4 w-4 mr-2" />
            Change Password
          </Button>
          <Button variant="outline" className="w-full border-slate-300">
            <Shield className="h-4 w-4 mr-2" />
            Enable Two-Factor Authentication
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
