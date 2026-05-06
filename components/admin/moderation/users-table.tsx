"use client"

import { useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { mockAdminUsers, type AdminUser, type UserStatus } from "@/lib/admin/mock-users"
import { cn } from "@/lib/utils"
import { MoreHorizontal, Users, ShieldAlert, AlertTriangle, Ban, CircleCheck } from "lucide-react"

type Folder = "all" | "active" | "flagged" | "suspended" | "banned"

const statusBadge: Record<UserStatus, React.ReactNode> = {
  active: (
    <span className="flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px]">
        active
      </Badge>
    </span>
  ),
  suspended: (
    <Badge variant="outline" className="border-amber-400/30 text-amber-400 text-[10px]">
      suspended
    </Badge>
  ),
  banned: (
    <Badge variant="destructive" className="text-[10px]">
      banned
    </Badge>
  ),
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

export function UsersTable() {
  const [users, setUsers] = useState<AdminUser[]>(mockAdminUsers)
  const [search, setSearch] = useState("")
  const [folder, setFolder] = useState<Folder>("all")
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null)

  const counts = {
    all: users.length,
    active: users.filter((u) => u.status === "active").length,
    flagged: users.filter((u) => u.reportsAgainst > 0).length,
    suspended: users.filter((u) => u.status === "suspended").length,
    banned: users.filter((u) => u.status === "banned").length,
  }

  const folderFiltered = users.filter((u) => {
    if (folder === "active") return u.status === "active"
    if (folder === "flagged") return u.reportsAgainst > 0
    if (folder === "suspended") return u.status === "suspended"
    if (folder === "banned") return u.status === "banned"
    return true
  })

  const filtered = folderFiltered.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.displayName.toLowerCase().includes(search.toLowerCase())
  )

  function updateStatus(id: string, status: UserStatus) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)))
  }

  const folders: { id: Folder; label: string; icon: React.ReactNode; countColor?: string }[] = [
    { id: "all", label: "All Users", icon: <Users className="h-3.5 w-3.5" /> },
    { id: "active", label: "Active", icon: <CircleCheck className="h-3.5 w-3.5" /> },
    {
      id: "flagged",
      label: "Flagged",
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      countColor: counts.flagged > 0 ? "text-amber-400" : undefined,
    },
    {
      id: "suspended",
      label: "Suspended",
      icon: <ShieldAlert className="h-3.5 w-3.5" />,
    },
    {
      id: "banned",
      label: "Banned",
      icon: <Ban className="h-3.5 w-3.5" />,
      countColor: counts.banned > 0 ? "text-red-400" : undefined,
    },
  ]

  return (
    <div className="flex gap-6">
      {/* Folder sidebar */}
      <div className="w-44 flex-shrink-0">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Filter
        </p>
        <ul className="space-y-0.5">
          {folders.map((f) => (
            <li key={f.id}>
              <button
                onClick={() => setFolder(f.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  folder === f.id
                    ? "bg-card text-foreground"
                    : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
                )}
              >
                <span className="flex-shrink-0 opacity-60">{f.icon}</span>
                <span className="flex-1 text-left">{f.label}</span>
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    f.countColor ?? "text-muted-foreground/50"
                  )}
                >
                  {counts[f.id]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Table area */}
      <div className="min-w-0 flex-1 space-y-4">
        <Input
          placeholder="Search by username or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>User</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Member Since</TableHead>
                <TableHead>Listings</TableHead>
                <TableHead>Reports Against</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    No users in this folder.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((user) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer"
                    onClick={() => setOpenMenuUserId(user.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7">
                          {user.avatarUrl ? (
                            <AvatarImage src={user.avatarUrl} alt={user.username} />
                          ) : null}
                          <AvatarFallback className="text-xs">
                            {user.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-foreground">
                          @{user.username}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.displayName}
                    </TableCell>
                    <TableCell>{statusBadge[user.status]}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(user.memberSince)}
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">{user.listingCount}</TableCell>
                    <TableCell>
                      <span
                        className={`text-sm tabular-nums ${
                          user.reportsAgainst > 2
                            ? "font-semibold text-red-400"
                            : user.reportsAgainst > 0
                            ? "text-amber-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {user.reportsAgainst}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <DropdownMenu
                          open={openMenuUserId === user.id}
                          onOpenChange={(v) => setOpenMenuUserId(v ? user.id : null)}
                        >
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <button className="rounded p-1 text-muted-foreground/40 hover:bg-card hover:text-foreground">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <a href={`/profile/${user.username}`} target="_blank" rel="noopener noreferrer">
                                View profile
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status === "active" ? (
                              <>
                                <DropdownMenuItem onSelect={() => updateStatus(user.id, "suspended")}>
                                  Suspend
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => updateStatus(user.id, "banned")}
                                  className="text-destructive focus:text-destructive"
                                >
                                  Ban permanently
                                </DropdownMenuItem>
                              </>
                            ) : null}
                            {user.status === "suspended" ? (
                              <>
                                <DropdownMenuItem onSelect={() => updateStatus(user.id, "active")}>
                                  Reinstate
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => updateStatus(user.id, "banned")}
                                  className="text-destructive focus:text-destructive"
                                >
                                  Ban permanently
                                </DropdownMenuItem>
                              </>
                            ) : null}
                            {user.status === "banned" ? (
                              <DropdownMenuItem onSelect={() => updateStatus(user.id, "active")}>
                                Reinstate
                              </DropdownMenuItem>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
