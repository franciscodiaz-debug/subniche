# Bitwise Specifications System

## General concept

`specifications` are attributes that can be configured for a niche (e.g. Color, Size, Brand). Each specification has possible values (`specification_values`). When a listing is associated with a category, it selects values from those specifications — and that selection is encoded in a **bitmask** for efficient search.

## Data model

```
Niche
  └── Specification (scoped by niche_id)
        └── SpecificationValue  (bitpos: power of 2)
              └── SpecificationCategoryValue (category_id + specification_value_id)
                    └── [future] ListingSpecificationValue
```

## Rule of bitpos

`bitpos` stores **the mask value directly** (not the shift index).

```
value 1 → bitpos = 1   → binary: 0001
value 2 → bitpos = 2   → binary: 0010
value 3 → bitpos = 4   → binary: 0100
value 4 → bitpos = 8   → binary: 1000
```

Formula in PostgreSQL trigger BEFORE INSERT:
```sql
NEW.bitpos = COALESCE(
  (SELECT MAX(bitpos) * 2 FROM specification_values WHERE specification_id = NEW.specification_id),
  1
);
```

We use `* 2` (not `+ 1`) because the bitpos is the mask, not an index. This avoids a shift (`1 << bitpos`) in each search operation — the value is already precalculated.

Constraint in DB: `UNIQUE(specification_id, bitpos)`

## Construction of the bitmask of a listing

When a listing selects values, it is accumulated by OR:
```
bitmask = 0
for each selected specification_value:
  bitmask = bitmask | specification_value.bitpos
```

The resulting bitmask is saved in the listings table (by spec or global, TBD).

## Search by bitmask

```sql
-- The listing must have ALL the values of the filter
listing_bitmask & filter_bitmask = filter_bitmask

-- The listing must have AT LEAST ONE of the values of the filter
listing_bitmask & filter_bitmask != 0
```

## Tables of the system

| Table | Purpose |
|---|---|
| `specifications` | Definition of the spec, scoped to a niche |
| `specification_values` | Possible values of the spec, with bitpos (BigInt) |
| `specification_category_values` | What values apply to what category |
| `listing_specification_values` | Values selected by a listing. FK nullable to spec_category_value (select/multiselect) or `value` text field (text). Mutually exclusive by CHECK constraint |
| `listing_spec_bitmasks` | Hash accumulated by (listing, specification). Only exists for specs with selected values (no text). UNIQUE(listing_id, specification_id) |
| `listing_category_bitmasks` | Hash accumulated by the category path (selected category + all its ancestors). UNIQUE(listing_id) — one per listing |

## Decisions made

- `attribute_bitpos` removed: logic moved to PostgreSQL trigger (`trg_specification_value_bitpos`)
- `attribute_category` removed: derived by join from `specification_category_values` → `specification_values` → `specifications`
- PKs: UUID in all tables
- `bitpos`: `BigInt`, assigned by trigger (not default in Prisma)
- `hash`: `BigInt` in bitmask tables
- Cascade delete in all FKs
- Specs of type text do not generate an entry in `listing_spec_bitmasks`
- `listing_category_bitmasks.hash` requires that `Category` have `bitpos BigInt` (pending addition)

## Bitpos trigger

```sql
CREATE OR REPLACE FUNCTION fn_specification_value_bitpos()
RETURNS TRIGGER AS $$
BEGIN
    NEW.bitpos := COALESCE(
        (SELECT MAX(bitpos) * 2 FROM specification_values WHERE specification_id = NEW.specification_id),
        1
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Bitpos in Category

Same logic `*2` as `specification_values`. Scoped by `niche_id` (not global).

```sql
CREATE OR REPLACE FUNCTION fn_category_bitpos()
RETURNS TRIGGER AS $$
BEGIN
    NEW.bitpos := COALESCE(
        (SELECT MAX(bitpos) * 2 FROM categories WHERE niche_id = NEW.niche_id),
        1
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Constraint: `UNIQUE(niche_id, bitpos)` — no bit collisions within the same niche.

The hash in `listing_category_bitmasks` is built with OR of the selected category bitpos + all its ancestors:
```
hash = cat.bitpos | parent.bitpos | grandparent.bitpos | ...
```

## ⚠️ BIGINT limit — read before adding categories

BIGINT supports up to **63 unique categories per niche** (bits 2^0 to 2^62).

Today there are ~50 categories per niche → 13 bits of margin. If that number grows to 64+, the system silently breaks (overflow in bitpos).

**If the limit is exceeded, change in these places:**

| File | Change |
|---|---|
| `prisma/schema.prisma` | `Category.bitpos` and `ListingCategoryBitmask.hash`: `BigInt` → `Unsupported("numeric")` |
| `prisma/schema.prisma` | `SpecificationValue.bitpos` and `ListingSpecBitmask.hash`: same if specs also grow |
| `prisma/migrations/new_migration.sql` | `ALTER TABLE categories ALTER COLUMN bitpos TYPE NUMERIC` |
| `prisma/migrations/new_migration.sql` | `ALTER TABLE listing_category_bitmasks ALTER COLUMN hash TYPE NUMERIC` |
| Application layer (service) | The `&` and `\|` operations of BIGINT in Prisma/JS stop working — switch to `BigInt` of JS or big integer library |
| PostgreSQL queries raw | Replace `&` and `\|` with custom functions over `NUMERIC` or migrate to `BIT VARYING(128)` |

## Pending

- Run migration `20260428000000_specifications_system` when the schema is stable
