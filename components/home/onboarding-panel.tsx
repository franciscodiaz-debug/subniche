"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Box,
  Heart,
  PlayCircle,
  Sparkles,
  UserCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type OnboardingTaskId = "items" | "trades" | "profile";

type OnboardingTask = {
  body: string;
  completion: number;
  duration: string;
  href: string;
  icon: LucideIcon;
  id: OnboardingTaskId;
  progress: string;
  preview: string;
  previewTitle: string;
  title: string;
};

const onboardingTasks: OnboardingTask[] = [
  {
    id: "items",
    icon: Box,
    title: "List 3 items",
    progress: "1/3",
    completion: 33,
    duration: "0:18",
    href: "/add-item",
    body: "Show the community what you are bringing to the table.",
    previewTitle: "How listing works",
    preview:
      "Snap photos, add condition details, and your piece is live in under a minute.",
  },
  {
    id: "trades",
    icon: Heart,
    title: "Set 3 trade interests",
    progress: "0/3",
    completion: 0,
    duration: "0:14",
    href: "/trade",
    body: "Tell other collectors what you are looking for.",
    previewTitle: "Setting trade interests",
    preview:
      "Tell SubNiche what you are chasing so we can surface matching gear automatically.",
  },
  {
    id: "profile",
    icon: UserCircle,
    title: "Complete profile",
    progress: "0%",
    completion: 0,
    duration: "0:12",
    href: "/profile",
    body: "A few details help buyers and traders know who you are.",
    previewTitle: "Building trust on your profile",
    preview:
      "A verified profile with a bio and avatar closes trades faster.",
  },
];

export function OnboardingPanel() {
  const [activeTaskId, setActiveTaskId] = useState<OnboardingTaskId>("items");
  const [previewTaskId, setPreviewTaskId] = useState<OnboardingTaskId | null>(
    null,
  );
  const [dismissed, setDismissed] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const panelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const updateStickyState = () => {
      const panel = panelRef.current;
      if (!panel) {
        return;
      }

      setStickyVisible(panel.getBoundingClientRect().bottom < 72);
    };

    updateStickyState();
    window.addEventListener("scroll", updateStickyState, { passive: true });
    window.addEventListener("resize", updateStickyState);

    return () => {
      window.removeEventListener("scroll", updateStickyState);
      window.removeEventListener("resize", updateStickyState);
    };
  }, []);

  if (dismissed) {
    return null;
  }

  const previewTask = onboardingTasks.find((task) => task.id === previewTaskId);
  const previewTaskIndex = previewTask
    ? onboardingTasks.findIndex((task) => task.id === previewTask.id)
    : 0;

  return (
    <>
      <section
        ref={panelRef}
        className="relative isolate -mx-4 overflow-hidden px-4 pb-8 pt-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10"
        aria-labelledby="onboarding-heading"
      >
        <div className="absolute inset-0 -z-10">
          <Image
            src="/hero-guitar.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-35"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-background via-background/82 to-background/35"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-background/35 via-background/60 to-background"
          />
        </div>
        <div className="relative">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-lg font-semibold">
                <span className="text-muted-foreground">sn</span>
                <span className="mx-2 text-muted-foreground/60">/</span>
                <span className="text-foreground">MusicGear</span>
              </div>
              <h2
                id="onboarding-heading"
                className="mt-3 text-3xl font-bold leading-tight text-foreground md:text-4xl"
              >
                Welcome to{" "}
                <span className="text-muted-foreground">sn</span>
                <span className="text-primary">/MusicGear</span>
              </h2>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span>
                  <span className="text-success">•</span>{" "}
                  <span className="font-semibold text-foreground">12,487</span>{" "}
                  pieces of gear listed
                </span>
                <span>
                  <span className="text-primary">•</span>{" "}
                  <span className="font-semibold text-foreground">42</span>{" "}
                  gear communities
                </span>
                <span>
                  <span className="text-info">•</span>{" "}
                  <span className="font-semibold text-foreground">3,214</span>{" "}
                  musicians online
                </span>
              </div>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
                You have joined a community of musicians, collectors, and
                gearheads. Take a moment to introduce yourself and show others
                what you are about.
              </p>
            </div>
          </div>

          <div className="mt-7 max-w-3xl">
            <div
              data-testid="home-onboarding-task-list"
              className="relative grid gap-3"
            >
              {previewTask ? (
                <div
                  data-testid="home-onboarding-video-preview"
                  className="pointer-events-none absolute left-1/2 z-0 hidden w-[288px] -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-card shadow-overlay md:block"
                  style={{
                    top: `${previewTaskIndex * 88 + 52}px`,
                  }}
                >
                  <div className="relative h-36">
                    <Image
                      src="/hero-guitar.jpg"
                      alt=""
                      fill
                      sizes="288px"
                      className="object-cover opacity-85"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {previewTask.previewTitle}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-muted-foreground">
                          {previewTask.preview}
                        </p>
                      </div>
                      <span className="rounded-full bg-background/80 px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                        {previewTask.duration}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              {onboardingTasks.map((task) => {
                const Icon = task.icon;
                const active = activeTaskId === task.id;
                const previewVisible = previewTaskId === task.id;

                return (
                  <Card
                    key={task.id}
                    className={cn(
                      "relative z-10 rounded-xl border-border bg-card/70 px-4 py-3 backdrop-blur-sm transition hover:border-primary/35 hover:bg-card/90",
                      active &&
                        "border-primary bg-primary/10 shadow-[0_0_0_1px_rgb(215_168_79_/_0.35)] hover:bg-primary/15",
                    )}
                  >
                    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                      <button
                        type="button"
                        className={cn(
                          "grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-primary/45 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35",
                          active &&
                            "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                        )}
                        aria-pressed={active}
                        aria-label={`Select onboarding task: ${task.title}`}
                        onClick={() => setActiveTaskId(task.id)}
                      >
                        <Icon className="size-5" aria-hidden="true" />
                      </button>
                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <button
                            type="button"
                            className="min-w-0 text-left text-[15px] font-semibold text-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                            onClick={() => setActiveTaskId(task.id)}
                          >
                            <span className="block truncate">
                              {task.title}
                            </span>
                          </button>
                          <span
                            className={cn(
                              "rounded-full border border-border bg-card px-2 py-0.5 text-xs font-semibold text-muted-foreground",
                              active &&
                                "border-primary/45 bg-primary/10 text-primary",
                            )}
                          >
                            {task.progress}
                          </span>
                          <button
                            type="button"
                            aria-label={`Preview ${task.title} video (${task.duration})`}
                            aria-pressed={previewVisible}
                            className={cn(
                              "grid size-7 place-items-center rounded-md border border-transparent text-muted-foreground transition hover:border-primary/45 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35",
                              previewVisible &&
                                "border-border bg-secondary text-foreground",
                            )}
                            onClick={() => {
                              setActiveTaskId(task.id);
                              setPreviewTaskId((current) =>
                                current === task.id ? null : task.id,
                              );
                            }}
                          >
                            <PlayCircle className="size-4" aria-hidden="true" />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="mt-1 block max-w-full text-left text-[13px] leading-5 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                          onClick={() => setActiveTaskId(task.id)}
                        >
                          {task.body}
                        </button>
                      </div>
                      <Link
                        href={task.href}
                        aria-label={`Open ${task.title}`}
                        className={cn(
                          "grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35",
                          active && "text-primary",
                        )}
                      >
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
            <button
              type="button"
              data-testid="home-onboarding-dismiss"
              className="ml-auto mr-4 mt-4 block w-fit rounded-sm text-xs font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
              onClick={() => setDismissed(true)}
            >
              I&apos;ll do this later
            </button>
          </div>
        </div>
      </section>

      <div
        data-testid="home-onboarding-sticky"
        className={cn(
          "fixed inset-x-0 top-0 z-40 border-b border-border bg-background/95 px-4 py-3 shadow-overlay backdrop-blur transition duration-200 sm:px-6 lg:left-[220px] lg:px-10",
          stickyVisible
            ? "visible translate-y-0 opacity-100"
            : "invisible pointer-events-none -translate-y-full opacity-0",
        )}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
              <Sparkles className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground sm:text-base">
                Introduce yourself to the community
              </p>
              <p className="text-xs text-muted-foreground">
                0 of 3 completed
              </p>
            </div>
          </div>
          <div className="hidden h-1.5 min-w-36 flex-1 overflow-hidden rounded-full bg-muted sm:block">
            <div className="h-full w-1/6 rounded-full bg-primary" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {onboardingTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                className={cn(
                  "rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground transition hover:border-primary/45 hover:text-foreground",
                  activeTaskId === task.id &&
                    "border-primary/60 bg-primary/10 text-primary",
                )}
                onClick={() => {
                  setActiveTaskId(task.id);
                  panelRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              >
                {task.id === "items"
                  ? "List items"
                  : task.id === "trades"
                    ? "Trade interests"
                    : "Profile"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/add-item"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold shadow-card transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              style={{ color: "#07111f" }}
            >
              Add your first item
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              aria-label="Back to onboarding steps"
              className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition hover:border-primary/45 hover:text-foreground"
              onClick={() =>
                panelRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
            >
              <ArrowRight
                className="-rotate-90 size-4"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
