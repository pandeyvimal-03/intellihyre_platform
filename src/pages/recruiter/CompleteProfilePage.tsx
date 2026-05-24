import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { recruiterProfileService } from '@/services/recruiterProfileService';
import DashboardLayout from '@/layouts/DashboardLayout';

const recruiterProfileSchema = z.object({
  company_name: z.string().min(1, "Company name is required").optional(),
  contact_person_name: z.string().min(1, "Contact person name is required").optional(),
  mobile_no: z.string().optional(),
  company_size: z.string().optional(),
  industry: z.string().optional(),
  company_website: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});

const CompleteRecruiterProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const form = useForm<z.infer<typeof recruiterProfileSchema>>({
    resolver: zodResolver(recruiterProfileSchema),
    defaultValues: {
      company_name: user?.recruiter_profile?.company_name || '',
      contact_person_name: user?.recruiter_profile?.contact_person_name || '',
      mobile_no: user?.recruiter_profile?.mobile_no || '',
      company_size: user?.recruiter_profile?.company_size || '',
      industry: user?.recruiter_profile?.industry || '',
      company_website: user?.recruiter_profile?.company_website || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof recruiterProfileSchema>) => {
    try {
      const updatedProfile = await recruiterProfileService.updateMyProfile(values);
      if (user) {
        setUser({ ...user, recruiter_profile: updatedProfile });
      }
      navigate('/recruiter/dashboard'); // Redirect to dashboard after completion
    } catch (error) {
      console.error('Failed to complete recruiter profile:', error);
      // Handle error
    }
  };

  if (!user || user.role.toLowerCase() !== 'recruiter') {
    navigate('/login'); // Redirect if not logged in as recruiter
    return null;
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Complete Your Recruiter Profile</CardTitle>
            <CardDescription>
              Please provide your company details to start hiring.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  name="contact_person_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Jane Doe" {...field} />
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
                <Button type="submit" className="w-full">Save Profile</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CompleteRecruiterProfilePage;
