import { scrapeLinkedIn } from './linkedin';
import { scrapeInstagram } from './instagram';
import type { ScrapedData } from '@/lib/types';

export async function scrapeProfile(linkedinUrl: string, instagramUrl: string): Promise<ScrapedData> {
  const errors: string[] = [];
  
  // Scrape both in parallel
  const [linkedinResult, instagramResult] = await Promise.all([
    scrapeLinkedIn(linkedinUrl),
    scrapeInstagram(instagramUrl),
  ]);

  if (linkedinResult.error) errors.push(`LinkedIn: ${linkedinResult.error}`);
  if (instagramResult.error) errors.push(`Instagram: ${instagramResult.error}`);

  return {
    linkedin: linkedinResult.data,
    instagram: instagramResult.data,
    scrapedAt: new Date().toISOString(),
    errors,
  };
}

export { scrapeLinkedIn } from './linkedin';
export { scrapeInstagram } from './instagram';
