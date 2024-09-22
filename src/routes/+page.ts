import type { PageLoad } from './$types';

// Minimal load function to return just the mode value, no heavy fetches
export const load: PageLoad = async ({ url }) => {
  const modeValue = parseInt(url.searchParams.get('mode') || '0'); // Get modeValue from URL params

  return {
    modeValue, // Return mode for initial load
  };
};
