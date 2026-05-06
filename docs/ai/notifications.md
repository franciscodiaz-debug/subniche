# Notifications

## Notification scope

MVP should include only marketplace-critical notifications.

Avoid low-value engagement notifications like views, likes, profile views, collection likes, or generic activity nudges.

## In-app notifications

In-app notifications should cover critical events such as:

- new message,
- new offer,
- counter-offer received,
- offer accepted,
- offer declined,
- offer expired,
- auto-declined offer because another offer was accepted,
- offer expiration reminder,
- someone messaged about a wishlist item.

Trade-match counts/results may update in-app, but do not spam notifications for every recalculation.

## Email notifications

MVP includes email notifications, but keep them limited.

Offer-related email notifications are mandatory transactional emails.

Mandatory offer email events:

- new offer received,
- counter-offer received,
- offer accepted,
- offer declined,
- offer expired,
- auto-declined because another offer was accepted,
- offer expiration reminder.

Message emails may be turned off by the user.

Message email events may include:

- new message,
- wishlist message,
- collection/item inquiry message.

Marketing/engagement emails are separate and should be optional.

## Match notifications

Trade-match notifications should be controlled, not noisy.

MVP behavior:

- update in-app match counts/results immediately,
- avoid notification for every recalculation,
- avoid email/push spam from taxonomy edits, item edits, new listings, or changed trade interests,
- digest-style match updates can come later.

## Offer expiration reminders

Send one expiration reminder before an active offer/counter-offer expires.

Rules:

- send one reminder only,
- send to the recipient of the currently active offer/counter-offer,
- send both in-app and email,
- do not send repeated reminders.
