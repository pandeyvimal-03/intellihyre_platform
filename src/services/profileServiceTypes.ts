// platform/src/services/profileServiceTypes.ts
import { Role } from '@/store/authStore';

export interface CandidateProfile {
  id: number;
  user_id: number;
  skills?: string;
  resume_path?: string;
  desired_role?: string;
  job_mode: 'REMOTE' | 'ONSITE' | 'HYBRID' | 'ANY';
}

export interface RecruiterProfile {
  id: number;
  user_id: number;
  company_name?: string;
  contact_person_name?: string;
  mobile_no?: string;
  company_size?: string;
  industry?: string;
  company_website?: string;
}
