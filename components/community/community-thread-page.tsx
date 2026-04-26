import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  MessageCircle,
  Send,
  Share2,
  Sparkles,
  ThumbsUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type {
  MockCommunity,
  MockProfile,
} from "@/data/mock/types";
import type {
  MockCommunityComment,
  MockCommunityThread,
} from "@/components/community/community-detail-data";

type CommunityThreadPageProps = {
  author?: MockProfile;
  comments: Array<MockCommunityComment & { author?: MockProfile }>;
  community: MockCommunity;
  thread: MockCommunityThread;
};

export function CommunityThreadPage({
  author,
  comments,
  community,
  thread,
}: CommunityThreadPageProps) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <Link
        href={`/communities/${community.slug}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to {community.name}
      </Link>

      <article className="mt-6 overflow-hidden rounded-lg border border-border bg-surface">
        <div className="border-b border-border p-5">
          <div className="flex flex-wrap items-center gap-2">
            {thread.pinned ? <Badge variant="default">Pinned</Badge> : null}
            <Badge variant="outline">{thread.type.replaceAll("_", " ")}</Badge>
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-foreground">
            {thread.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <AuthorInline profile={author} />
            <span>{thread.score} votes</span>
            <span>{thread.commentCount} comments</span>
          </div>
        </div>
        <div className="p-5">
          <p className="text-base leading-7 text-muted-foreground">
            {thread.body}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              <ThumbsUp className="size-4" aria-hidden="true" />
              Upvote
            </button>
            <button
              type="button"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              <Bookmark className="size-4" aria-hidden="true" />
              Save
            </button>
            <button
              type="button"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              <Share2 className="size-4" aria-hidden="true" />
              Share
            </button>
          </div>
        </div>
      </article>

      <Card className="mt-6 rounded-lg p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <MessageCircle className="size-4 text-accent" aria-hidden="true" />
          Reply
        </div>
        <Textarea
          className="mt-4"
          placeholder="Add community context..."
          readOnly
        />
        <button
          type="button"
          className={buttonVariants({ variant: "primary", size: "sm", className: "mt-3" })}
        >
          <Send className="size-4" aria-hidden="true" />
          Post reply
        </button>
      </Card>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">Comments</h2>
        <div className="mt-4 space-y-3">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <Card key={comment.id} className="rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AuthorAvatar profile={comment.author} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {comment.author?.displayName ?? "Member"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {comment.score} votes
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {comment.body}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="rounded-lg p-5 text-sm text-muted-foreground">
              <Sparkles className="mb-3 size-5 text-accent" aria-hidden="true" />
              No replies yet. This is ready for the first useful answer.
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}

function AuthorInline({ profile }: { profile?: MockProfile }) {
  return (
    <span className="inline-flex items-center gap-2">
      <AuthorAvatar profile={profile} size="sm" />
      {profile?.displayName ?? "Member"}
    </span>
  );
}

function AuthorAvatar({
  profile,
  size = "md",
}: {
  profile?: MockProfile;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={
        size === "sm"
          ? "relative inline-block size-6 overflow-hidden rounded-full bg-muted"
          : "relative inline-block size-10 shrink-0 overflow-hidden rounded-full bg-muted"
      }
    >
      {profile?.avatarUrl ? (
        <Image
          src={profile.avatarUrl}
          alt={profile.displayName}
          fill
          sizes={size === "sm" ? "24px" : "40px"}
          className="object-cover"
        />
      ) : null}
    </span>
  );
}
