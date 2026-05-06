# Moderation and Safety

MVP needs basic trust and safety controls because SubNiche includes person-to-person messaging and offers.

## User controls

Users can:

- block another user,
- report a user,
- report a listing,
- report a message/conversation,
- report a public wishlist item,
- report a public or link-only collection.

## Blocking behavior

When User A blocks User B:

- User B cannot send User A new messages,
- User B cannot send User A offers,
- User B should not see active CTAs to contact User A,
- existing message history remains visible unless moderation removes it,
- blocking does not delete historical records,
- blocking does not delete offers/messages/items,
- new interaction is prevented going forward.

If a blocked user attempts a disallowed action, the product should fail safely without leaking unnecessary detail.

## Reporting behavior

Reportable surfaces:

- user profile,
- listing/item page,
- wishlist item,
- collection,
- message/conversation,
- offer thread.

Reports should enter a super-admin moderation queue.

## Super-admin moderation tools

Super-admin can:

- review reported content,
- remove/unpublish listings,
- remove public wishlist items,
- remove public/link-only collections,
- suspend users,
- ban users,
- restrict or remove abusive content,
- deactivate problematic user-defined taxonomy values,
- view moderation queues.

## Listing/content removal

When super-admin removes content, the system should prevent further public access and interaction.

Historical messages/offers should remain coherent, but removed content should not remain publicly available.

Use safe placeholders where necessary.

## Suspended/banned users

Suspended/banned users should not be able to:

- publish listings,
- publish wishlist items,
- create public/link-only collections,
- send messages,
- send offers,
- create new accounts through obvious abuse paths if technically feasible.

Existing public content may be hidden/removed by super-admin according to moderation decision.

## MVP trust signals

MVP trust should rely on simpler signals first:

- profile completeness,
- visible public collections,
- niche-specific profile context,
- community membership later, post-MVP,
- listing quality,
- member since/account age,
- approximate location,
- basic email verification.

Do not build public reputation scores, external verification badges, or transaction-history reputation in MVP unless explicitly directed.
