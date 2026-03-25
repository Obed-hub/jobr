export interface Job {
  id: string;
  title: string;
  company: string;
  url: string;
  logo?: string;
  platform: string;
  location?: string;
  salary?: string;
  type?: string;
  tags?: string[];
  description?: string;
  publishedAt: string;
}

export interface UserProfile {
  uid: string;
  displayName?: string;
  email: string;
  photoURL?: string;
  bio?: string;
  skills?: string[];
  desiredJobTitles?: string[];
  resumeUrl?: string;
  resumeName?: string;
  preferences?: {
    jobTypes?: string[];
    locations?: string[];
    minSalary?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
  current: boolean;
}

export interface JobAlert {
  id: string;
  keywords: string;
  location?: string;
  jobType?: string;
  active: boolean;
  createdAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status: 'applied' | 'interviewing' | 'offered' | 'rejected';
  appliedAt: string;
  notes?: string;
}

export interface SavedJob {
  uid: string;
  jobId: string;
  title: string;
  company?: string;
  url: string;
  logo?: string;
  platform?: string;
  savedAt: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
