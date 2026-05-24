import api from './api';

export type ProctoringEventType =
  | 'NO_FACE'
  | 'MULTI_FACE'
  | 'LOOKING_AWAY'
  | 'TAB_SWITCH'
  | 'FULLSCREEN_EXIT';

export interface ProctoringEvent {
  session_id: number;
  event_type: ProctoringEventType;
  severity: 'low' | 'medium' | 'high';
}

export const proctoringService = {
  async logEvent(data: ProctoringEvent): Promise<{ status: string }> {
    const response = await api.post<{ status: string }>('/proctoring/event', data);
    return response.data;
  },
};
