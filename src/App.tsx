import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Plus, Cpu } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/layouts/DashboardLayout';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import JobsListPage from '@/pages/recruiter/JobsListPage';
import PostJobPage from '@/pages/recruiter/PostJobPage';
import JobDetailsPage from '@/pages/recruiter/JobDetailsPage';
import EditJobPage from '@/pages/recruiter/EditJobPage';
import RecruiterApplicationsPage from '@/pages/recruiter/ApplicationsListPage';
import InterviewSessionPage from '@/pages/candidate/InterviewSessionPage';
import JobsMarketplacePage from '@/pages/candidate/JobsMarketplacePage';
import CandidateApplicationsPage from '@/pages/candidate/CandidateApplicationsPage';
import CompleteCandidateProfilePage from '@/pages/candidate/CompleteProfilePage';
import CandidateProfilePage from '@/pages/candidate/ProfilePage';
import CompleteRecruiterProfilePage from '@/pages/recruiter/CompleteProfilePage';
import RecruiterProfilePage from '@/pages/recruiter/ProfilePage';
import { jobService, Job } from '@/services/jobService';
import { applicationService } from '@/services/applicationService';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import api from '@/services/api';

const CandidateDashboard = () => {
  const { user } = useAuthStore();
  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: applicationService.getMyApplications,
  });

  const profileCompletion = user?.candidate_profile?.resume_path && user?.candidate_profile?.skills ? 100 : 50;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}!</h1>
                <p className="text-muted-foreground">Here is a snapshot of your job search progress.</p>
            </div>
            <Link to="/candidate/jobs">
                <Button>Explore New Jobs</Button>
            </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-card rounded-xl border shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Profile Completeness</p>
            <div className="flex items-end gap-2 mt-2">
                <p className="text-3xl font-bold">{profileCompletion}%</p>
                {profileCompletion < 100 && <Link to="/candidate/profile" className="text-xs text-primary font-bold underline">Improve Profile</Link>}
            </div>
          </div>
          <div className="p-6 bg-card rounded-xl border shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Active Applications</p>
            <p className="text-3xl font-bold mt-2">{applications?.length || 0}</p>
          </div>
          <div className="p-6 bg-card rounded-xl border shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Interviews Scheduled</p>
            <p className="text-3xl font-bold mt-2">
                {applications?.filter(a => a.status === 'INTERVIEW_SCHEDULED').length || 0}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Recent Applications</h2>
          <div className="bg-card rounded-xl border shadow-sm p-6">
            {isLoading ? (
              <p className="text-center text-muted-foreground">Loading applications...</p>
            ) : applications && applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map(app => (
                    <div key={app.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                        <div>
                            <p className="font-bold">Application for Job #{app.job_id}</p>
                            <p className="text-xs text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</p>
                        </div>
                        <Badge>{app.status}</Badge>
                    </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">You haven't applied to any jobs yet.</p>
                <Link to="/candidate/jobs"><Button variant="outline">Start Searching</Button></Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const jobColumns: ColumnDef<Job>[] = [
  { accessorKey: "title", header: "Job Title", cell: ({ row }) => (<div className="flex flex-col"><span className="font-medium">{row.original.title}</span></div>) },
  { accessorKey: "status", header: "Status", cell: ({ row }) => (<Badge variant={String(row.original.status) === 'active' ? 'default' : 'secondary'}>{row.original.status}</Badge>) },
  { accessorKey: "experience_required", header: "Experience" },
];

const RecruiterDashboard = () => {
  const { data: jobs, isLoading: isJobsLoading } = useQuery({ 
    queryKey: ['jobs'], 
    queryFn: jobService.getAll 
  });
  const { data: applications, isLoading: isAppsLoading } = useQuery({ 
    queryKey: ['all-applications'], 
    queryFn: applicationService.getAllApplications 
  });

  const activeJobs = jobs?.filter(j => j.status === 'ACTIVE') || [];
  const sortedJobs = [...(jobs || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  const totalApps = applications?.length || 0;
  const avgMatch = applications && applications.length > 0 
    ? (applications.reduce((acc, app) => acc + (app.match_score || 0), 0) / applications.length).toFixed(1) 
    : '0';

  const stats = [
    { label: 'Active Postings', value: activeJobs.length, color: 'text-emerald-600' },
    { label: 'Total Applications', value: totalApps, color: 'text-indigo-600' },
    { label: 'Average Match Score', value: `${avgMatch}%`, color: 'text-blue-600' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 p-1">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Recruiter Overview</h1>
                <p className="text-slate-500 font-medium mt-1">Manage active roles and track candidate pipelines.</p>
            </div>
            <Link to="/recruiter/jobs/new">
                <Button className="h-12 px-6 font-bold rounded-xl shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Post New Job
                </Button>
            </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="p-7 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
              <p className={`text-4xl font-extrabold mt-3 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Recent Job Postings</h2>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {isJobsLoading ? (
              <div className="p-12 text-center text-muted-foreground font-medium">Loading your postings...</div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {sortedJobs.slice(0, 5).map(job => (
                        <div key={job.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                            <div className="space-y-1">
                                <h3 className="font-bold text-lg text-slate-900 group-hover:text-primary transition-colors">{job.title}</h3>
                                <p className="text-sm text-slate-500 font-medium">
                                    {job.organization_name} &bull; {job.location} &bull; 
                                    <span className="text-slate-400 ml-1">
                                        Posted on {new Date(job.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant={job.status === 'ACTIVE' ? 'default' : 'secondary'} className="rounded-full px-4 py-1 font-bold">
                                    {job.status}
                                </Badge>
                                <Link to={`/recruiter/jobs/${job.id}`}>
                                  <Button variant="outline" size="sm" className="font-bold rounded-xl border-slate-200">View Details</Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                    {jobs?.length === 0 && <p className="p-12 text-center text-slate-500 font-medium">No active job postings yet.</p>}
                </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const AdminDashboard = () => (
  <DashboardLayout>
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
    </div>
  </DashboardLayout>
);

const queryClient = new QueryClient();

function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || !user) return <LandingPage />;
  if (user.role === 'CANDIDATE') {
    const isProfileComplete = !!(user.candidate_profile?.resume_path && user.candidate_profile?.skills);
    return isProfileComplete ? <Navigate to="/candidate/dashboard" replace /> : <Navigate to="/candidate/complete-profile" replace />;
  }
  return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;
}

function AuthRedirectWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user) return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;
  return <>{children}</>;
}

function App() {
  const [loading, setLoading] = useState(true);
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await api.get('/auth/me');
        setAuth(response.data);
      } catch (error: any) {
        // Log error only if it's not an auth failure
        if (error.response?.status !== 401) {
            console.error('Auth check failed:', error);
        }
        setAuth(null); 
      } finally {
        setLoading(false);
      }
    };
    checkAuthStatus();
  }, [setAuth]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading IntelliHire...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<AuthRedirectWrapper><LoginPage /></AuthRedirectWrapper>} />
          <Route path="/register" element={<AuthRedirectWrapper><RegisterPage /></AuthRedirectWrapper>} />
          <Route element={<ProtectedRoute allowedRoles={['CANDIDATE']} />}>
            <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
            <Route path="/candidate/jobs" element={<JobsMarketplacePage />} />
            <Route path="/candidate/applications" element={<CandidateApplicationsPage />} />
            <Route path="/interview/:token" element={<InterviewSessionPage />} />
            <Route path="/candidate/complete-profile" element={<CompleteCandidateProfilePage />} />
            <Route path="/candidate/profile" element={<CandidateProfilePage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['RECRUITER']} />}>
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/recruiter/jobs" element={<JobsListPage />} />
            <Route path="/recruiter/jobs/new" element={<PostJobPage />} />
            <Route path="/recruiter/jobs/:id" element={<JobDetailsPage />} />
            <Route path="/recruiter/jobs/:id/edit" element={<EditJobPage />} />
            <Route path="/recruiter/applications" element={<RecruiterApplicationsPage />} />
            <Route path="/recruiter/complete-profile" element={<CompleteRecruiterProfilePage />} />
            <Route path="/recruiter/profile" element={<RecruiterProfilePage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
