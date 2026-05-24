import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { jobService, Job, JobStatus } from '@/services/jobService';
import DashboardLayout from '@/layouts/DashboardLayout';

const JobsListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: jobService.getAll,
  });

  const filteredJobs = useMemo(() => {
    return (jobs || []).filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchTerm, statusFilter]);

  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredJobs.slice(start, start + itemsPerPage);
  }, [filteredJobs, currentPage]);

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 p-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Job Postings</h1>
            <p className="text-slate-500 font-medium mt-1">Manage and track your active, closed, or draft roles.</p>
          </div>
          <Link to="/recruiter/jobs/new">
            <Button className="h-12 px-6 font-bold rounded-xl shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Post New Job
            </Button>
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by title..." 
              className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-11 rounded-xl bg-slate-50 border-slate-200">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value={JobStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={JobStatus.CLOSED}>Closed</SelectItem>
              <SelectItem value={JobStatus.DRAFT}>Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="text-center py-20 text-slate-500 font-medium">Loading your job postings...</div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {filteredJobs.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {paginatedJobs.map((job: Job) => (
                  <div key={job.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-slate-900 group-hover:text-primary transition-colors">{job.title}</h3>
                      <p className="text-sm text-slate-500 font-medium">
                        {job.organization_name} &bull; {job.location} &bull; 
                        <span className="text-slate-400 ml-1">Posted {new Date(job.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={job.status === 'ACTIVE' ? 'default' : 'secondary'} className="rounded-full px-4 py-1 font-bold">
                        {job.status}
                      </Badge>
                      <Link to={`/recruiter/jobs/${job.id}`}>
                          <Button variant="outline" size="sm" className="font-bold rounded-xl border-slate-200">View</Button>
                      </Link>
                      <Link to={`/recruiter/jobs/${job.id}/edit`}>
                          <Button variant="secondary" size="sm" className="font-bold rounded-xl bg-slate-100 hover:bg-slate-200">Edit</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center text-slate-500 font-medium">No job postings found matching your filters.</div>
            )}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="w-4 h-4 mr-2"/> Previous
                </Button>
                <span className="text-sm font-bold text-slate-600">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                    Next <ChevronRight className="w-4 h-4 ml-2"/>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default JobsListPage;
