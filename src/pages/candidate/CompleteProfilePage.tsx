import React, { useState } from 'react';
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
import { FileUp, CheckCircle2, Cpu, LogOut, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const candidateProfileSchema = z.object({
  skills: z.string().min(2, "Please add some skills"),
  desired_role: z.string().min(2, "Desired role is required"),
  job_mode: z.enum(['REMOTE', 'ONSITE', 'HYBRID', 'ANY']),
});

const CompleteCandidateProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuthStore();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof candidateProfileSchema>>({
    resolver: zodResolver(candidateProfileSchema),
    defaultValues: {
      skills: user?.candidate_profile?.skills || '',
      desired_role: user?.candidate_profile?.desired_role || '',
      job_mode: (user?.candidate_profile?.job_mode as any) || 'ANY',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setUploadError(null);
    } else {
      setUploadError('Please select a valid PDF file.');
    }
  };

  const onSubmit = async (values: z.infer<typeof candidateProfileSchema>) => {
    if (!selectedFile && !user?.candidate_profile?.resume_path) {
      setUploadError('Resume is required to complete your profile.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Update Profile Fields
      const updatedProfile = await candidateProfileService.updateMyProfile(values);
      
      // 2. Upload Resume if new one selected
      let finalProfile = updatedProfile;
      if (selectedFile) {
        finalProfile = await candidateProfileService.uploadResume(selectedFile);
      }

      if (user) {
        setUser({ ...user, candidate_profile: finalProfile });
      }
      navigate('/candidate/dashboard');
    } catch (error) {
      console.error('Submission failed:', error);
      setUploadError('An error occurred during submission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.role.toUpperCase() !== 'CANDIDATE') return null;

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="w-full px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">IntelliHire</span>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 font-bold transition-all">
          <LogOut className="w-4 h-4 mr-2" /> Sign out
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 pb-20">
        <Card className="w-full max-w-2xl shadow-xl border-none">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-bold">Complete Your Profile</CardTitle>
            <CardDescription className="text-base">Provide your professional details to get started.</CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-900">Upload Resume</h2>
                  <div className={cn(
                      "relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 transition-colors",
                      selectedFile ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-primary/50 bg-slate-50/50"
                    )}>
                    <input type="file" id="resume" className="hidden" accept=".pdf" onChange={handleFileChange} />
                    {selectedFile ? (
                      <div className="flex items-center gap-3 text-green-600">
                        <CheckCircle2 className="w-6 h-6" />
                        <span className="font-bold">{selectedFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <FileUp className="w-8 h-8 text-slate-400" />
                        <label htmlFor="resume" className="text-sm font-bold text-primary cursor-pointer hover:underline">Select PDF Resume</label>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-slate-900">Professional Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="desired_role" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">Looking For (Role)</FormLabel>
                        <FormControl><Input placeholder="e.g. Backend Lead" className="h-11 rounded-xl" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="job_mode" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">Preferred Mode</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
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
                  </div>
                  <FormField control={form.control} name="skills" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-slate-700">Skills</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Comma separated skills..." className="min-h-[120px] resize-none rounded-2xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="pt-4">
                  <Button type="submit" size="lg" className="w-full h-14 text-lg font-bold shadow-lg" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processing...</> : "Complete Profile"}
                  </Button>
                </div>
                {uploadError && <p className="text-xs font-bold text-destructive text-center">{uploadError}</p>}
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
      
      <footer className="mt-8 text-center text-xs text-muted-foreground">&copy; 2026 IntelliHire.</footer>
    </div>
  );
};

export default CompleteCandidateProfilePage;
