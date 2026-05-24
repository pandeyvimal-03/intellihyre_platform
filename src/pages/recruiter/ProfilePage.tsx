import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Assuming Textarea is needed for description, etc.
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { recruiterProfileService } from '@/services/recruiterProfileService';
import DashboardLayout from '@/layouts/DashboardLayout';
import { User } from '@/store/authStore';

const recruiterProfileSchema = z.object({
  name: z.string().min(2, "Contact person name is required"), // User's name
  email: z.string().email("Invalid email address"), // User's email
  company_name: z.string().min(1, "Company name is required").optional().or(z.literal('')),
  contact_person_name: z.string().min(1, "Contact person name is required").optional().or(z.literal('')),
  mobile_no: z.string().optional().or(z.literal('')),
  company_size: z.string().optional().or(z.literal('')),
  industry: z.string().optional().or(z.literal('')),
  company_website: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});

const RecruiterProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const form = useForm<z.infer<typeof recruiterProfileSchema>>({
    resolver: zodResolver(recruiterProfileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      company_name: user?.recruiter_profile?.company_name || '',
      contact_person_name: user?.recruiter_profile?.contact_person_name || '',
      mobile_no: user?.recruiter_profile?.mobile_no || '',
      company_size: user?.recruiter_profile?.company_size || '',
      industry: user?.recruiter_profile?.industry || '',
      company_website: user?.recruiter_profile?.company_website || '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
        email: user.email || '',
        company_name: user.recruiter_profile?.company_name || '',
        contact_person_name: user.recruiter_profile?.contact_person_name || '',
        mobile_no: user.recruiter_profile?.mobile_no || '',
        company_size: user.recruiter_profile?.company_size || '',
        industry: user.recruiter_profile?.industry || '',
        company_website: user.recruiter_profile?.company_website || '',
      });
    }
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof recruiterProfileSchema>) => {
    if (!user) return;
    try {
      // Update user's name (if changed)
      if (user.name !== values.name) {
        // This would require a separate user update endpoint, if applicable
        // For now, only profile details are handled here
      }

      // Update recruiter profile
      const updatedProfile = await recruiterProfileService.updateMyProfile({
        company_name: values.company_name,
        contact_person_name: values.contact_person_name,
        mobile_no: values.mobile_no,
        company_size: values.company_size,
        industry: values.industry,
        company_website: values.company_website,
      });
      
      setUser({ ...user, recruiter_profile: updatedProfile });
      // Optionally show success message
      navigate('/recruiter/dashboard'); // Or stay on profile page with a message
    } catch (error) {
      console.error('Failed to update recruiter profile:', error);
      // Handle error
    }
  };

  if (!user || user.role !== 'RECRUITER') {
    navigate('/login');
    return null;
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>My Recruiter Profile</CardTitle>
            <CardDescription>
              Manage your company and contact details.
            </CardDescription>
          </CardHeader>
          <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Person Name</FormLabel>
                          <FormControl>
                            <Input {...field} disabled /> {/* Name is part of User, not RecruiterProfile */}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} disabled /> {/* Email is part of User, not RecruiterProfile */}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="company_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Acme Corp" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mobile_no"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., +15551234567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="company_size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Size</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 1-10, 10-50, 50+" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Software, Finance, Healthcare" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="company_website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Website</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., https://www.acmecorp.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">Update Profile</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      );
    };

    export default RecruiterProfilePage;
