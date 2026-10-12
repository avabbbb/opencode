export type RecentWorkspaceSession = {
  projectID: string
  parentID?: string
  location: { directory: string }
  time: { updated: number; archived?: number }
}

export function recentWorkspaceDirectories(
  sessions: readonly RecentWorkspaceSession[],
  projectID: string,
  excluded: readonly string[],
  candidates: readonly string[],
  limit = 5,
): string[] {
  const valid = new Set(candidates)
  const skip = new Set(excluded)
  const seen = new Set<string>()

  return sessions
    .filter((session) => session.projectID === projectID && !session.parentID && session.time.archived === undefined)
    .toSorted((a, b) => b.time.updated - a.time.updated)
    .flatMap((session) => {
      const directory = session.location.directory
      if (skip.has(directory) || !valid.has(directory) || seen.has(directory)) return []
      seen.add(directory)
      return [directory]
    })
    .slice(0, limit)
}

export function workspaceDirectoryCategory(
  directory: string,
  root: string,
  currentDirectory: string | undefined,
  currentRoot: string | undefined,
  recent: boolean,
): "Current" | "Recent" | "Other" {
  if (directory === currentDirectory) return "Current"
  if (recent) return "Recent"
  return root === currentRoot ? "Current" : "Other"
}
