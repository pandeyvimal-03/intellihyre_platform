import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { jobService, JobStatus } from '@/services/jobService';
import DashboardLayout from '@/layouts/DashboardLayout';

const jobSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  organization_name: z.string().min(2, 'Organization name is required'),
  role: z.string().min(2, 'Role is required'),
  work_mode: z.enum(['REMOTE', 'ONSITE', 'HYBRID', 'ANY']),
  location: z.string().min(2, 'Location is required'),
  salary_range: z.string().min(1, 'Salary range is required'),
  experience_required: z.coerce.number().min(0, 'Experience (in years) must be a number'),
  skills_required: z.string().min(3, 'Skills are required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
});

const PostJobPage = () => {
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof jobSchema>>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      organization_name: '',
      role: '',
      work_mode: 'ANY',
      location: '',
      salary_range: '',
      experience_required: 0 as any,
      skills_required: '',
      description: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof jobSchema>) => {
    try {
      await jobService.create({
        ...values,
        experience_required: values.experience_required.toString(),
        status: JobStatus.ACTIVE,
      });
      navigate('/recruiter/jobs');
    } catch (error) {
      console.error('Failed to post job:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Post a New Job</CardTitle>
            <CardDescription>
              Provide detailed information about the role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl><Input placeholder="e.g. Senior Backend Dev" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="organization_name" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Organization Name</FormLabel>
                            <FormControl><Input placeholder="e.g. Google" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="role" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Role Category</FormLabel>
                            <FormControl><Input placeholder="e.g. Engineering" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="work_mode" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Work Mode</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="REMOTE">Remote</SelectItem>
                                    <SelectItem value="ONSITE">On-site</SelectItem>
                                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                                    <SelectItem value="ANY">Any</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="location" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl><Input placeholder="e.g. Remote / New York" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="salary_range" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Salary Range</FormLabel>
                            <FormControl><Input placeholder="e.g. 100000-150000" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                <FormField control={form.control} name="experience_required" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Experience Required (Years)</FormLabel>
                        <FormControl><Input type="number" step="0.1" placeholder="e.g. 3.5" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="skills_required" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Skills</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. React, Python, AWS" {...field} />
                    </FormControl>
                    <FormDescription>Separate skills with commas.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Explain responsibilities, requirements, and culture..." className="min-h-[150px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Posting...' : 'Post Job'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PostJobPage;
