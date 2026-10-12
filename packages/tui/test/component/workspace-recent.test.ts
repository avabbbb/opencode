import { describe, expect, test } from "bun:test"
import { recentWorkspaceDirectories, workspaceDirectoryCategory } from "../../src/component/workspace-recent"

describe("recent workspace directories", () => {
  test("orders by latest session activity and deduplicates", () => {
    const sessions = [
      { projectID: "a", location: { directory: "/repo/backend" }, time: { updated: 100 } },
      { projectID: "a", location: { directory: "/repo/docs" }, time: { updated: 200 } },
      { projectID: "a", location: { directory: "/repo/backend" }, time: { updated: 300 } },
    ]
    expect(recentWorkspaceDirectories(sessions, "a", ["/repo"], ["/repo/backend", "/repo/docs"])).toEqual([
      "/repo/backend",
      "/repo/docs",
    ])
  })

  test("excludes current root, child sessions, archived, unrelated, and invalid destinations", () => {
    const sessions = [
      { projectID: "a", location: { directory: "/repo" }, time: { updated: 700 } },
      { projectID: "a", location: { directory: "/repo/child" }, parentID: "parent", time: { updated: 600 } },
      { projectID: "a", location: { directory: "/repo/archived" }, time: { updated: 500, archived: 550 } },
      { projectID: "b", location: { directory: "/other" }, time: { updated: 400 } },
      { projectID: "a", location: { directory: "/repo/missing" }, time: { updated: 300 } },
      { projectID: "a", location: { directory: "/repo/docs" }, time: { updated: 200 } },
    ]
    expect(
      recentWorkspaceDirectories(sessions, "a", ["/repo"], ["/repo", "/repo/docs", "/repo/archived"]),
    ).toEqual(["/repo/docs"])
  })

  test("limits Recent to five destinations", () => {
    const sessions = Array.from({ length: 8 }, (_, index) => ({
      projectID: "a",
      location: { directory: `/repo/dir-${index}` },
      time: { updated: 100 - index },
    }))
    const candidates = sessions.map((session) => session.location.directory)
    expect(recentWorkspaceDirectories(sessions, "a", [], candidates)).toEqual(candidates.slice(0, 5))
  })
})

describe("workspace directory category", () => {
  test("current directory wins over Recent, which wins over current-root grouping", () => {
    expect(workspaceDirectoryCategory("/repo", "/repo", "/repo", "/repo", true)).toBe("Current")
    expect(workspaceDirectoryCategory("/repo/docs", "/repo", "/repo", "/repo", true)).toBe("Recent")
    expect(workspaceDirectoryCategory("/repo/docs", "/repo", "/repo", "/repo", false)).toBe("Current")
    expect(workspaceDirectoryCategory("/other", "/other", "/repo", "/repo", false)).toBe("Other")
  })
})
