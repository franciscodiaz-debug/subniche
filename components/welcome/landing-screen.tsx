"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import {
  Menu, X, ArrowRight, Check, ChevronDown, ChevronUp,
  Store, Repeat2, FolderHeart, Users, SlidersHorizontal,
  Guitar, Bike, LayoutGrid, Watch, Shirt,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SubnicheLogo } from "@/components/app-shell/subniche-logo"

const heroImages = [
  "https://picsum.photos/seed/guitars-stage/1600/900",
  "https://picsum.photos/seed/guitars-vintage/1600/900",
  "https://picsum.photos/seed/guitars-workshop/1600/900",
  "https://picsum.photos/seed/guitars-collection/1600/900",
]

const gearImages = [
  "https://picsum.photos/seed/gear-a/300/300",
  "https://picsum.photos/seed/gear-b/300/300",
  "https://picsum.photos/seed/gear-c/300/300",
  "https://picsum.photos/seed/gear-d/300/300",
  "https://picsum.photos/seed/gear-e/300/300",
  "https://picsum.photos/seed/gear-f/300/300",
]

const featureTabs = [
  {
    id: "niche-markets",
    label: "Niche Markets",
    icon: Store,
    title: "All signal, no noise.",
    features: [
      "Individual niche markets for specific interests",
      "Connect with other experts and enthusiasts",
      "Custom categories and filters",
    ],
    testimonial: {
      quote: "SubNiche isn't another marketplace — people here actually get it.",
      author: "Marcus Chen",
      role: "Vintage Guitar Community Founder",
    },
  },
  {
    id: "trade-matching",
    label: "Trade Matching",
    icon: Repeat2,
    title: "Native trade matching",
    features: [
      "Set trade criteria as specific or broad as you like",
      "Easily browse matches and incoming interest for your item",
      "The more items you upload, the more matches you see",
    ],
    testimonial: {
      quote: "No more screaming into the void — this trade matching interface is amazing!",
      author: "David Park",
      role: "Vintage Watch Collector",
    },
  },
  {
    id: "collections",
    label: "Collections",
    icon: FolderHeart,
    title: "Organize, track, share",
    features: [
      "Curate your own themed gear collections",
      "Track value, details, owner notes, receipts, etc.",
      "Share, browse, and discuss with others — or keep private",
    ],
    testimonial: {
      quote: "I love being able to keep my stuff organized all in one place and share it with other users. The stoke is real!",
      author: "Jamie Williams",
      role: "Vintage Guitar Collector",
    },
  },
  {
    id: "custom-filters",
    label: "Custom Filters",
    icon: SlidersHorizontal,
    title: "Structure that matches how enthusiasts think.",
    features: [
      "Custom taxonomies for each niche",
      "Attribute-based filtering that makes sense",
      "Cross-posting between related communities",
      "Search that understands your domain",
    ],
    testimonial: {
      quote: "People find exactly what they want because the filters actually match our terminology.",
      author: "Emma Rodriguez",
      role: "Guitar Traders Group Moderator",
    },
  },
  {
    id: "communities",
    label: "Communities",
    icon: Users,
    title: "Communities that feel like clubs, not feeds.",
    features: [
      "Bring listings, discussion, and identity into one environment",
      "Build trust through shared passion and verified transactions",
      "Create spaces where people actually stick around",
      "Integrate marketplace activity with community presence",
    ],
    testimonial: {
      quote: "Finally, a place where our community can discuss AND transact without switching platforms.",
      author: "Sarah Mitchell",
      role: "Guitar Collectors Group Admin",
    },
  },
]

const faqItems = [
  {
    question: "What makes this different from Facebook Marketplace or eBay?",
    answer: "Generic platforms are transactional and end up feeling like a yard sale or ecommerce site, rather than a specialty market. SubNiche prioritizes specificity, user interaction, and organic trust in an environment of like-minded enthusiasts.",
  },
  {
    question: "Is this only for selling?",
    answer: "No, trading is a core part of the product. Users can define what they want and the system surfaces matches automatically.",
  },
  {
    question: "What are the fees for transactions?",
    answer: "SubNiche is a non-intermediated peer-to-peer platform and does not charge transaction fees.",
  },
  {
    question: "Can each community have its own structure?",
    answer: "Each community adheres to the general niche taxonomy to preserve the ability to cross-post, however, community admins can define allowed categories and attributes within a community to help the group stay focused.",
  },
  {
    question: "How does SubNiche make money?",
    answer: "SubNiche is funded through donations and premium subscriptions. We also offer additional services such as advertising, sponsored listings, affiliate referrals, and revenue splits from paid membership communities.",
  },
  {
    question: "Are niches just categories?",
    answer: "No — each niche is kept distinct and separate. Users must maintain unique user profiles, listings, feedback scores, and cred ratings in each niche.",
  },
]

function BrowserMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/50">
      <div className="flex items-center gap-2 border-b border-border bg-card/80 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <div className="ml-4 flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-primary/80" />
          <span className="text-sm font-medium">SubNiche</span>
        </div>
        <div className="ml-auto flex gap-4 text-xs text-foreground/50">
          <span>Home</span>
          <span>Market</span>
          <span>Trade</span>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div className="h-20 rounded-lg border border-border bg-card/60" />
        <div className="flex gap-3">
          <div className="h-16 flex-1 rounded-lg border border-border bg-card/60" />
          <div className="space-y-2">
            <div className="h-7 w-20 rounded border border-border bg-card/60" />
            <div className="h-16 w-20 rounded-lg border border-border bg-card/60" />
            <div className="h-10 w-20 rounded-lg border border-border bg-card/60" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-14 flex-1 rounded-lg border border-border bg-card/60" />
          <div className="h-14 flex-1 rounded-lg border border-border bg-card/60" />
          <div className="h-14 flex-1 rounded-lg border border-border bg-card/60" />
        </div>
      </div>
    </div>
  )
}

export function LandingScreen() {
  const [scrollY, setScrollY] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("niche-markets")
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [heroImageIndex, setHeroImageIndex] = useState(0)
  const tabSectionRef = useRef<HTMLDivElement>(null)
  const tabIndexRef = useRef(0)

  const { scrollYProgress } = useScroll({
    target: tabSectionRef,
    offset: ["start start", "end end"],
  })
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 20 })

  useEffect(() => {
    return smoothProgress.on("change", (v) => {
      const newIndex = Math.min(featureTabs.length - 1, Math.floor(v * featureTabs.length))
      if (newIndex !== tabIndexRef.current) {
        tabIndexRef.current = newIndex
        setActiveTab(featureTabs[newIndex].id)
      }
    })
  }, [smoothProgress])

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const currentTab = featureTabs.find((t) => t.id === activeTab) || featureTabs[0]

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-50 px-6 md:px-10" style={{ height: "72px" }}>
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
          <Link href="/" aria-label="SubNiche home">
            <SubnicheLogo width={117} height={36} light priority />
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" className="text-foreground/80 hover:text-foreground hover:bg-white/10" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-foreground/80 hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <motion.div
              className="absolute left-0 right-0 top-[72px] flex flex-col gap-4 border-b border-border bg-card p-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Button variant="quiet_outline" className="w-full" asChild onClick={() => setMobileMenuOpen(false)}>
                <Link href="/login">Log in</Link>
              </Button>
              <Button className="w-full bg-primary text-primary-foreground" asChild onClick={() => setMobileMenuOpen(false)}>
                <Link href="/signup">Sign up</Link>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-center overflow-hidden px-6 pt-[72px]">
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroImageIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0"
              style={{ transform: `translateY(${scrollY * 0.3}px)` }}
            >
              <Image src={heroImages[heroImageIndex]} alt="" fill className="object-cover" priority />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-background/85" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16">
          <motion.p
            className="mb-4 text-sm font-medium text-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            The platform
          </motion.p>
          <motion.h1
            className="mb-6 max-w-3xl text-balance text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            Where enthusiasts meet to buy, sell, and{" "}
            <span className="rounded-md bg-primary/15 px-3 py-1 text-primary">trade</span>.
          </motion.h1>
          <motion.p
            className="mb-8 max-w-2xl text-base leading-relaxed text-foreground/70 md:text-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Built to bring people together to buy, sell, trade, and connect with others who care about the same thing.
            No generic categories. No yard-sale chaos. Designed by enthusiasts, for enthusiasts.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button className="group gap-2 bg-primary font-semibold text-primary-foreground hover:bg-primary/90" asChild>
              <Link href="/signup">
                Find your people
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Feature tabs — scroll-driven */}
      <section
        ref={tabSectionRef}
        className="relative z-10 px-6"
        style={{ height: `${featureTabs.length * 100}vh` }}
      >
        <div className="sticky top-0 flex h-screen flex-col justify-start pb-8 pt-16">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-8 flex flex-wrap gap-2">
              {featureTabs.map((tab, i) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); tabIndexRef.current = i }}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? "border-primary bg-card text-foreground shadow-lg"
                      : "border-transparent text-foreground/60 hover:bg-card/50 hover:text-foreground"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="rounded-2xl border border-border bg-card/50 p-8 md:p-12"
              >
                <div className="grid items-start gap-8 md:grid-cols-2 md:gap-12">
                  <div>
                    <h3 className="mb-6 text-2xl font-bold md:text-3xl">{currentTab.title}</h3>
                    <ul className="mb-8 space-y-4">
                      {currentTab.features.map((feature, i) => (
                        <motion.li
                          key={feature}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-start gap-3"
                        >
                          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20">
                            <Check className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-foreground/80">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <div className="rounded-xl border-l-2 border-primary/50 bg-card/80 p-6">
                      <p className="mb-4 italic text-foreground/80">&ldquo;{currentTab.testimonial.quote}&rdquo;</p>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/10 text-sm font-medium">
                          {currentTab.testimonial.author[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{currentTab.testimonial.author}</p>
                          <p className="text-xs text-foreground/50">{currentTab.testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <BrowserMockup />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Purpose built */}
      <section className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="mb-6 text-3xl font-bold md:text-4xl">Purpose built for enthusiasts.</h2>
              <p className="mb-8 text-foreground/70">
                Community and social groups try to make existing platforms fit when they don&apos;t. Experience a
                network designed from the ground-up to meet your needs.
              </p>
              <ul className="space-y-4">
                {[
                  "Fully featured market interface, not news feeds or message threads",
                  "Structured listings instead of vague posts",
                  "Expansive attribute-based filtering",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 text-primary" />
                    <span className="text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-medium">Marketplace</span>
                  <span className="rounded-full bg-primary/20 px-2 py-1 text-xs text-primary">24 new</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {gearImages.map((img, i) => (
                    <div key={i} className="aspect-square overflow-hidden rounded-lg bg-background/50">
                      <Image src={img} alt="" width={150} height={150} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Real communities */}
      <section className="relative z-10 bg-card/30 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 md:order-1">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center gap-4">
                  <div className="h-12 w-12 overflow-hidden rounded-lg bg-primary/20">
                    <Image src="https://picsum.photos/seed/guitar-community/48/48" alt="" width={48} height={48} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Vintage Guitar Exchange</h4>
                    <p className="text-sm text-foreground/50">2,847 members</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-12 rounded-lg border border-border bg-background/50" />
                  <div className="h-12 rounded-lg border border-border bg-background/50" />
                  <div className="h-12 rounded-lg border border-border bg-background/50" />
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 md:order-2">
              <h2 className="mb-6 text-3xl font-bold md:text-4xl">Not just groups. Real communities.</h2>
              <p className="text-foreground/70">
                User-led communities bring interests, listings, and discussion into the same space. Create your own —
                public, private, or invite-only — and invite your network.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Collections */}
      <section className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="mb-6 text-3xl font-bold md:text-4xl">Your collection, organized.</h2>
              <ul className="space-y-4">
                {[
                  "AI-assisted uploads get your items in fast",
                  "Track value, keep owner notes and documentation",
                  "Curate themed collections and share with the community",
                  "Seamlessly list for sale or trade whenever you're ready",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 text-primary" />
                    <span className="text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="mb-4 grid grid-cols-3 gap-3">
                  {gearImages.map((img, i) => (
                    <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-background/50">
                      <Image src={img} alt="" width={150} height={150} className="h-full w-full object-cover" />
                      {i < 2 && (
                        <span className="absolute bottom-1 right-1 rounded bg-primary/90 px-1.5 py-0.5 text-xs text-primary-foreground">
                          {i === 0 ? "$340" : "$1.2k"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-foreground/50">
                  <span>Collection value <strong className="text-foreground">$8,420</strong></span>
                  <span>Items <strong className="text-foreground">34</strong></span>
                  <span>Visibility <strong className="text-foreground">Private</strong></span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trade */}
      <section className="relative z-10 bg-card/30 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 md:order-1">
              <div className="rounded-xl border border-border bg-card p-6">
                <h4 className="mb-4 font-semibold">Trade Matches</h4>
                <div className="space-y-4">
                  {[
                    { match: 94, img1: gearImages[0], img2: gearImages[3] },
                    { match: 78, img1: gearImages[1], img2: gearImages[4] },
                  ].map((trade, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-lg border border-border bg-background/50 p-3">
                      <div className="h-14 w-14 overflow-hidden rounded-lg">
                        <Image src={trade.img1} alt="" width={56} height={56} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex flex-1 items-center justify-center">
                        <div className="flex items-center gap-2 text-xs">
                          <ArrowRight className="h-4 w-4 text-primary" />
                          <span className="rounded-full bg-primary/20 px-2 py-1 font-medium text-primary">{trade.match}% match</span>
                        </div>
                      </div>
                      <div className="h-14 w-14 overflow-hidden rounded-lg">
                        <Image src={trade.img2} alt="" width={56} height={56} className="h-full w-full object-cover" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 md:order-2">
              <h2 className="mb-6 text-3xl font-bold md:text-4xl">Trade gear, not dollars.</h2>
              <p className="mb-8 text-foreground/70">Trading made easy.</p>
              <ul className="space-y-4">
                {["Algorithmic trade matching", "Browse matches and one-way interest", "Specific or broad criteria", "Intuitive offer interface"].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 text-primary" />
                    <span className="text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.h2 className="mb-16 text-center text-3xl font-bold md:text-4xl" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            How it works
          </motion.h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { step: "01", title: "Find your niche", description: "Don't see yours? Suggest a new one." },
              { step: "02", title: "Build your collections & profile", description: "Upload items, create collections, organize and track. Curate your profile. Establish your cred." },
              { step: "03", title: "Share, connect & invite", description: "Share collections, explore trades, join communities and connect with like-minded enthusiasts." },
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-xl border border-border bg-card p-6">
                <span className="text-4xl font-bold text-primary/30">{item.step}</span>
                <h3 className="mb-2 mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-foreground/60">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <motion.h2 className="mb-6 text-3xl font-bold md:text-5xl" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            For those who get it
          </motion.h2>
          <motion.p className="mb-10 text-lg text-foreground/70" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            When you&apos;re with the right people, everything works better.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <Button size="lg" className="group h-auto gap-2 bg-primary px-8 py-6 text-lg text-primary-foreground hover:bg-primary/90" asChild>
              <Link href="/signup">
                Find your people
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Current niches */}
      <section className="relative z-10 bg-card/30 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.p className="mb-4 text-center text-foreground/50" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            already live on SubNiche
          </motion.p>
          <motion.h2 className="mb-12 text-center text-3xl font-bold md:text-4xl" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            Current niches
          </motion.h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: Guitar, label: "Guitars", available: true, href: "/" },
              { icon: Bike, label: "Motorcycles", available: false },
              { icon: Watch, label: "Watches", available: false },
              { icon: LayoutGrid, label: "Collectors", available: false },
              { icon: Shirt, label: "Clothes", available: false },
            ].map((niche, i) => (
              <motion.div key={niche.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                {niche.available && niche.href ? (
                  <Link
                    href={niche.href}
                    className="flex items-center gap-3 rounded-full border border-border bg-card px-6 py-4 transition-colors hover:border-primary/30"
                  >
                    <niche.icon className="h-5 w-5 text-foreground/60" />
                    <span className="font-medium">{niche.label}</span>
                  </Link>
                ) : (
                  <div className="flex cursor-not-allowed items-center gap-3 rounded-full border border-border/50 bg-card/30 px-6 py-4 opacity-50">
                    <niche.icon className="h-5 w-5 text-foreground/60" />
                    <span className="font-medium">{niche.label}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <motion.h2 className="mb-16 text-center text-3xl font-bold md:text-4xl" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            Frequently asked questions
          </motion.h2>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="overflow-hidden rounded-xl border border-border">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-card/50"
                >
                  <span className="pr-4 font-medium">{item.question}</span>
                  {openFaq === i ? <ChevronUp className="h-5 w-5 shrink-0 text-foreground/50" /> : <ChevronDown className="h-5 w-5 shrink-0 text-foreground/50" />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <p className="px-6 pb-6 text-foreground/70">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-card px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <SubnicheLogo width={100} height={31} light />
            <p className="text-sm text-foreground/50">Community marketplaces built for enthusiasts.</p>
          </div>
          <div className="flex items-center gap-6 text-sm text-foreground/50">
            <button className="transition-colors hover:text-foreground">Privacy</button>
            <button className="transition-colors hover:text-foreground">Terms</button>
            <button className="transition-colors hover:text-foreground">Contact</button>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-6xl border-t border-border pt-8">
          <p className="text-center text-xs text-foreground/40">
            &copy; 2025 SubNiche. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
