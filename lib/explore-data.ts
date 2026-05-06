/* Mock pool for the Explore page. Combines listings across criteria
 * (trending / just-listed / following / trade-matches) so the same dataset
 * powers all sort modes. Real backend will likely split these into separate
 * endpoints; the prototype keeps them in one list and filters client-side. */

export interface ExploreMatchedItem {
  id: string
  title: string
  subtitle?: string
  image?: string
}

export interface ExploreItemMatch {
  score: number
  matchedItems: ExploreMatchedItem[]
}

export interface ExploreCollectionChip {
  id: string
  name: string
  icon?: string
}

export interface ExploreItem {
  id: string
  title: string
  subtitle?: string
  image: string
  price?: number
  location?: string
  forSale?: boolean
  forTrade?: boolean
  isFollowed?: boolean
  /** ISO date — used to sort by recency for "Just Listed". */
  createdAt: string
  /** Trending score — higher = more trending. Used for "Trending" sort. */
  trendingScore?: number
  collections?: ExploreCollectionChip[]
  match?: ExploreItemMatch
}

export const exploreItems: ExploreItem[] = [
  {
    id: 'ex-1',
    title: 'Fender Stratocaster',
    subtitle: '2020 American Pro II',
    image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=600&h=450&fit=crop',
    price: 1450,
    location: 'Brooklyn, NY',
    forSale: true,
    createdAt: '2026-04-28',
    trendingScore: 92,
    collections: [{ id: 'fender-fans', name: 'Fender Fans', icon: '🎸' }],
  },
  {
    id: 'ex-2',
    title: 'Gibson Les Paul',
    subtitle: 'Standard, Honey Burst',
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=450&fit=crop',
    price: 2100,
    location: 'Austin, TX',
    forSale: true,
    forTrade: true,
    createdAt: '2026-04-30',
    trendingScore: 88,
    collections: [{ id: 'gibson-gang', name: 'Gibson Gang', icon: '🎸' }],
    match: {
      score: 9.0,
      matchedItems: [{ id: 'mine-tele-1', title: 'Fender Telecaster' }],
    },
  },
  {
    id: 'ex-3',
    title: 'Strymon Timeline',
    subtitle: 'Near mint, all presets',
    image: 'https://images.unsplash.com/photo-1558098329-a11cff621064?w=600&h=450&fit=crop',
    price: 380,
    location: 'Portland, OR',
    forSale: true,
    createdAt: '2026-04-25',
    trendingScore: 75,
  },
  {
    id: 'ex-4',
    title: 'PRS SE Custom 24',
    subtitle: 'Whale Blue, excellent',
    image: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=600&h=450&fit=crop',
    price: 740,
    location: 'Chicago, IL',
    forSale: true,
    isFollowed: true,
    createdAt: '2026-04-22',
    trendingScore: 70,
  },
  {
    id: 'ex-5',
    title: 'Martin 000-15M',
    subtitle: 'Satin mahogany, like new',
    image: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=600&h=450&fit=crop',
    price: 680,
    location: 'Nashville, TN',
    forSale: true,
    forTrade: true,
    createdAt: '2026-05-02',
    trendingScore: 81,
    collections: [{ id: 'acoustic-corner', name: 'Acoustic Corner', icon: '🪕' }],
  },
  {
    id: 'ex-6',
    title: 'Epiphone Casino',
    subtitle: 'Natural finish, P90s',
    image: 'https://images.unsplash.com/photo-1605020420620-20c943cc4669?w=600&h=450&fit=crop',
    price: 650,
    location: 'Seattle, WA',
    forSale: true,
    createdAt: '2026-05-04',
    trendingScore: 60,
  },
  {
    id: 'ex-7',
    title: 'Ibanez RG550',
    subtitle: 'Road Flare Red, 1990',
    image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=600&h=450&fit=crop',
    price: 850,
    location: 'Denver, CO',
    forSale: true,
    forTrade: true,
    createdAt: '2026-05-03',
    trendingScore: 65,
    match: {
      score: 8.3,
      matchedItems: [
        { id: 'mine-jackson', title: 'Jackson Soloist' },
      ],
    },
  },
  {
    id: 'ex-8',
    title: 'Boss DD-500',
    subtitle: 'Excellent, box + manual',
    image: 'https://images.unsplash.com/photo-1558098329-a11cff621064?w=600&h=450&fit=crop',
    price: 250,
    location: 'Brooklyn, NY',
    forSale: true,
    forTrade: true,
    createdAt: '2026-05-04',
    trendingScore: 55,
  },
  {
    id: 'ex-9',
    title: 'Gretsch G2622',
    subtitle: 'Streamliner, Claret Burst',
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=450&fit=crop',
    price: 420,
    location: 'Austin, TX',
    forSale: true,
    createdAt: '2026-05-01',
    trendingScore: 50,
  },
  {
    id: 'ex-10',
    title: 'Taylor 214ce',
    subtitle: 'Grand Auditorium, w/ case',
    image: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=600&h=450&fit=crop',
    price: 1100,
    location: 'Portland, OR',
    forSale: true,
    createdAt: '2026-04-29',
    trendingScore: 68,
  },
  {
    id: 'ex-11',
    title: '1961 ES-335',
    subtitle: 'Cherry, original PAFs',
    image: 'https://images.unsplash.com/photo-1605020420620-20c943cc4669?w=600&h=450&fit=crop',
    price: 12000,
    location: 'Nashville, TN',
    forSale: true,
    forTrade: true,
    isFollowed: true,
    createdAt: '2026-04-15',
    trendingScore: 95,
    collections: [{ id: 'vintage-vibes', name: 'Vintage Vibes', icon: '📻' }],
  },
  {
    id: 'ex-12',
    title: 'Klon Centaur',
    subtitle: 'Gold, horsie, w/ box',
    image: 'https://images.unsplash.com/photo-1558098329-a11cff621064?w=600&h=450&fit=crop',
    price: 3800,
    location: 'Brooklyn, NY',
    forSale: true,
    isFollowed: true,
    createdAt: '2026-04-10',
    trendingScore: 89,
  },
  {
    id: 'ex-13',
    title: 'Dumble ODS 50',
    subtitle: 'Clone by Howard Dumble',
    image: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=600&h=450&fit=crop',
    price: 7500,
    location: 'Los Angeles, CA',
    forSale: true,
    isFollowed: true,
    createdAt: '2026-04-12',
    trendingScore: 78,
  },
  {
    id: 'ex-14',
    title: 'Pre-CBS Telecaster',
    subtitle: '1964, Dakota Red',
    image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=600&h=450&fit=crop',
    price: 18000,
    location: 'Austin, TX',
    forSale: true,
    forTrade: true,
    isFollowed: true,
    createdAt: '2026-04-08',
    trendingScore: 84,
  },
  {
    id: 'ex-15',
    title: 'Gibson SG Standard',
    subtitle: 'Cherry red, excellent condition',
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=450&fit=crop',
    price: 1200,
    location: 'Austin, TX',
    forSale: true,
    forTrade: true,
    createdAt: '2026-04-26',
    trendingScore: 72,
    collections: [{ id: 'gibson-gang', name: 'Gibson Gang', icon: '🎸' }],
    match: {
      score: 9.2,
      matchedItems: [
        {
          id: 'mine-tele-2',
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
      ],
    },
  },
  {
    id: 'ex-16',
    title: 'PRS Custom 24',
    subtitle: '10-top, McCarty burst',
    image: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=600&h=450&fit=crop',
    price: 2800,
    location: 'Portland, OR',
    forSale: true,
    forTrade: true,
    createdAt: '2026-04-23',
    trendingScore: 67,
    collections: [{ id: 'prs-players', name: 'PRS Players', icon: '🎸' }],
    match: {
      score: 8.5,
      matchedItems: [{ id: 'mine-suhr', title: 'Suhr Modern' }],
    },
  },
  {
    id: 'ex-17',
    title: 'Martin D-28',
    subtitle: '2020, solid Sitka spruce top',
    image: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=600&h=450&fit=crop',
    price: 2200,
    location: 'Denver, CO',
    forSale: true,
    forTrade: true,
    createdAt: '2026-04-20',
    trendingScore: 62,
    collections: [{ id: 'acoustic-corner', name: 'Acoustic Corner', icon: '🪕' }],
    match: {
      score: 7.8,
      matchedItems: [{ id: 'mine-taylor', title: 'Taylor 814ce' }],
    },
  },
  {
    id: 'ex-18',
    title: 'Eastman T64/v',
    subtitle: 'Antique varnish, thinline',
    image: 'https://images.unsplash.com/photo-1605020420620-20c943cc4669?w=600&h=450&fit=crop',
    price: 1850,
    location: 'Brooklyn, NY',
    forTrade: true,
    createdAt: '2026-05-04',
    trendingScore: 45,
    collections: [{ id: 'vintage-vibes', name: 'Vintage Vibes', icon: '📻' }],
  },
]
