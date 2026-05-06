import Image from 'next/image'
import Link from 'next/link'
import { Layers, Star, Users } from 'lucide-react'
import { HomeSectionHeader } from '@/components/home/home-section-header'

const featuredCollections = [
  {
    id: 'c1',
    name: 'Vintage Fenders',
    owner: 'tonewood_trader',
    cover: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400&h=300&fit=crop',
    count: 14,
  },
  {
    id: 'c2',
    name: 'Boutique Pedals',
    owner: 'pedalboard_king',
    cover: 'https://images.unsplash.com/photo-1558098329-a11cff621064?w=400&h=300&fit=crop',
    count: 27,
  },
  {
    id: 'c3',
    name: '70s Japanese Guitars',
    owner: 'lawsuit_era',
    cover: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop',
    count: 9,
  },
  {
    id: 'c4',
    name: 'Modular Synths',
    owner: 'patchwire_studio',
    cover: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=400&h=300&fit=crop',
    count: 31,
  },
  {
    id: 'c5',
    name: 'Nashville Acoustics',
    owner: 'flatpicker_fg',
    cover: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400&h=300&fit=crop',
    count: 18,
  },
]

const featuredUsers = [
  {
    id: 'u1',
    displayName: 'Mara Solano',
    username: 'marasolano',
    avatar: 'https://i.pravatar.cc/150?img=47',
    tagline: 'Vintage Fender collector',
    items: 23,
  },
  {
    id: 'u2',
    displayName: 'Dev Khalsa',
    username: 'devkhalsa',
    avatar: 'https://i.pravatar.cc/150?img=12',
    tagline: 'Boutique amp builder',
    items: 11,
  },
  {
    id: 'u3',
    displayName: 'Rosa Park',
    username: 'rosapark_tones',
    avatar: 'https://i.pravatar.cc/150?img=32',
    tagline: 'Jazz guitarist & collector',
    items: 17,
  },
  {
    id: 'u4',
    displayName: 'Luca Torino',
    username: 'lucatorino',
    avatar: 'https://i.pravatar.cc/150?img=67',
    tagline: 'Synth enthusiast',
    items: 34,
  },
  {
    id: 'u5',
    displayName: 'Jamie Cross',
    username: 'jamiecross',
    avatar: 'https://i.pravatar.cc/150?img=51',
    tagline: 'Pedal builder & trader',
    items: 8,
  },
]

const staffPicks = [
  {
    id: 'sp1',
    title: '1966 Gibson ES-335',
    subtitle: 'Cherry red, original hardware',
    price: 8500,
    image: 'https://images.unsplash.com/photo-1605020420620-20c943cc4669?w=400&h=400&fit=crop',
    seller: 'vintage_cellar',
  },
  {
    id: 'sp2',
    title: 'Strymon BigSky',
    subtitle: 'Like new, all presets saved',
    price: 360,
    image: 'https://images.unsplash.com/photo-1558098329-a11cff621064?w=400&h=400&fit=crop',
    seller: 'tone_garage',
  },
  {
    id: 'sp3',
    title: 'Martin OM-28',
    subtitle: '2018, fingerstyle legend',
    price: 2200,
    image: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400&h=400&fit=crop',
    seller: 'flatpicker_fg',
  },
  {
    id: 'sp4',
    title: 'Moog Subsequent 37',
    subtitle: 'Perfect condition, box included',
    price: 1450,
    image: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=400&h=400&fit=crop',
    seller: 'patchwire_studio',
  },
]

export function FeaturedCollectionsSection() {
  return (
    <section className="mb-6">
      <HomeSectionHeader
        icon={<Layers className="h-5 w-5 text-primary" />}
        title="Featured Collections"
        href="/communities"
        ctaLabel="See all"
      />
      <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:-mx-0 md:px-0">
        {featuredCollections.map((col) => (
          <Link
            key={col.id}
            href="/communities"
            className="group w-[180px] flex-shrink-0 overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={col.cover}
                alt={col.name}
                fill
                sizes="180px"
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-semibold text-foreground">{col.name}</p>
              <p className="text-[10px] text-muted-foreground">by @{col.owner}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{col.count} items</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function FeaturedUsersSection() {
  return (
    <section className="mb-6">
      <HomeSectionHeader
        icon={<Users className="h-5 w-5 text-primary" />}
        title="People to Follow"
        href="/communities"
        ctaLabel="Explore"
      />
      <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:-mx-0 md:px-0">
        {featuredUsers.map((user) => (
          <div
            key={user.id}
            className="flex w-[160px] flex-shrink-0 flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center transition-colors hover:border-primary/30"
          >
            <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-border">
              <Image
                src={user.avatar}
                alt={user.displayName}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{user.displayName}</p>
              <p className="text-[10px] text-muted-foreground">@{user.username}</p>
              <p className="mt-1 text-[10px] leading-snug text-muted-foreground">{user.tagline}</p>
            </div>
            <span className="text-[10px] text-muted-foreground/60">{user.items} listings</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export function StaffPicksSection() {
  return (
    <section className="mb-6">
      <HomeSectionHeader
        icon={<Star className="h-5 w-5 text-primary" />}
        title="Staff Picks"
        href="/market?tab=for-sale"
        ctaLabel="See all"
      />
      <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:-mx-0 md:px-0">
        {staffPicks.map((pick) => (
          <Link
            key={pick.id}
            href="/market?tab=for-sale"
            className="group w-[200px] flex-shrink-0 overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40"
          >
            <div className="relative aspect-square w-full overflow-hidden">
              <Image
                src={pick.image}
                alt={pick.title}
                fill
                sizes="200px"
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-semibold text-foreground">{pick.title}</p>
              <p className="truncate text-[10px] text-muted-foreground">{pick.subtitle}</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm font-bold text-primary">${pick.price.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">@{pick.seller}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
