import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Cpu } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated, user: currentUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const role = currentUser.role;
      let redirectTo = `/${role.toLowerCase()}/dashboard`;

      if (role === 'CANDIDATE' && (!currentUser.candidate_profile || !currentUser.candidate_profile.mobile_no)) {
        redirectTo = '/candidate/complete-profile';
      } else if (role === 'RECRUITER' && (!currentUser.recruiter_profile || !currentUser.recruiter_profile.company_name)) {
        redirectTo = '/recruiter/complete-profile';
      }
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      const formData = new FormData();
      formData.append('username', values.email);
      formData.append('password', values.password);

      await authService.login(formData); 
      const user = await authService.me(); // Fetch user after successful login

      setAuth(user); // Set user in store (tokens handled by cookies)
      
      if (user) {
        console.log('User logged in:', user);
        const role = user.role;
        let redirectTo = `/${role.toLowerCase()}/dashboard`;

        // Check if profile is complete
        const isCandidateProfileIncomplete = role === 'CANDIDATE' && (!user.candidate_profile || !user.candidate_profile.mobile_no);
        const isRecruiterProfileIncomplete = role === 'RECRUITER' && (!user.recruiter_profile || !user.recruiter_profile.company_name);

        if (isCandidateProfileIncomplete) {
          redirectTo = '/candidate/complete-profile';
        } else if (isRecruiterProfileIncomplete) {
          redirectTo = '/recruiter/complete-profile';
        }
        
        console.log('Redirecting to:', redirectTo);
        navigate(redirectTo);
      } else {
        console.error('Login successful, but user data not found.');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Cpu className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Log in to IntelliHire</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Logging in...' : 'Log In'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="text-sm text-muted-foreground text-center w-full">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Register
            </Link>
          </div>
          <Link to="/" className="text-xs text-muted-foreground text-center w-full hover:underline">
            Back to Home
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
