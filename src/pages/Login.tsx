import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import huLogo from '@/assets/hu-logo.png';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowLeft, 
  UserCog, 
  FileText, 
  Utensils,
  Shield,
  Mail,
  KeyRound
} from 'lucide-react';
import { Link } from 'react-router-dom';

type LoginType = 'admin' | 'registrar' | 'cafe';

const loginConfig = {
  admin: {
    title: 'Admin Login',
    description: 'Sign in with Firebase authentication',
    icon: UserCog,
    color: 'bg-amber-500',
    fields: ['email', 'password'],
  },
  registrar: {
    title: 'Registrar Login',
    description: 'Sign in with your email and Staff ID',
    icon: FileText,
    color: 'bg-blue-500',
    fields: ['email', 'staffId'],
  },
  cafe: {
    title: 'Cafe Service Login',
    description: 'Sign in with your email and Staff ID',
    icon: Utensils,
    color: 'bg-green-500',
    fields: ['email', 'staffId'],
  },
};

export default function Login() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: LoginType }>();
  const { signInAdmin, signInStaff } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [staffId, setStaffId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loginType = (type as LoginType) || 'admin';
  const config = loginConfig[loginType];
  const Icon = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (loginType === 'admin') {
        await signInAdmin(email, password);
        toast({
          title: 'Welcome back!',
          description: 'Successfully logged in as Admin.',
        });
        navigate('/admin/dashboard');
      } else {
        const staffRole = loginType === 'registrar' ? 'registrar' : 'cafe_service';
        await signInStaff(email, staffId, staffRole);
        toast({
          title: 'Welcome back!',
          description: `Successfully logged in as ${loginType === 'registrar' ? 'Registrar' : 'Cafe Service'}.`,
        });
        navigate(loginType === 'registrar' ? '/registrar/dashboard' : '/cafe/dashboard');
      }
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'Please check your credentials.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background ethiopian-pattern relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Back button */}
        <div className="absolute top-4 left-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-white flex items-center justify-center shadow-lg overflow-hidden"
            >
              <img src={huLogo} alt="Haramaya University" className="w-16 h-16 object-contain" />
            </motion.div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Haramaya University
            </h1>
            <p className="text-muted-foreground mt-1">
              Smart Meal System
            </p>
          </div>

          <Card variant="elevated" className="shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className={`w-12 h-12 mx-auto mb-3 rounded-xl ${config.color} flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">{config.title}</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@haramaya.edu.et"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Password for Admin */}
                {loginType === 'admin' && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Staff ID for Registrar and Cafe Service */}
                {(loginType === 'registrar' || loginType === 'cafe') && (
                  <div className="space-y-2">
                    <Label htmlFor="staffId" className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-muted-foreground" />
                      Staff ID
                    </Label>
                    {loginType === 'registrar' && (
                      <Input
                        id="staffId"
                        type="text"
                        placeholder="e.g., REG-XXXXX-XXXX"
                        value={staffId}
                        onChange={(e) => setStaffId(e.target.value.toUpperCase())}
                        className="font-mono"
                        required
                      />
                    )}
                    {loginType === 'cafe' && (
                      <Input
                        id="staffId"
                        type="text"
                        placeholder="e.g., CAF-XXXXX-XXXX"
                        value={staffId}
                        onChange={(e) => setStaffId(e.target.value.toUpperCase())}
                        className="font-mono"
                        required
                      />
                    )}
                    <p className="text-xs text-muted-foreground">
                      Your unique Staff ID provided by the Admin
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className={`w-full ${config.color} hover:opacity-90`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <p className="text-center text-xs text-muted-foreground mt-4">
                {loginType === 'admin' 
                  ? 'Contact IT support if you need access credentials'
                  : 'Contact Admin if you need your Staff ID'
                }
              </p>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            © {new Date().getFullYear()} Haramaya University. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
