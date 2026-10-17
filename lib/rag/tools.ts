

/**
 * Allowed project IDs for get_project_details. This list should be kept in sync
 * with the canonical project catalog (src/corpus/profile/data.ts).
 */


const ALLOWED_PROJECT_IDS = new Set([
  'tableflow',
  'deliveryproof',
  'zeni',
  'ncert_ai_tutor',
  'mechanical_part_detection',
  // add other catalogue IDs as needed
]);

// Mapping from external underscored IDs to canonical catalog slugs
const EXTERNAL_TO_CANONICAL_SLUG: Record<string, string> = {
  tableflow: 'tableflow',
  deliveryproof: 'deliveryproof',
  zeni: 'zeni',
  ncert_ai_tutor: 'ncert-ai-tutor',
  mechanical_part_detection: 'mechanical-part-detection',
};

/**
 * Retrieve static project details from the in‑repo catalog.
 * The function validates the projectId against a whitelist to avoid arbitrary
 * filesystem or network access.
 */
export function get_project_details(args: { projectId: string }): string {
  const { projectId } = args;
  if (!ALLOWED_PROJECT_IDS.has(projectId)) {
    throw new Error(`Project ID "${projectId}" is not allowed.`);
  }
  // Import the catalog lazily to keep the module lightweight.
   
  const { projects } = require('../../corpus/profile/data');
  const canonicalSlug = EXTERNAL_TO_CANONICAL_SLUG[projectId];
  const project = (projects as Array<any>).find((p) => p.slug === canonicalSlug);
  if (!project) {
    throw new Error(`Project "${projectId}" not found in catalog.`);
  }
  // Return a concise JSON representation – the caller can format as needed.
  return JSON.stringify({
    name: project.name,
    tagline: project.tagline,
    stack: project.stack,
    repoUrl: project.repoUrl,
    description: project.description,
  });
}

/**
 * Fetch basic public GitHub repository statistics.
 * No secret is required – the API is public for public repos. The function is
 * bounded: it only performs a GET request to https://api.github.com/repos/{owner}/{repo}.
 * The response is trimmed to a safe subset.
 */
export async function fetch_github_stats(args: { projectId: string }): Promise<string> {
  const { projectId } = args;
  if (!ALLOWED_PROJECT_IDS.has(projectId)) {
    throw new Error(`Project ID "${projectId}" is not allowed.`);
  }
  // Load catalog lazily
   
  const { projects } = require('../../corpus/profile/data');
  const canonicalSlug = EXTERNAL_TO_CANONICAL_SLUG[projectId];
  const project = (projects as Array<any>).find((p) => p.slug === canonicalSlug);
  if (!project) {
    throw new Error(`Project "${projectId}" not found in catalog.`);
  }
  const repoUrl: string = project.repoUrl;
  const match = repoUrl.match(/https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?$/);
  if (!match) {
    throw new Error(`Repository URL for project "${projectId}" is not a valid GitHub URL.`);
  }
  const [, owner, repo] = match;
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const resp = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/vnd.github.v3+json' } });
  if (!resp.ok) {
    throw new Error(`GitHub API error ${resp.status}: ${resp.statusText}`);
  }
  const data = await resp.json();
  const safe = {
    full_name: data.full_name,
    description: data.description,
    stargazers_count: data.stargazers_count,
    forks_count: data.forks_count,
    open_issues_count: data.open_issues_count,
    html_url: data.html_url,
  };
  return JSON.stringify(safe);
}
