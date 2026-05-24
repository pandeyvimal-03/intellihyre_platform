import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { jobService, JobStatus } from '@/services/jobService';
import { applicationService, ApplicationStatus } from '@/services/applicationService';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserCheck, CalendarClock, LayoutGrid, MapPin, Briefcase } from 'lucide-react';

const JobDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: job, isLoading: isJobLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobService.getById(Number(id)),
  });

  const { data: applications, isLoading: isAppsLoading } = useQuery({
    queryKey: ['job-applications', id],
    queryFn: () => applicationService.getJobApplications(Number(id)),
  });

  const handleDeactivate = async () => {
    if (confirm('Are you sure you want to close this job?')) {
        await jobService.deactivate(Number(id));
        navigate('/recruiter/jobs');
    }
  };

  if (isJobLoading || isAppsLoading) return <DashboardLayout><div>Loading...</div></DashboardLayout>;
  if (!job) return <DashboardLayout><div>Job not found</div></DashboardLayout>;

  const apps = applications || [];
  const shortlisted = apps.filter(a => (a.match_score || 0) > 60);
  const scheduled = apps.filter(a => a.status === ApplicationStatus.INTERVIEW_SCHEDULED);

  const ApplicationRow = ({ app }: { app: any }) => (
    <Card className="p-4 flex justify-between items-center">
        <div>
            <p className="font-bold text-slate-900">Candidate #{app.candidate_id}</p>
            <p className="text-xs text-slate-500">Match Score: {app.match_score?.toFixed(1)}%</p>
        </div>
        <div className='flex gap-2 items-center'>
            <Badge variant="outline">{app.status}</Badge>
            <Button size="sm" variant="secondary">View Resume</Button>
        </div>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-start">
            <div className="space-y-1">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{job.title}</h1>
                <div className="flex items-center gap-4 text-slate-500 font-medium">
                    <span>{job.organization_name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {job.location}</span>
                </div>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate(`/recruiter/jobs/${id}/edit`)}>Edit</Button>
                {job.status === JobStatus.ACTIVE && <Button variant="destructive" onClick={handleDeactivate}>Close Job</Button>}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
                { label: 'Total Applicants', value: apps.length, icon: Users },
                { label: 'Shortlisted (>60%)', value: shortlisted.length, icon: UserCheck },
                { label: 'Scheduled Interviews', value: scheduled.length, icon: CalendarClock },
                { label: 'Avg Match Score', value: `${(apps.reduce((a, b) => a + (b.match_score || 0), 0) / (apps.length || 1)).toFixed(0)}%`, icon: LayoutGrid }
            ].map(stat => (
                <Card key={stat.label} className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl"><stat.icon className="w-5 h-5"/></div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-2xl font-extrabold">{stat.value}</p>
                    </div>
                </Card>
            ))}
        </div>

        <Tabs defaultValue="applications">
            <TabsList>
                <TabsTrigger value="applications">All Applications ({apps.length})</TabsTrigger>
                <TabsTrigger value="shortlisted">Shortlisted ({shortlisted.length})</TabsTrigger>
                <TabsTrigger value="interviews">Scheduled Interviews ({scheduled.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="applications" className="space-y-4 pt-4">
                {apps.map(app => <ApplicationRow key={app.id} app={app} />)}
            </TabsContent>
            <TabsContent value="shortlisted" className="space-y-4 pt-4">
                {shortlisted.map(app => <ApplicationRow key={app.id} app={app} />)}
            </TabsContent>
            <TabsContent value="interviews" className="space-y-4 pt-4">
                {scheduled.map(app => <ApplicationRow key={app.id} app={app} />)}
            </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default JobDetailsPage;
