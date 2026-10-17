import * as cheerio from 'cheerio';
import type { LinkedInData } from '@/lib/types';

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Cache-Control': 'max-age=0',
};

function extractUsername(url: string): string {
  const cleaned = url.replace(/\/+$/, '').replace(/\?.*$/, '');
  const parts = cleaned.split('/');
  return parts[parts.length - 1] || '';
}

function normalizeUrl(url: string): string {
  let normalized = url.trim();
  if (!normalized.startsWith('http')) {
    normalized = 'https://' + normalized;
  }
  normalized = normalized.replace(/\/+$/, '');
  if (!normalized.includes('linkedin.com/in/')) {
    const username = extractUsername(normalized);
    normalized = `https://www.linkedin.com/in/${username}`;
  }
  return normalized;
}

async function scrapeViaHttp(url: string): Promise<LinkedInData | null> {
  try {
    const normalizedUrl = normalizeUrl(url);
    const response = await fetch(normalizedUrl, {
      headers: BROWSER_HEADERS,
      redirect: 'follow',
    });

    if (!response.ok) {
      console.error(`LinkedIn HTTP error: ${response.status}`);
      return null;
    }

    const html = await response.text();
    
    // Check for auth wall
    if (html.includes('authwall') || html.includes('login') && html.includes('session_redirect')) {
      console.log('LinkedIn auth wall detected, trying alternative methods...');
      return null;
    }

    const $ = cheerio.load(html);
    
    // Try parsing ld+json structured data
    const ldJsonScripts = $('script[type="application/ld+json"]');
    let ldData: Record<string, unknown> | null = null;
    
    ldJsonScripts.each((_, el) => {
      try {
        const parsed = JSON.parse($(el).html() || '');
        if (parsed['@type'] === 'Person' || parsed['@type']?.includes('Person')) {
          ldData = parsed;
        }
      } catch { /* skip invalid json */ }
    });

    // Extract from meta tags as fallback
    const ogTitle = $('meta[property="og:title"]').attr('content') || '';
    const ogDescription = $('meta[property="og:description"]').attr('content') || '';
    const ogImage = $('meta[property="og:image"]').attr('content') || '';
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const title = $('title').text() || '';

    // Build profile from available data
    const name = ldData ? 
      ((ldData as Record<string, unknown>).name as string || '') : 
      ogTitle.split(' - ')[0]?.split(' | ')[0]?.trim() || title.split(' - ')[0]?.trim() || '';
    
    const headline = ldData ? 
      ((ldData as Record<string, unknown>).jobTitle as string || '') :
      ogTitle.split(' - ')[1]?.trim() || '';
    
    const about = ogDescription || metaDescription || '';
    
    // Parse experience from description if available
    const descParts = about.split('·').map(s => s.trim()).filter(Boolean);
    
    // Extract location
    const locationMatch = about.match(/(?:based in|located in|from)\s+([^.·,]+)/i);
    const location = ldData ? 
      ((ldData as Record<string, unknown>).address as Record<string, string>)?.addressLocality || '' :
      locationMatch?.[1]?.trim() || '';

    // Try to extract skills from page content
    const skills: string[] = [];
    $('[class*="skill"]').each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length < 50) skills.push(text);
    });

    // Extract experience entries
    const experience: LinkedInData['experience'] = [];
    const expMatch = about.match(/Experience:?\s*(.+?)(?:\.|Skills|Education|$)/i);
    if (expMatch) {
      const parts = expMatch[1].split(',').map(s => s.trim());
      for (const part of parts) {
        if (part) {
          experience.push({ title: part, company: '', duration: '' });
        }
      }
    }

    if (!name) {
      return null;
    }

    return {
      name,
      headline,
      about: about.slice(0, 2000),
      location,
      currentRole: headline.split(' at ')[0]?.trim() || headline.split(' @ ')[0]?.trim() || '',
      company: headline.split(' at ')[1]?.trim() || headline.split(' @ ')[1]?.trim() || '',
      experience,
      skills: skills.slice(0, 20),
      education: [],
      profileImageUrl: ogImage || undefined,
    };
  } catch (error) {
    console.error('LinkedIn scraping error:', error);
    return null;
  }
}

async function scrapeViaGoogleCache(url: string): Promise<LinkedInData | null> {
  try {
    const username = extractUsername(url);
    const cacheUrl = `https://webcache.googleusercontent.com/search?q=cache:linkedin.com/in/${username}`;
    
    const response = await fetch(cacheUrl, {
      headers: BROWSER_HEADERS,
    });

    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);
    
    const title = $('title').text();
    const name = title.split(' - ')[0]?.trim() || '';
    const headline = title.split(' - ')[1]?.trim() || '';
    
    if (!name) return null;

    const bodyText = $('body').text();
    
    return {
      name,
      headline,
      about: bodyText.slice(0, 2000),
      location: '',
      currentRole: headline.split(' at ')[0]?.trim() || '',
      company: headline.split(' at ')[1]?.trim() || '',
      experience: [],
      skills: [],
      education: [],
    };
  } catch (error) {
    console.error('Google cache scraping error:', error);
    return null;
  }
}

export async function scrapeLinkedIn(url: string): Promise<{ data: LinkedInData | null; error?: string }> {
  // Tier 1: Direct HTTP
  console.log(`[LinkedIn] Tier 1: Attempting direct HTTP scrape for ${url}...`);
  let data = await scrapeViaHttp(url);
  if (data) {
    console.log(`[LinkedIn] Tier 1 succeeded: Found ${data.name}`);
    return { data };
  }

  // Tier 2: Google Cache
  console.log(`[LinkedIn] Tier 2: Attempting Google cache...`);
  data = await scrapeViaGoogleCache(url);
  if (data) {
    console.log(`[LinkedIn] Tier 2 succeeded: Found ${data.name}`);
    return { data };
  }

  // Tier 3: Return graceful error
  console.log(`[LinkedIn] All tiers failed. Manual input needed.`);
  return { 
    data: null, 
    error: 'Could not automatically scrape this LinkedIn profile. The profile may be private or LinkedIn is blocking automated access.' 
  };
}
