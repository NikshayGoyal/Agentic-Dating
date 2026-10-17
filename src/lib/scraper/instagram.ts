import * as cheerio from 'cheerio';
import type { InstagramData } from '@/lib/types';

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
};

function extractUsername(url: string): string {
  let cleaned = url.trim().replace(/\/+$/, '').replace(/\?.*$/, '');
  // Handle various URL formats
  cleaned = cleaned.replace(/^(https?:\/\/)?(www\.)?instagram\.com\//, '');
  // Remove any remaining path segments after username
  cleaned = cleaned.split('/')[0];
  return cleaned;
}

async function scrapeViaHttp(username: string): Promise<InstagramData | null> {
  try {
    const url = `https://www.instagram.com/${username}/`;
    const response = await fetch(url, {
      headers: BROWSER_HEADERS,
      redirect: 'follow',
    });

    if (!response.ok) {
      console.error(`Instagram HTTP error: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Check for login wall
    if (html.includes('loginForm') && !html.includes('ProfilePage')) {
      console.log('Instagram login wall detected');
    }

    // Try to extract from meta tags (most reliable for public profiles)
    const ogTitle = $('meta[property="og:title"]').attr('content') || '';
    const ogDescription = $('meta[property="og:description"]').attr('content') || '';
    const ogImage = $('meta[property="og:image"]').attr('content') || '';
    const metaDescription = $('meta[name="description"]').attr('content') || '';

    // Parse og:description which usually contains follower counts
    // Format: "X Followers, Y Following, Z Posts - See Instagram photos and videos from Name (@username)"
    const description = ogDescription || metaDescription;
    
    const followerMatch = description.match(/([\d,.]+[KMB]?)\s*Followers/i);
    const followingMatch = description.match(/([\d,.]+[KMB]?)\s*Following/i);
    const postMatch = description.match(/([\d,.]+[KMB]?)\s*Posts/i);

    const parseCount = (str: string | undefined): number => {
      if (!str) return 0;
      str = str.replace(/,/g, '');
      if (str.endsWith('K')) return parseFloat(str) * 1000;
      if (str.endsWith('M')) return parseFloat(str) * 1000000;
      if (str.endsWith('B')) return parseFloat(str) * 1000000000;
      return parseInt(str) || 0;
    };

    // Extract name from og:title
    // Format: "Name (@username) • Instagram photos and videos"
    const nameMatch = ogTitle.match(/^(.+?)(?:\s*\(@?\w+\)|\s*•|\s*\|)/);
    const fullName = nameMatch?.[1]?.trim() || ogTitle.split('•')[0]?.trim() || username;

    // Try to find bio from the page content
    let bio = '';
    
    // Look for _sharedData (older Instagram pages)
    const sharedDataMatch = html.match(/window\._sharedData\s*=\s*({.+?});\s*<\/script>/);
    if (sharedDataMatch) {
      try {
        const sharedData = JSON.parse(sharedDataMatch[1]);
        const user = sharedData?.entry_data?.ProfilePage?.[0]?.graphql?.user;
        if (user) {
          return {
            username,
            fullName: user.full_name || fullName,
            bio: user.biography || '',
            followerCount: user.edge_followed_by?.count || parseCount(followerMatch?.[1]),
            followingCount: user.edge_follow?.count || parseCount(followingMatch?.[1]),
            postCount: user.edge_owner_to_timeline_media?.count || parseCount(postMatch?.[1]),
            profilePicUrl: user.profile_pic_url_hd || user.profile_pic_url || ogImage,
            recentCaptions: (user.edge_owner_to_timeline_media?.edges || [])
              .slice(0, 12)
              .map((e: { node: { edge_media_to_caption: { edges: Array<{ node: { text: string } }> } } }) => 
                e.node?.edge_media_to_caption?.edges?.[0]?.node?.text || ''
              )
              .filter(Boolean),
            isVerified: user.is_verified || false,
          };
        }
      } catch { /* failed to parse shared data */ }
    }

    // Look for additional data loaded (newer Instagram pages)  
    const additionalDataMatch = html.match(/window\.__additionalDataLoaded\s*\([^,]+,\s*({.+?})\s*\)\s*;/);
    if (additionalDataMatch) {
      try {
        const data = JSON.parse(additionalDataMatch[1]);
        const user = data?.graphql?.user || data?.user;
        if (user) {
          bio = user.biography || '';
        }
      } catch { /* skip */ }
    }

    // Extract bio from description - after the stats part
    if (!bio) {
      const bioMatch = description.match(/(?:Posts\s*[-–—]\s*|posts\.\s*)(.+?)(?:\s*$)/i);
      bio = bioMatch?.[1]?.replace(/See Instagram photos and videos from .+$/, '').trim() || '';
    }

    // Try ld+json
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const parsed = JSON.parse($(el).html() || '');
        if (parsed.description && !bio) {
          bio = parsed.description;
        }
      } catch { /* skip */ }
    });

    if (!fullName || fullName === username) {
      // If we couldn't get a name, check if we at least got meta data
      if (!ogTitle && !ogDescription) {
        return null;
      }
    }

    return {
      username,
      fullName,
      bio,
      followerCount: parseCount(followerMatch?.[1]),
      followingCount: parseCount(followingMatch?.[1]),
      postCount: parseCount(postMatch?.[1]),
      profilePicUrl: ogImage,
      recentCaptions: [],
      isVerified: html.includes('is_verified":true') || html.includes('isVerified":true'),
    };
  } catch (error) {
    console.error('Instagram scraping error:', error);
    return null;
  }
}

async function scrapeViaWebApi(username: string): Promise<InstagramData | null> {
  try {
    const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
    const response = await fetch(url, {
      headers: {
        ...BROWSER_HEADERS,
        'X-IG-App-ID': '936619743392459',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    const user = data?.data?.user;
    if (!user) return null;

    return {
      username,
      fullName: user.full_name || username,
      bio: user.biography || '',
      followerCount: user.edge_followed_by?.count || 0,
      followingCount: user.edge_follow?.count || 0,
      postCount: user.edge_owner_to_timeline_media?.count || 0,
      profilePicUrl: user.profile_pic_url_hd || user.profile_pic_url || '',
      recentCaptions: (user.edge_owner_to_timeline_media?.edges || [])
        .slice(0, 12)
        .map((e: { node: { edge_media_to_caption: { edges: Array<{ node: { text: string } }> } } }) => 
          e.node?.edge_media_to_caption?.edges?.[0]?.node?.text || ''
        )
        .filter(Boolean),
      isVerified: user.is_verified || false,
    };
  } catch (error) {
    console.error('Instagram Web API error:', error);
    return null;
  }
}

export async function scrapeInstagram(url: string): Promise<{ data: InstagramData | null; error?: string }> {
  const username = extractUsername(url);
  
  if (!username) {
    return { data: null, error: 'Invalid Instagram URL' };
  }

  // Tier 1: Direct HTTP + meta tag parsing
  console.log(`[Instagram] Tier 1: Attempting direct HTTP scrape for @${username}...`);
  let data = await scrapeViaHttp(username);
  if (data) {
    console.log(`[Instagram] Tier 1 succeeded: Found ${data.fullName}`);
    return { data };
  }

  // Tier 2: Web API
  console.log(`[Instagram] Tier 2: Attempting Web API...`);
  data = await scrapeViaWebApi(username);
  if (data) {
    console.log(`[Instagram] Tier 2 succeeded: Found ${data.fullName}`);
    return { data };
  }

  // Tier 3: Return graceful error
  console.log(`[Instagram] All tiers failed for @${username}. Manual input needed.`);
  return {
    data: null,
    error: 'Could not automatically scrape this Instagram profile. The profile may be private or Instagram is blocking automated access.',
  };
}
