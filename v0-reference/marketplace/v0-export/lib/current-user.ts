// Mock signed-in user for the prototype.
// Centralized so the sidebar profile link and the top-right profile chip
// stay in sync without passing props all the way through the shell.

export type CurrentUser = {
  username: string
  displayName: string
  avatarUrl: string
  profileHref: string
}

export const currentUser: CurrentUser = {
  username: "jek116",
  displayName: "JillMusic",
  avatarUrl: "/avatar-jordan.jpg",
  profileHref: "/profile",
}
