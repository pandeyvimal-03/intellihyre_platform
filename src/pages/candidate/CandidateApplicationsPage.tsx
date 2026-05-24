import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { FileText, ArrowUpDown, Video } from 'lucide-react';
import { applicationService, ApplicationStatus, Application } from '@/services/applicationService';
import { interviewService } from '@/services/interviewService';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const getStatusBadge = (status: ApplicationStatus) => {
  switch (status) {
    case ApplicationStatus.APPLIED: return <Badge variant="secondary">Applied</Badge>;
    case ApplicationStatus.PARSED: return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">AI Analyzed</Badge>;
    case ApplicationStatus.SHORTLISTED: return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Shortlisted</Badge>;
    case ApplicationStatus.REJECTED: return <Badge variant="destructive">Rejected</Badge>;
    case ApplicationStatus.INTERVIEW_SCHEDULED: return <Badge variant="default" className="bg-purple-500 hover:bg-purple-600">Interview Scheduled</Badge>;
    case ApplicationStatus.COMPLETED: return <Badge variant="default" className="bg-cyan-500 hover:bg-cyan-600">Completed</Badge>;
    default: return <Badge>{status}</Badge>;
  }
};

const ActionsCell = ({ application }: { application: Application }) => {
  const navigate = useNavigate();

  const handleJoinInterview = async () => {
    try {
      const interview = await interviewService.getByApplicationId(application.id);
      const scheduledTime = new Date(interview.scheduled_at);
      const now = new Date();
      
      if (now < scheduledTime) {
        alert(`The interview is scheduled for ${scheduledTime.toLocaleString()}. You can only join at the scheduled time.`);
        return;
      }
      
      navigate(`/interview/${interview.token}`);
    } catch (error) {
      console.error("Failed to get interview token:", error);
      alert("Could not start interview. Please contact support.");
    }
  };

  return (
    <div className="flex justify-end gap-2">
      {application.status === ApplicationStatus.INTERVIEW_SCHEDULED && (
        <Button size="sm" variant="default" className="bg-purple-600 hover:bg-purple-700 gap-2" onClick={handleJoinInterview}>
          <Video className="w-4 h-4" />
          Join Interview
        </Button>
      )}
      <Button variant="ghost" size="sm" className="gap-2">
        <FileText className="w-4 h-4" />
        Details
      </Button>
    </div>
  );
};

const columns: ColumnDef<Application>[] = [
  {
    accessorKey: "job.title",
    header: "Job Title",
    cell: ({ row }) => <span className="font-medium">{row.original.job?.title}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => getStatusBadge(row.getValue("status")),
  },
  {
    accessorKey: "match_score",
    header: "Match Score",
    cell: ({ row }) => {
      const score = row.getValue("match_score") as number | undefined;
      if (!score) return <span className="text-muted-foreground text-xs italic">Pending AI analysis</span>;
      
      return (
        <span className={cn(
          "font-bold",
          score >= 80 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-red-500"
        )}>
          {score}%
        </span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Applied Date",
    cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell application={row.original} />,
  },
];

const CandidateApplicationsPage = () => {
  const [activeTab, setActiveTab] = useState("all");

  const { data: applications, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: applicationService.getMyApplications,
  });

  const filteredApplications = useMemo(() => {
    if (!applications) return [];
    switch (activeTab) {
      case "pending": return applications.filter(a => a.status === ApplicationStatus.APPLIED || a.status === ApplicationStatus.PARSED);
      case "shortlisted": return applications.filter(a => a.status === ApplicationStatus.SHORTLISTED);
      case "scheduled": return applications.filter(a => a.status === ApplicationStatus.INTERVIEW_SCHEDULED);
      case "completed": return applications.filter(a => a.status === ApplicationStatus.COMPLETED);
      case "rejected": return applications.filter(a => a.status === ApplicationStatus.REJECTED);
      default: return applications;
    }
  }, [applications, activeTab]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Applications</h1>
          <p className="text-muted-foreground">Track the status of your job applications and AI evaluation scores.</p>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {isLoading ? (
              <div className="text-center py-20">Loading applications...</div>
            ) : (
              <DataTable 
                columns={columns} 
                data={filteredApplications} 
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CandidateApplicationsPage;
