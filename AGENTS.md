# Agent Instructions

This repository contains SubNiche, a niche-first marketplace platform.

## Operating principles

1. Consistency over novelty.
2. Reuse over reinvention.
3. Product intent over generic marketplace conventions.
4. Small reviewable changes over giant rewrites.
5. Docs must stay aligned with implementation.

## Required behavior

- Read `/docs` before implementing.
- Use existing components before creating new ones.
- Do not introduce new visual conventions casually.
- Do not mix prototype/reference code into production code without cleanup.
- Do not create hidden business logic that is not documented.
- Keep changes scoped to the current branch objective.

## Branching

Expected branch pattern:

- `main` = protected production-safe branch
- `develop` = integration/staging branch
- `feature/*` = focused work branches

Never assume direct work on `main`.
