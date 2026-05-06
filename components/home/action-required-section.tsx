import { Bell } from 'lucide-react'
import { ActionCard, type ActionCardProps } from './action-card'
import { HomeSectionHeader } from './home-section-header'

interface ActionRequiredSectionProps {
  items: ActionCardProps[]
}

export function ActionRequiredSection({ items }: ActionRequiredSectionProps) {
  if (items.length === 0) return null

  return (
    <section>
      <HomeSectionHeader
        icon={<Bell className="h-5 w-5 text-primary" />}
        title="Action Required"
        href="/inbox"
        ctaLabel="See all"
      />
      <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:-mx-0 md:px-0">
        {items.map((item) => (
          <ActionCard key={`${item.username}-${item.itemTitle}`} {...item} />
        ))}
      </div>
    </section>
  )
}
