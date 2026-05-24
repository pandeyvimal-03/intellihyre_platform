import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { candidateProfileService } from '@/services/candidateProfileService';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Loader2, FileUp, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const candidateProfileSchema = z.object({
  skills: z.string().min(2, "Skills are required"),
  desired_role: z.string().min(2, "Desired role is required"),
  job_mode: z.enum(['REMOTE', 'ONSITE', 'HYBRID', 'ANY']),
});

const CandidateProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof candidateProfileSchema>>({
    resolver: zodResolver(candidateProfileSchema),
    defaultValues: {
      skills: user?.candidate_profile?.skills || '',
      desired_role: user?.candidate_profile?.desired_role || '',
      job_mode: (user?.candidate_profile?.job_mode as any) || 'ANY',
    },
  });

  useEffect(() => {
    if (user?.candidate_profile) {
      form.reset({
        skills: user.candidate_profile.skills || '',
        desired_role: user.candidate_profile.desired_role || '',
        job_mode: (user.candidate_profile.job_mode as any) || 'ANY',
      });
    }
  }, [user, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof candidateProfileSchema>) => {
    setIsSubmitting(true);
    try {
      const updatedProfile = await candidateProfileService.updateMyProfile(values);
      let finalProfile = updatedProfile;

      if (selectedFile) {
        finalProfile = await candidateProfileService.uploadResume(selectedFile);
      }

      if (user) {
        setUser({ ...user, candidate_profile: finalProfile });
      }
      navigate('/candidate/dashboard');
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.role.toUpperCase() !== 'CANDIDATE') {
    navigate('/login');
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Manage your professional preferences and skills.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Resume Section */}
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-900">Resume</label>
                  <div className={cn(
                    "relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 flex flex-col items-center gap-3",
                    selectedFile ? "border-green-200 bg-green-50/50" : "border-slate-200 hover:border-primary/50 bg-slate-50/50"
                  )}>
                    <input type="file" id="resume" className="hidden" accept=".pdf" onChange={handleFileChange} />
                    {selectedFile ? (
                      <div className="flex items-center gap-3 text-green-600 animate-in fade-in duration-300">
                        <CheckCircle2 className="w-6 h-6" />
                        <div className="text-left">
                          <p className="font-bold text-sm">{selectedFile.name}</p>
                          <label htmlFor="resume" className="text-xs font-semibold text-primary hover:underline cursor-pointer">Replace file</label>
                        </div>
                      </div>
                    ) : user?.candidate_profile?.resume_path ? (
                      <div className="text-center space-y-2">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto">
                            <FileUp className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-slate-900">Resume Already Uploaded</p>
                          <a href={`http://localhost:8000${user.candidate_profile.resume_path}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-primary underline hover:text-primary/80">View Current PDF</a>
                        </div>
                        <label htmlFor="resume" className="text-xs font-bold text-slate-400 hover:text-primary cursor-pointer underline block mt-2">Click to replace</label>
                      </div>
                    ) : (
                      <>
                        <FileUp className="w-6 h-6 text-slate-400" />
                        <div className="text-center">
                          <label htmlFor="resume" className="text-sm font-bold text-primary cursor-pointer hover:underline">Click to select PDF resume</label>
                          <p className="text-xs text-slate-400 mt-1">Maximum 10MB</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <FormField control={form.control} name="desired_role" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Looking For (Role)</FormLabel>
                    <FormControl><Input placeholder="e.g. Backend Lead" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="job_mode" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Preferred Mode</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="REMOTE">Remote</SelectItem>
                        <SelectItem value="ONSITE">On-site</SelectItem>
                        <SelectItem value="HYBRID">Hybrid</SelectItem>
                        <SelectItem value="ANY">Open</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="skills" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Skills</FormLabel>
                    <FormControl><Textarea placeholder="Skills (comma separated)" className="min-h-[120px]" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : "Update Profile"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CandidateProfilePage;
