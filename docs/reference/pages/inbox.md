# Page: Inbox and Offer Thread

## URL

`https://v0-rebuild-tbcoy6gim-darwoft-subniche.vercel.app/inbox`

## Purpose

Inbox combines direct messages and offer conversations. The user explicitly noted the offer flow is incomplete, so this document records observed UI states without treating the offer mechanics as final.

## Observed Layout

Three-column desktop layout:

- Left conversation list with search, `All` filter, unread badges, user/item thumbnails, conversation type, and last-message preview.
- Center conversation panel.
- Right profile/trust panel with location, item/collection stats, verification, linked accounts, feedback, transactions, and response stats.

Default state shows an empty center with `Select a conversation`.

Offer thread state:

- URL changes to `/inbox?id=conv-1`.
- Top offer summary compares `They offer` vs `For your`.
- Offer includes item card, cash supplement, the user's item, and remaining time.
- Actions: `Accept`, `Counter`, `Decline`.
- Message history interleaves offer events with chat messages.
- Composer sits at the bottom with send icon.

## Observed Interactions

- Clicking a conversation updates URL with `?id=conv-1`, selects the thread, and fills center/right panels.
- `Counter` opens a centered modal with a dimmed backdrop.
- Counter modal shows `Their offer`, `Your items`, a message field, `Cancel`, and `Send Counter`.
- The modal is visually compact and card-based; it does not show an obvious complete counter-building workflow.
- Direct-message and completed-purchase conversations are present in the list but were not opened in this pass.

## States Observed

- Empty/no conversation selected.
- Offer thread selected.
- Counter-offer modal open.

## Product Rules Implied

- Inbox conversation IDs are URL-addressable.
- Offer conversations need a structured offer summary, not just chat text.
- User profile/trust context remains visible beside a conversation.
- The offer layer supports at least accept, counter, and decline intents.

## Acceptance Criteria Candidates

- Inbox default shows conversation list and empty selection state.
- Selecting an offer conversation updates URL and renders offer summary plus message history.
- Counter opens a modal without submitting.
- User profile panel renders verification, linked account, feedback, transaction, and response-rate data.

## Open Questions

- Offer flow is incomplete by user note. Do not implement final accept/counter/decline semantics from this prototype alone.
- Does accepting/declining require confirmation?
- Can messages be sent independently from offer actions?
- Does a counter offer alter item/cash terms, add/remove items, or only include a note in MVP?
