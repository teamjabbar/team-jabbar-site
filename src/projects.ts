import { getCollection } from 'astro:content';

// Drafts stay off the live site. Set SHOW_DRAFTS=1 when building to preview them.
export async function liveProjects() {
  const all = await getCollection('projects');
  const order = { 'Now selling': 0, 'Coming soon': 1, 'Under construction': 2 } as const;
  return all
    .filter((p) => !p.data.draft || process.env.SHOW_DRAFTS === '1')
    .sort((a, b) => order[a.data.status] - order[b.data.status] || b.data.updated.valueOf() - a.data.updated.valueOf());
}
