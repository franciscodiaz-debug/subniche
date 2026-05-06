import { Repeat2 } from 'lucide-react'
import { ItemCard } from '@/components/item-card'
import { HomeSectionHeader } from '@/components/home/home-section-header'
import type { PerfectMatch } from '@/lib/types'

const tradeMatches: PerfectMatch[] = [
  {
    id: 'tm-1',
    my_item: { title: 'Gibson Les Paul' },
    match_score: 9.0,
    their_item: {
      id: 'tm-1-item',
      type: 'listing',
      title: 'Fender Stratocaster',
      subtitle: '2019 American Pro II, Sunburst',
      price: 1450,
      images: ['https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400&h=400&fit=crop'],
      user: { location: 'Chicago, IL' },
      published_groups: [{ id: 'fender', name: 'Fender Fans', icon: '🎸' }],
    },
  },
  {
    id: 'tm-2',
    my_item: { title: 'Fender Telecaster' },
    match_score: 9.2,
    their_item: {
      id: 'tm-2-item',
      type: 'listing',
      title: 'Gibson SG Standard',
      subtitle: 'Cherry red, excellent condition',
      price: 1200,
      images: ['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop'],
      user: { location: 'Austin, TX' },
      published_groups: [{ id: 'gibson-gang', name: 'Gibson Gang', icon: '🎸' }],
    },
  },
  {
    id: 'tm-3',
    my_item: { title: 'Suhr Modern' },
    match_score: 8.5,
    their_item: {
      id: 'tm-3-item',
      type: 'listing',
      title: 'PRS Custom 24',
      subtitle: '10-top, McCarty burst',
      price: 2800,
      images: ['https://images.unsplash.com/photo-1550985616-10810253b84d?w=400&h=400&fit=crop'],
      user: { location: 'Portland, OR' },
      published_groups: [{ id: 'prs', name: 'PRS Players', icon: '🎸' }],
    },
  },
  {
    id: 'tm-4',
    my_item: { title: 'Taylor 814ce' },
    match_score: 7.8,
    their_item: {
      id: 'tm-4-item',
      type: 'listing',
      title: 'Martin D-28',
      subtitle: '2020, solid Sitka spruce top',
      price: 2200,
      images: ['https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400&h=400&fit=crop'],
      user: { location: 'Denver, CO' },
      published_groups: [{ id: 'acoustic', name: 'Acoustic Corner', icon: '🪕' }],
    },
  },
  {
    id: 'tm-5',
    my_item: { title: 'Gretsch Streamliner' },
    match_score: 8.8,
    their_item: {
      id: 'tm-5-item',
      type: 'listing',
      title: 'Epiphone Casino',
      subtitle: 'Natural finish, P90 pickups',
      price: 650,
      images: ['https://images.unsplash.com/photo-1605020420620-20c943cc4669?w=400&h=400&fit=crop'],
      user: { location: 'Seattle, WA' },
      published_groups: [{ id: 'vintage-vibes', name: 'Vintage Vibes', icon: '🎸' }],
    },
  },
  {
    id: 'tm-6',
    my_item: { title: 'Jackson Soloist' },
    match_score: 8.3,
    their_item: {
      id: 'tm-6-item',
      type: 'listing',
      title: 'Ibanez RG550',
      subtitle: 'Genesis collection, Road Flare Red',
      price: 850,
      images: ['https://images.unsplash.com/photo-1558098329-a11cff621064?w=400&h=400&fit=crop'],
      user: { location: 'Nashville, TN' },
      published_groups: [{ id: 'shred', name: 'Shred Zone', icon: '🎸' }],
    },
  },
]

/* Demo overrides — some incoming listings match more than one of "my" items.
 * The card renders these as the multi-match dropdown so the prototype can
 * showcase that branch of the UI. */
const multiMatchOverrides: Record<
  string,
  { id: string; title: string; subtitle?: string; image?: string }[]
> = {
  'tm-2': [
    {
      id: 'mine-tele',
      title: 'Fender Telecaster',
      subtitle: 'American Pro II, Butterscotch',
      image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=200&h=200&fit=crop',
    },
    {
      id: 'mine-jazzmaster',
      title: 'Fender Jazzmaster',
      subtitle: '2019, Olympic White',
      image: 'https://images.unsplash.com/photo-1605020420620-20c943cc4669?w=200&h=200&fit=crop',
    },
    {
      id: 'mine-strato',
      title: 'Fender Stratocaster',
      subtitle: '1996, Sunburst',
      image: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=200&h=200&fit=crop',
    },
  ],
  'tm-5': [
    {
      id: 'mine-gretsch-1',
      title: 'Gretsch Streamliner',
      subtitle: 'Claret Burst',
      image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=200&h=200&fit=crop',
    },
    {
      id: 'mine-gretsch-2',
      title: 'Gretsch Electromatic',
      subtitle: 'Aspen Green',
      image: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=200&h=200&fit=crop',
    },
  ],
}

interface TradeMatchesProps {
  showScoreOnboarding?: boolean
}

export function TradeMatches({ showScoreOnboarding = false }: TradeMatchesProps) {
  return (
    <section>
      <HomeSectionHeader
        icon={<Repeat2 className="h-5 w-5 text-primary" />}
        title="Most Recent Trade Matches"
        href="/trade"
        ctaLabel="See more"
      />
      <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:-mx-0 md:px-0">
        {tradeMatches.map((match) => {
          const matchedItems =
            multiMatchOverrides[match.id] ?? [
              { id: match.id, title: match.my_item.title },
            ]
          return (
            <ItemCard
              key={match.id}
              id={match.their_item.id}
              image={match.their_item.images[0]}
              title={match.their_item.title}
              subtitle={match.their_item.subtitle}
              price={match.their_item.price}
              location={match.their_item.user?.location}
              forTrade
              href={`/listings/${match.their_item.id}`}
              collections={match.their_item.published_groups?.map((g) => ({
                id: g.id,
                name: g.name,
                icon: g.icon,
              }))}
              match={{
                score: match.match_score,
                matchedItems,
                fallbackItemTitle: match.my_item.title,
                showScoreOnboarding,
              }}
              className="w-[220px] flex-shrink-0 md:w-[240px]"
            />
          )
        })}
      </div>
    </section>
  )
}
