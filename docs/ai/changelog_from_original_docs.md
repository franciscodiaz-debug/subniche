# Changelog from Original Uploaded Docs

This package expands and corrects the original uploaded AI docs.

## Major corrections

- `MVPscope.md` is now filled out and authoritative.
- Communities are removed from MVP.
- Forums, comments, discussions, and reactions are removed from MVP.
- Product terminology is clarified:
  - Item is the umbrella term.
  - Listing means an owned item made available for sale/trade.
  - Wishlist item means an item the user does not own but is looking for.
  - Trade interest is structured criteria attached to a for-trade listing.
- Deprecated trade terms are replaced:
  - True Match → 2-way match.
  - One-way Match → 1-way match.
  - Full Match → criteria-complete / meets all selected criteria.
- Collection visibility is simplified:
  - one visibility state per collection,
  - no mixed-visibility collections in MVP,
  - items can belong to only one collection at a time.
- Trade matching is formalized:
  - only active for-trade listings are eligible,
  - criteria-complete requires 100% of selected criteria,
  - missing selected data creates Possible Match,
  - known failed criteria are not matches,
  - Near Misses are post-MVP.
- Offer behavior is formalized:
  - offers live in message threads,
  - initial trade offers require a valid match basis,
  - counter-offers can diverge freely,
  - sent offers cannot be edited/withdrawn,
  - accepting an offer auto-declines conflicting active offers.
- Pending is manual owner-controlled availability, not automatic transaction state.
- Delete/archive behavior is clarified.
- Niche-specific profiles are included in MVP.
- Super-admin in-app taxonomy/config control panel is included in MVP.
- Deferred signup/draft-before-account behavior is specified.
- Basic moderation/block/report/admin safety tools are included.

## Original intent retained

The original product intent remains:

- niche-first identity,
- native trading,
- collections as single-player/context value,
- structured taxonomy for discovery,
- marketplace that feels like a focused enthusiast space rather than generic classifieds.

## v4 clarification

- Clarified that publishing an active `for trade` listing requires user-entered value context.
- `for trade only` listings require a stated trade value.
- `for sale + for trade` listings use asking price as trade value for MVP.
- Added explicit warnings not to treat trade value as optional merely because an item is not for sale.
