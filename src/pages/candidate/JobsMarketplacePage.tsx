import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Briefcase } from 'lucide-react';
import { jobService } from '@/services/jobService';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { applicationService } from '@/services/applicationService';

const JobsMarketplacePage = () => {
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['active-jobs'],
    queryFn: jobService.getAll,
  });

  const handleApply = async () => {
    if (!selectedJob) return;
    setIsApplying(true);
    try {
      await applicationService.apply(selectedJob);
      setSelectedJob(null);
      alert('Application submitted successfully using your profile resume!');
    } catch (error) {
      console.error('Failed to apply:', error);
      alert('Failed to apply. Please ensure your profile is complete.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Explore Opportunities</h1>
          <p className="text-muted-foreground">Find the perfect role matched for your skills.</p>
        </div>

        <div className="flex items-center gap-4 bg-background p-4 rounded-lg border shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search jobs, companies, or keywords..." className="pl-10" />
          </div>
          <Button>Search</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-20">Loading jobs...</div>
          ) : jobs?.length === 0 ? (
            <div className="col-span-full text-center py-20">No active jobs found. Check back later!</div>
          ) : (
            jobs?.map((job) => (
              <Card key={job.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <Badge variant="outline">Open</Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Briefcase className="w-3 h-3" />
                    Full-time • {job.experience_required}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {job.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.skills_required.split(',').map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-[10px]">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/20 p-4">
                  <Dialog open={selectedJob === job.id} onOpenChange={(open) => !open && setSelectedJob(null)}>
                    <DialogTrigger asChild>
                      <Button className="w-full" onClick={() => setSelectedJob(job.id)}>Apply Now</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Application</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to apply for the <strong>{job.title}</strong> role? We will automatically use your existing profile resume for this application.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedJob(null)}>Cancel</Button>
                        <Button onClick={handleApply} disabled={isApplying}>
                            {isApplying ? 'Applying...' : 'Confirm & Apply'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobsMarketplacePage;
