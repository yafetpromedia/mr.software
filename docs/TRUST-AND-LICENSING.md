# Trust & Licensing

Mr.Software protects developers and buyers with a **3-level trust model**:

| Level | Feature | Purpose |
| ----- | ------- | ------- |
| 1 | Ownership record | Proof of creator |
| 2 | License keys | Proof of purchase |
| 3 | Verification API | Proof of valid usage |

---

## 1. Product ownership

**Rule:** The developer owns everything they create and upload.

Mr.Software provides hosting, distribution, payments, licensing, and discovery — not IP ownership.

Suggested Terms of Service language:

```text
The intellectual property rights of software uploaded
to Mr.Software remain with the developer or organization
that created the software.

Mr.Software receives only a limited license to host,
display, distribute, and process transactions.
```

---

## 2. License tiers

Every published product has a license tier:

| Tier | Summary |
| ---- | ------- |
| **Personal** | 1 user · no redistribution |
| **Commercial** | Business use · unlimited employees |
| **Enterprise** | Large orgs · custom support |
| **Open source** | MIT, Apache 2.0, GPL, or BSD template |

Set at publish time in **Listings → Publish to marketplace**.

---

## 3. License keys

After a successful purchase (Stripe, Chapa, or dev grant in local testing):

1. A unique key is generated: `MRS-XXXX-XXXX-XXXX`
2. Stored in `SoftwareLicenseKey` linked to the purchase
3. Shown on **My software → [product]** with copy + certificate link

Status values: `ACTIVE`, `EXPIRED`, `REVOKED`.

---

## 4. Verification API

Developers can verify licenses from their own apps:

```http
POST /api/licenses/verify
Content-Type: application/json

{
  "licenseKey": "MRS-CP1A-7K9L-X2MN"
}
```

**Valid response:**

```json
{
  "valid": true,
  "product": "CampusOne",
  "tier": "Personal license",
  "owner": "ABC School",
  "expires": "2027-01-01",
  "status": "ACTIVE"
}
```

**Invalid response:**

```json
{
  "valid": false,
  "reason": "License key not found"
}
```

Authenticated buyers can list their keys: `GET /api/licenses/mine`.

**Domain-based licensing (web / self-hosted):** pass optional `domain` when the license is locked to a hostname:

```json
{
  "licenseKey": "MRS-CP1A-7K9L-X2MN",
  "domain": "school.edu.et"
}
```

If the key has `licensedDomain` set and the domain does not match → `valid: false`, `reason: "Domain mismatch"`.

---

## 5. Distribution type (developer choice)

Not every product is a downloadable file. At publish time, developers choose **how buyers receive the product**:

| Type | Buyer gets | Piracy protection |
| ---- | ---------- | ----------------- |
| **SOURCE_CODE** | Source download | None — ownership stays with developer |
| **COMPILED** | Executable/package + license key | Key verified at startup via `/api/licenses/verify` |
| **HOSTED** | Cloud URL only (e.g. `school1.mr.software`) | Highest — no source, database, or backend |

### Recommended mapping

| Product | Distribution |
| ------- | ------------ |
| React template | Source download |
| CampusOne (school system) | **Hosted only** |
| Desktop accounting app | Compiled download |
| CRM SaaS | Hosted only |

### Hosted products (CampusOne model)

Do **not** sell source code. Sell a cloud license:

```text
CampusOne Cloud — $20/month or $200/year
school1.mr.software
school2.mr.software
```

Benefits: better security, recurring revenue, easier updates, less piracy, easier support.

File downloads are **blocked** for `HOSTED` products at the API level.

---

## 6. License certificate

Each key has a printable certificate page:

`/trust/certificate/[licenseKey]`

Use **Print / Save PDF** for schools and businesses that need proof of legal ownership.

---

## 7. Product fingerprint

On publish, Mr.Software computes a **SHA-256 fingerprint** from:

- Developer ID
- Product name & description
- Asset URL
- Publish timestamp

Shown on the product detail page and ownership record. Proves who uploaded and when — not whether a binary was modified after download.

---

## 8. Ownership record (African startup protection)

When software is published, an ownership record is created:

```text
MS-OWN-2026-00001
```

Public page: `/trust/ownership/[recordNumber]`

This is **not** a patent or government registration — it is a **timestamped platform record** useful for startups proving creation date and authorship.

---

## Implementation map

| Area | Path |
| ---- | ---- |
| Schema | `prisma/schema.prisma` — `DistributionType`, `OwnershipRecord`, `SoftwareLicenseKey`, `ProductLicenseTier` |
| Distribution | `lib/trust/distribution-types.ts`, `lib/monetization/distribution-access.ts` |
| Publish trust | `lib/trust/publish-trust.ts` |
| License keys | `lib/trust/license-key.ts` |
| Fulfillment hook | `lib/monetization/fulfill.ts`, `lib/payments/chapa.ts`, `app/api/checkout/dev-grant/route.ts` |
| Verify API | `app/api/licenses/verify/route.ts` |
| UI | `components/trust/*`, `components/software/software-trust-panel.tsx` |

---

## Vision

> Publish, license, protect, and monetize software from Africa to the world.

This trust stack is the foundation for developers to treat Mr.Software as a **business platform**, not just a marketplace.
