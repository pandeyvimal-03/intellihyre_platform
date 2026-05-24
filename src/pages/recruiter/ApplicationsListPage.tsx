import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Calendar, MoreVertical, CheckCircle, XCircle, User, Briefcase, FileText, ExternalLink } from 'lucide-react';
import { applicationService, Application, ApplicationStatus } from '@/services/applicationService';
import { interviewService } from '@/services/interviewService';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getStatusBadge = (status: ApplicationStatus) => {
  switch (status) {
    case ApplicationStatus.APPLIED: return <Badge variant="secondary">Applied</Badge>;
    case ApplicationStatus.PARSED: return <Badge variant="default" className="bg-blue-500">Analyzed</Badge>;
    case ApplicationStatus.SHORTLISTED: return <Badge variant="default" className="bg-green-600 text-white">Shortlisted</Badge>;
    case ApplicationStatus.REJECTED: return <Badge variant="destructive">Rejected</Badge>;
    case ApplicationStatus.INTERVIEW_SCHEDULED: return <Badge variant="default" className="bg-purple-600 text-white">Scheduled</Badge>;
    case ApplicationStatus.COMPLETED: return <Badge variant="default" className="bg-cyan-600 text-white">Completed</Badge>;
    default: return <Badge>{status}</Badge>;
  }
};

const RecruiterApplicationsPage = () => {
  const queryClient = useQueryClient();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [scheduledTime, setScheduledTime] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: applications, isLoading } = useQuery({
    queryKey: ['all-applications'],
    queryFn: () => applicationService.getAllApplications(),
  });

  const scheduleMutation = useMutation({
    mutationFn: (data: { appId: number, time: string }) => 
      interviewService.schedule(data.appId, data.time),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-applications'] });
      setSelectedApp(null);
      setScheduledTime("");
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { appId: number, status: ApplicationStatus }) => 
      applicationService.updateStatus(data.appId, data.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-applications'] });
    }
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

  const columns: ColumnDef<Application>[] = [
    {
      accessorKey: "candidate.name",
      header: "Candidate",
      cell: ({ row }) => {
        const app = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{app.candidate?.name || `ID: ${app.candidate_id}`}</span>
            <span className="text-xs text-muted-foreground">{app.candidate?.email}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "job.title",
      header: "Job Role",
      cell: ({ row }) => {
        const app = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{app.job?.title || `ID: ${app.job_id}`}</span>
            <span className="text-xs text-muted-foreground">{app.job?.organization_name}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "match_score",
      header: "Match Score",
      cell: ({ row }) => {
        const score = row.getValue("match_score") as number;
        return (
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-12 h-12 rounded-full border-4 flex items-center justify-center text-xs font-bold",
              score >= 80 ? "border-green-500 text-green-600" : 
              score >= 50 ? "border-yellow-500 text-yellow-600" : 
              "border-red-500 text-red-600"
            )}>
              {score ? `${Math.round(score)}%` : 'N/A'}
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "interview_result",
      header: "Interview Result",
      cell: ({ row }) => {
        const result = row.original.interview_result;
        if (!result) return <span className="text-muted-foreground text-xs">No result yet</span>;
        
        return (
          <div className="flex flex-col gap-1">
            <Badge className={cn(
                "w-fit",
                result.recommendation === "SELECTED" ? "bg-green-600" :
                result.recommendation === "HOLD" ? "bg-yellow-600" : "bg-red-600"
            )}>
                {result.recommendation}
            </Badge>
            <span className="text-xs font-medium">Score: {result.total_score}/10</span>
          </div>
        );
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const app = row.original;
        return (
          <div className="flex justify-end gap-2">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.open(`http://localhost:8000/${app.resume_url}`, '_blank')}>
                        <FileText className="w-4 h-4 mr-2" />
                        View Resume
                    </DropdownMenuItem>
                    
                    {(app.status === ApplicationStatus.PARSED || app.status === ApplicationStatus.APPLIED) && (
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ appId: app.id, status: ApplicationStatus.SHORTLISTED })}>
                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                            Shortlist
                        </DropdownMenuItem>
                    )}

                    {app.status === ApplicationStatus.SHORTLISTED && (
                        <DropdownMenuItem onClick={() => setSelectedApp(app)}>
                            <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                            Schedule Interview
                        </DropdownMenuItem>
                    )}

                    {app.status !== ApplicationStatus.REJECTED && (
                        <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => updateStatusMutation.mutate({ appId: app.id, status: ApplicationStatus.REJECTED })}
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject / Close
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
            <p className="text-muted-foreground">Manage candidate applications and track their progress.</p>
          </div>
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
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <DataTable 
                columns={columns} 
                data={filteredApplications} 
                searchKey="candidate.name"
              />
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
              <DialogDescription>
                Set a date and time for the AI interview. A unique link will be generated for the candidate.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <p className="font-medium">{selectedApp?.candidate?.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedApp?.job?.title}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Interview Time</Label>
                <Input 
                  id="time" 
                  type="datetime-local" 
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
              <Button 
                className="w-full" 
                disabled={!scheduledTime || scheduleMutation.isPending}
                onClick={() => scheduleMutation.mutate({ appId: selectedApp!.id, time: scheduledTime })}
              >
                {scheduleMutation.isPending ? "Scheduling..." : "Confirm & Send Invite"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default RecruiterApplicationsPage;
