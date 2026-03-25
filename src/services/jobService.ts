import { Job } from '../types';

export async function fetchRemotiveJobs(category?: string, search?: string): Promise<Job[]> {
  try {
    const url = new URL('https://remotive.com/api/remote-jobs');
    if (category) url.searchParams.append('category', category);
    if (search) url.searchParams.append('search', search);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Remotive API error');
    const data = await response.json();

    return data.jobs.map((job: any) => ({
      id: `remotive-${job.id}`,
      title: job.title,
      company: job.company_name,
      url: job.url,
      logo: job.company_logo,
      platform: 'Remotive',
      location: job.candidate_required_location,
      salary: job.salary,
      type: job.job_type,
      tags: job.tags,
      description: job.description,
      publishedAt: job.publication_date,
    }));
  } catch (error) {
    console.error('Error fetching Remotive jobs:', error);
    return [];
  }
}

export async function fetchArbeitnowJobs(page: number = 1): Promise<Job[]> {
  try {
    const response = await fetch(`https://www.arbeitnow.com/api/job-board-api?page=${page}`);
    if (!response.ok) throw new Error('Arbeitnow API error');
    const data = await response.json();

    return data.data.map((job: any) => ({
      id: `arbeitnow-${job.slug}`,
      title: job.title,
      company: job.company_name,
      url: job.url,
      platform: 'Arbeitnow',
      location: job.location,
      tags: job.tags,
      description: job.description,
      publishedAt: new Date(job.created_at * 1000).toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching Arbeitnow jobs:', error);
    return [];
  }
}

export async function fetchRemoteOKJobs(): Promise<Job[]> {
  try {
    // RemoteOK API often requires a user-agent or has CORS issues in browser
    // We'll try fetching it, but it might fail in client-side only environments
    const response = await fetch('https://remoteok.com/api');
    if (!response.ok) throw new Error('RemoteOK API error');
    const data = await response.json();

    // First element is usually legal info
    return data.slice(1).map((job: any) => ({
      id: `remoteok-${job.id}`,
      title: job.position,
      company: job.company,
      url: `https://remoteok.com/remote-jobs/${job.id}`,
      logo: job.company_logo,
      platform: 'RemoteOK',
      location: job.location,
      salary: job.salary,
      tags: job.tags,
      description: job.description,
      publishedAt: job.date,
    }));
  } catch (error) {
    console.error('Error fetching RemoteOK jobs:', error);
    return [];
  }
}

export async function searchAllJobs(query: string): Promise<Job[]> {
  const [remotive, arbeitnow, remoteok] = await Promise.all([
    fetchRemotiveJobs(undefined, query),
    fetchArbeitnowJobs(),
    fetchRemoteOKJobs(),
  ]);

  const allJobs = [...remotive, ...arbeitnow, ...remoteok];
  
  if (query) {
    const lowerQuery = query.toLowerCase();
    return allJobs.filter(job => 
      job.title.toLowerCase().includes(lowerQuery) || 
      job.company.toLowerCase().includes(lowerQuery) ||
      job.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  return allJobs.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}
