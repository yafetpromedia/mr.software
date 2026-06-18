export type GithubRepo = {
  id: number;
  fullName: string;
  name: string;
  private: boolean;
  defaultBranch: string;
  htmlUrl: string;
  updatedAt: string;
  description: string | null;
};

type GithubRepoResponse = {
  id: number;
  full_name: string;
  name: string;
  private: boolean;
  default_branch: string;
  html_url: string;
  updated_at: string;
  description: string | null;
};

export async function listGithubRepos(accessToken: string): Promise<GithubRepo[]> {
  const repos: GithubRepo[] = [];
  let page = 1;

  while (page <= 5) {
    const url = new URL("https://api.github.com/user/repos");
    url.searchParams.set("per_page", "100");
    url.searchParams.set("page", String(page));
    url.searchParams.set("sort", "updated");
    url.searchParams.set("affiliation", "owner,collaborator,organization_member");

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("GitHub repos list failed", res.status, body);
      throw new Error("repos_fetch_failed");
    }

    const data = (await res.json()) as GithubRepoResponse[];
    if (!Array.isArray(data) || data.length === 0) break;

    for (const r of data) {
      repos.push({
        id: r.id,
        fullName: r.full_name,
        name: r.name,
        private: r.private,
        defaultBranch: r.default_branch || "main",
        htmlUrl: r.html_url,
        updatedAt: r.updated_at,
        description: r.description,
      });
    }

    if (data.length < 100) break;
    page += 1;
  }

  return repos;
}

export async function downloadGithubRepoArchive(input: {
  accessToken: string;
  owner: string;
  repo: string;
  ref: string;
}): Promise<Buffer> {
  const url = `https://api.github.com/repos/${encodeURIComponent(input.owner)}/${encodeURIComponent(input.repo)}/zipball/${encodeURIComponent(input.ref)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    redirect: "follow",
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("GitHub archive download failed", res.status, body);
    throw new Error("archive_download_failed");
  }

  const buf = Buffer.from(await res.arrayBuffer());
  return buf;
}
