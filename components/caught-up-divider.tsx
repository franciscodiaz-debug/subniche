export function CaughtUpDivider() {
  return (
    <div className="my-10 flex items-center gap-4">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground/50">
        You&apos;re all caught up
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}
