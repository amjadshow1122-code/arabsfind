**MoaviaFragranse*.com.au***

**PLATFORM DEVELOPER SPECIFICATION**

Version 1.0  —  May 2026  —  CONFIDENTIAL

*Australia's designer boutique sales — all in one place*

**KEY ASSUMPTIONS**

* Admin team manages all data — no merchant self-service at launch

* Affiliate click tracking from day 1 (commission reconciliation is day 2\)

* Data masking: key details (price, full link) hidden behind login wall

* Scraping \+ manual bulk ops only — no merchant data feeds

* Stripe hosted checkout — site never handles raw card data

* Daily automation script flags stale content for admin review; does not auto-delete

* Newsletter via third-party ESP (e.g. Klaviyo / Mailchimp) — API integration

* Guest browsing allowed; login required to see full sale/product details

# **A. Page Inventory**

All pages required to complete the platform. Status: ✅ Done \= exists in prototype HTML | 🔲 Needed \= must be built.

| Page / Route | Status | Access | Notes |
| :---- | :---- | :---- | :---- |
| **— PUBLIC PAGES —** |  |  |  |
| **Homepage / Landing** | ✅ Done | Public | Hero, featured sales, newsletter signup, socials |
| **Sales Listing / Browse** | ✅ Done | Public (limited) | Grid of active sales; teaser only until login |
| **Sale Detail Page** | ✅ Done | Auth required | Full sale info, merchant link, affiliate click tracking |
| **Product Listing / Browse** | ✅ Done | Public (limited) | Grid of products; price masked until login |
| **Product Detail Page** | ✅ Done | Auth required | Full product info, buy button (own checkout) or external link |
| **Merchant Directory** | ✅ Done | Public | Merchant cards with logo, location, category |
| **Merchant Profile Page** | ✅ Done | Public | Merchant detail, their active sales & products |
| **Search Results** | 🔲 Needed | Public | Unified search across sales, products, merchants |
| **Category / Filter Browse** | 🔲 Needed | Public | Filtered views — category, discount %, location, etc. |
|  |  |  |  |
| **— USER AUTH PAGES —** |  |  |  |
| **Register / Sign Up** | 🔲 Needed | Public | Email \+ password, social login (Google), email verify |
| **Login** | 🔲 Needed | Public | Email/password \+ social OAuth |
| **Forgot Password** | 🔲 Needed | Public | Email reset flow |
| **Reset Password** | 🔲 Needed | Public | Token-based reset form |
| **Email Verification** | 🔲 Needed | Public | Verify link landing page |
|  |  |  |  |
| **— USER ACCOUNT PAGES —** |  |  |  |
| **My Account / Dashboard** | 🔲 Needed | Auth | Overview: orders, saved items, preferences |
| **My Orders** | 🔲 Needed | Auth | Order history, status, tracking links |
| **Order Detail** | 🔲 Needed | Auth | Single order detail, Stripe receipt link |
| **Account Settings** | 🔲 Needed | Auth | Name, email, password, notification prefs |
| **Newsletter Preferences** | 🔲 Needed | Auth | Manage subscription topics / frequency |
|  |  |  |  |
| **— CHECKOUT (OWN PRODUCTS) —** |  |  |  |
| **Cart** | 🔲 Needed | Public/Auth | Line items, qty, subtotal — persisted for logged-in users |
| **Checkout (Stripe hosted)** | 🔲 Needed | Public/Auth | Redirect to Stripe Checkout — no card data on site |
| **Order Confirmation** | 🔲 Needed | Public/Auth | Success page post-Stripe redirect, order summary |
| **Order Failed / Cancelled** | 🔲 Needed | Public/Auth | Stripe cancelled/failure redirect page |
|  |  |  |  |
| **— STATIC / LEGAL PAGES —** |  |  |  |
| **About Us** | 🔲 Needed | Public | Brand story, how the platform works |
| **How It Works** | 🔲 Needed | Public | Explainer for users — browsing, login, buying |
| **Privacy Policy** | 🔲 Needed | Public | GDPR/Privacy Act compliance |
| **Terms of Use** | 🔲 Needed | Public | User terms, affiliate disclosure |
| **Cookie Policy** | 🔲 Needed | Public | Cookie consent banner \+ detail page |
| **Contact Us** | 🔲 Needed | Public | Form \+ socials |
| **404 / Error Page** | 🔲 Needed | Public | Branded not-found and error states |
| **Unsubscribe** | 🔲 Needed | Public | One-click unsubscribe from newsletter (email link) |
|  |  |  |  |
| **— ADMIN PANEL PAGES —** |  |  |  |
| **Admin: Dashboard** | 🔲 Needed | Admin | KPIs: active sales, products, users, recent clicks, flags |
| **Admin: Sales — List** | 🔲 Needed | Admin | Full table with filters, sort, bulk actions |
| **Admin: Sales — Create / Edit** | 🔲 Needed | Admin | Form for single sale entry |
| **Admin: Sales — Bulk Import** | 🔲 Needed | Admin | CSV upload \+ field mapping UI |
| **Admin: Sales — Bulk Edit** | 🔲 Needed | Admin | Spreadsheet-style inline editing of multiple rows |
| **Admin: Products — List** | 🔲 Needed | Admin | Full table with filters, sort, bulk actions |
| **Admin: Products — Create / Edit** | 🔲 Needed | Admin | Form for single product entry |
| **Admin: Products — Bulk Import** | 🔲 Needed | Admin | CSV upload \+ field mapping UI |
| **Admin: Products — Bulk Edit** | 🔲 Needed | Admin | Spreadsheet-style inline editing of multiple rows |
| **Admin: Merchants — List** | 🔲 Needed | Admin | Directory management table |
| **Admin: Merchants — Create / Edit** | 🔲 Needed | Admin | Merchant detail form |
| **Admin: Categories & Tags** | 🔲 Needed | Admin | Manage taxonomy used across site |
| **Admin: Users — List** | 🔲 Needed | Admin | User management, roles, account status |
| **Admin: Users — Detail** | 🔲 Needed | Admin | Single user profile, orders, activity |
| **Admin: Orders — List** | 🔲 Needed | Admin | All orders, Stripe status, fulfillment |
| **Admin: Orders — Detail** | 🔲 Needed | Admin | Single order management, manual status updates |
| **Admin: Automation Flags** | 🔲 Needed | Admin | Daily script output — stale/expired items queue |
| **Admin: Affiliate Clicks** | 🔲 Needed | Admin | Click tracking log per sale / merchant |
| **Admin: Newsletter** | 🔲 Needed | Admin | Subscriber list, campaign history |
| **Admin: Site Settings** | 🔲 Needed | Admin | Global config: featured slots, banners, social links |
| **Admin: Login** | 🔲 Needed | Admin | Separate admin auth — 2FA recommended |

**Legend:  ✅ Done   🔲 Needed**   | Access: Public / Auth (logged-in user) / Admin

# **B. User Flows**

Complete end-to-end paths for each user type. All flows assume the data masking model: browsing is public, full details require a free account.

## **B1. Guest User — Browse & Click Out to Merchant**

The primary use case. User discovers a sale, registers to see the full link, and is sent to the merchant's site.

**Flow B1 — Browse to Click-Out**

| 1 | User arrives on Homepage — sees featured sales, newsletter signup, social links. |
| :---: | :---- |
| **2** | User browses Sales Listing — sees sale cards with teaser info (merchant name, category, dates). Price range and full link are blurred/hidden. |
| **3** | User clicks a Sale Card — arrives on Sale Detail Page. Full details are gated behind a login prompt. A non-intrusive banner reads: 'Sign in free to see the full details and shop this sale.' |
| **4** | User clicks 'Sign in / Register' — directed to Register page. Simple form: name, email, password. OR one-click Google OAuth. |
| **5** | Email verification sent — user clicks link in email, account confirmed. |
| **6** | User is redirected back to the Sale Detail Page — now sees full price range, description, and the 'Shop This Sale →' CTA button. |
| **7** | User clicks 'Shop This Sale →' — click event logged in DB (affiliate tracking: user\_id, sale\_id, merchant\_id, timestamp, referrer). User is redirected to merchant's site via tracked link. |
| **8** | Admin sees click in Affiliate Clicks dashboard. (Commission reconciliation is day 2.) |

## **B2. Returning User — Login & Browse**

Frictionless return visit for users who already have an account.

**Flow B2 — Returning User**

| 1 | User arrives on any page — sees 'Login' in nav. |
| :---: | :---- |
| **2** | User logs in with email/password or Google OAuth. |
| **3** | All previously gated content is immediately visible — no extra steps. |
| **4** | User can browse Sales, Products, and Merchant Directory with full detail access. |
| **5** | User can save newsletter preferences in Account Settings. |

## **B3. User — Purchase on MoaviaFragranse (Own Products)**

For products sold directly on the platform. Stripe handles all payment processing.

**Flow B3 — Direct Purchase**

| 1 | User lands on Product Detail Page — sees product images, description, price, and 'Add to Cart' button. (Login required to add to cart.) |
| :---: | :---- |
| **2** | User adds item to Cart — cart persists in session; for logged-in users, cart is saved to DB (survives browser close). |
| **3** | User views Cart — sees line items, quantities, subtotal. Can update quantities or remove items. |
| **4** | User clicks 'Checkout' — a Stripe Checkout session is created server-side with line items. User is redirected to Stripe hosted checkout page. |
| **5** | User completes payment on Stripe — enters card details on Stripe's domain (PCI compliant — no card data touches our server). |
| **6** | Stripe redirects user to Order Confirmation page — displays order summary, order number, and estimated dispatch. Stripe receipt link included. |
| **7** | System sends Order Confirmation email — triggered by Stripe webhook (checkout.session.completed). Email includes order details, support contact. |
| **8** | Order appears in Admin: Orders dashboard — team manually fulfils / updates tracking if needed. |
| **9** | User can view order in My Account → My Orders. |

## **B4. Newsletter Subscription**

**Flow B4 — Newsletter**

| 1 | User sees newsletter signup bar on Homepage (and optionally footer). |
| :---: | :---- |
| **2** | User enters email — optional: select preferences (e.g. 'Notify me of new sales', 'Weekly digest'). |
| **3** | Double opt-in email sent — user confirms subscription. |
| **4** | User added to ESP (Klaviyo/Mailchimp) subscriber list with relevant tags. |
| **5** | Logged-in users can manage preferences in Account Settings → Newsletter Preferences. |
| **6** | Unsubscribe link in every email — one-click, lands on Unsubscribe confirmation page. |

## **B5. Admin — Add / Update Content**

**Flow B5 — Admin Data Entry**

| 1 | Admin logs in to /admin — separate login page, 2FA recommended. |
| :---: | :---- |
| **2** | Single entry: Admin navigates to Sales → Create. Fills form (merchant, dates, categories, images, link, price range). Saves → live immediately or set to 'Draft'. |
| **3** | Bulk import: Admin navigates to Sales → Bulk Import. Downloads CSV template. Populates offline. Uploads CSV. System shows field-mapping UI and row preview. Admin confirms → rows inserted. Errors shown inline (e.g. missing required field, duplicate). |
| **4** | Bulk edit: Admin navigates to Sales → Bulk Edit. Spreadsheet-style table renders all rows. Admin edits cells inline. Saves all changes in one action. Optimistic UI with error rollback. |
| **5** | Same flows apply for Products and Merchants. |
| **6** | Admin navigates to Automation Flags — reviews list of items flagged by daily script (expired dates, suspected out-of-stock). For each flag: 'Unpublish', 'Mark Reviewed', or 'Dismiss'. |

## **B6. Daily Automation Script**

**Flow B6 — Nightly Validation**

| 1 | Cron job runs once daily (e.g. 2am AEST). |
| :---: | :---- |
| **2** | For each active Sale: check if sale\_end\_date \< today. If yes → flag as 'Expired Date'. |
| **3** | For each active Sale with an external URL: attempt HEAD request or lightweight scrape of merchant page. If page returns 404, or known 'out of stock' / 'sale ended' signal detected → flag as 'Suspected Stale'. |
| **4** | For each active Product (sold on site): check Stripe / inventory field for stock. If stock \= 0 → flag as 'Out of Stock'. |
| **5** | All flags written to automation\_flags table with timestamp, flag type, item\_id, and raw signal. |
| **6** | Admin receives email summary: 'X items need review' with link to Automation Flags dashboard. |
| **7** | Admin reviews flags and takes action — content is never automatically unpublished. |

# **C. Data Management**

Data models for the core entities. All tables should support created\_at, updated\_at, and created\_by (admin user ID) audit fields.

## **C1. Core Data Models**

**merchants**

| Field | Type | Required | Notes |
| :---- | :---- | :---- | :---- |
| id | UUID / INT | Yes | Primary key |
| name | VARCHAR 255 | Yes | Display name |
| slug | VARCHAR 255 | Yes | URL-safe identifier, unique |
| logo\_url | TEXT | No | CDN path to logo image |
| website\_url | TEXT | Yes | Merchant's main website |
| description | TEXT | No | Short bio shown on directory |
| category\_ids | INT\[\] | No | Foreign keys to categories table |
| location\_city | VARCHAR 100 | No | For location filtering |
| location\_state | VARCHAR 50 | No | e.g. NSW, VIC |
| social\_instagram | TEXT | No | Instagram URL |
| status | ENUM | Yes | active | draft | archived |
| affiliate\_url\_template | TEXT | No | URL pattern for tracked outbound links |

**sales**

| Field | Type | Required | Notes |
| :---- | :---- | :---- | :---- |
| id | UUID / INT | Yes | Primary key |
| merchant\_id | INT | Yes | FK to merchants |
| title | VARCHAR 255 | Yes | Sale name / headline |
| slug | VARCHAR 255 | Yes | URL slug, unique |
| description | TEXT | No | Full sale description (shown after login) |
| teaser\_text | VARCHAR 255 | No | Short teaser shown to guests |
| sale\_url | TEXT | Yes | Link to merchant's sale page (tracked on click-out) |
| discount\_min\_pct | INT | No | e.g. 20 (for '20% off') |
| discount\_max\_pct | INT | No | e.g. 70 |
| price\_range\_min | DECIMAL | No | Lowest item price — masked for guests |
| price\_range\_max | DECIMAL | No | Highest item price — masked for guests |
| sale\_start\_date | DATE | Yes | When sale begins |
| sale\_end\_date | DATE | No | When sale ends — NULL \= ongoing |
| category\_ids | INT\[\] | No | FK to categories |
| image\_urls | TEXT\[\] | No | CDN paths for sale images |
| is\_featured | BOOLEAN | Yes | Show in homepage featured slots |
| status | ENUM | Yes | active | draft | archived | expired |
| last\_verified\_at | TIMESTAMP | No | Set by automation script on last check |

**products (own inventory)**

| Field | Type | Required | Notes |
| :---- | :---- | :---- | :---- |
| id | UUID / INT | Yes | Primary key |
| merchant\_id | INT | No | FK to merchants — NULL if MoaviaFragranse owns it |
| sale\_id | INT | No | FK to sales — optional association |
| title | VARCHAR 255 | Yes | Product name |
| slug | VARCHAR 255 | Yes | URL slug |
| description | TEXT | No | Full product description |
| teaser\_text | VARCHAR 255 | No | Guest-visible teaser |
| price | DECIMAL | Yes | Listed price in AUD |
| compare\_at\_price | DECIMAL | No | Original RRP — shows strikethrough |
| sku | VARCHAR 100 | No | Stock keeping unit |
| stock\_qty | INT | Yes | Current inventory. 0 \= out of stock |
| stripe\_price\_id | TEXT | No | Stripe Price object ID for checkout |
| category\_ids | INT\[\] | No | FK to categories |
| image\_urls | TEXT\[\] | No | CDN paths |
| is\_external | BOOLEAN | Yes | FALSE \= buy on site; TRUE \= click-out like a sale |
| external\_url | TEXT | No | If is\_external \= TRUE |
| status | ENUM | Yes | active | draft | archived |
| last\_verified\_at | TIMESTAMP | No | Set by automation script |

**categories**

| Field | Type | Required | Notes |
| :---- | :---- | :---- | :---- |
| id | INT | Yes | Primary key |
| name | VARCHAR 100 | Yes | e.g. Womenswear, Jewellery |
| slug | VARCHAR 100 | Yes | URL-safe |
| parent\_id | INT | No | NULL \= top-level; self-referential for subcategories |
| icon\_url | TEXT | No | Optional icon for browse filters |

**users**

| Field | Type | Required | Notes |
| :---- | :---- | :---- | :---- |
| id | UUID | Yes | Primary key |
| email | VARCHAR 255 | Yes | Unique, lowercase |
| password\_hash | TEXT | No | NULL if OAuth only |
| name | VARCHAR 255 | No | Display name |
| email\_verified\_at | TIMESTAMP | No | NULL \= not yet verified |
| newsletter\_subscribed | BOOLEAN | Yes | Default TRUE on signup |
| newsletter\_preferences | JSONB | No | Preference flags per topic |
| role | ENUM | Yes | user | admin |
| status | ENUM | Yes | active | suspended |
| last\_login\_at | TIMESTAMP | No | Track engagement |
| oauth\_provider | VARCHAR 50 | No | google | null |
| oauth\_provider\_id | TEXT | No | Provider's user ID |

**orders**

| Field | Type | Required | Notes |
| :---- | :---- | :---- | :---- |
| id | UUID | Yes | Internal order ID |
| user\_id | UUID | No | FK to users — NULL \= guest checkout |
| stripe\_session\_id | TEXT | Yes | Stripe Checkout Session ID |
| stripe\_payment\_intent\_id | TEXT | No | For refund/dispute reference |
| status | ENUM | Yes | pending | paid | fulfilled | refunded | failed |
| total\_amount | DECIMAL | Yes | AUD total |
| line\_items | JSONB | Yes | Snapshot of products, qty, price at time of order |
| customer\_email | TEXT | Yes | Captured from Stripe (supports guest) |
| customer\_name | TEXT | No | From Stripe |
| shipping\_address | JSONB | No | If physical goods |
| notes | TEXT | No | Admin notes |

**affiliate\_clicks**

| Field | Type | Required | Notes |
| :---- | :---- | :---- | :---- |
| id | BIGINT | Yes | Primary key, auto-increment |
| user\_id | UUID | No | NULL \= unregistered guest (shouldn't happen if gated) |
| sale\_id | INT | No | FK to sales |
| product\_id | INT | No | FK to products (if click-out product) |
| merchant\_id | INT | Yes | FK to merchants |
| clicked\_at | TIMESTAMP | Yes | UTC |
| referrer\_url | TEXT | No | Where user came from |
| session\_id | TEXT | No | Anonymous session for dedup |

**automation\_flags**

| Field | Type | Required | Notes |
| :---- | :---- | :---- | :---- |
| id | INT | Yes | Primary key |
| entity\_type | ENUM | Yes | sale | product |
| entity\_id | INT | Yes | FK to relevant table |
| flag\_type | ENUM | Yes | expired\_date | suspected\_stale | out\_of\_stock |
| raw\_signal | TEXT | No | HTTP status, scraped text snippet, etc. |
| flagged\_at | TIMESTAMP | Yes | When script ran |
| reviewed\_by | UUID | No | Admin user who actioned it |
| reviewed\_at | TIMESTAMP | No | NULL \= pending review |
| action\_taken | ENUM | No | unpublished | marked\_ok | dismissed |

## **C2. Bulk Data Operations**

### **CSV Import — Sales & Products**

Admin-facing CSV import should support:

* Downloadable CSV template with all field headers and example row

* Upload → parse → field mapping UI (auto-map on exact header match)

* Row-by-row validation before insert — show error count and specific rows

* 'Import anyway (skip errors)' vs 'Fix all errors first' options

* Duplicate detection by slug or external URL — offer skip/overwrite per row

* Import history log — timestamp, admin user, rows inserted/skipped/errored

### **Bulk Edit — Spreadsheet-style UI**

For editing multiple existing records without opening individual forms:

* Editable data grid — inline editing on click, keyboard navigation

* Column filters and sort within the grid

* Multi-select rows for bulk status change (e.g. 'Archive selected 12 sales')

* 'Save all changes' button — batch update with single API call

* Unsaved changes indicator — warn before navigating away

* Undo last save (within session) — useful for accidental bulk changes

### **Scraping Workflow (Content Acquisition)**

Since there are no merchant data feeds, the admin team will source data via:

* Manual entry via single-record forms (for small batches)

* Bulk CSV import after manual scraping and population of template

* Future: a scraping service (e.g. Apify, custom Playwright script) that outputs to the CSV template format — plugs straight into import flow without code changes

**→** *Recommend building the CSV import first as the MVP data entry path. Scraping automation can feed the same pipeline later without changing the import system.*

## **C3. Media & Images**

* All images stored on CDN (e.g. Cloudflare R2, AWS S3 \+ CloudFront)

* Image upload in admin forms — drag-and-drop, multiple files, auto-resize to standard sizes

* Store array of CDN URLs per record (image\_urls field) — first image \= primary/thumbnail

* Bulk import: image\_urls column accepts comma-separated external URLs — system downloads and re-hosts on first access (lazy migration)

# **D. Automation Script — Daily Validation**

## **D1. Overview**

A server-side script (cron job) runs once daily. It checks all active sales and products for staleness signals and writes flags to the automation\_flags table. It never deletes or unpublishes content automatically — all actions require admin review.

## **D2. Script Logic**

### **D2a — Expired Date Check (Sales)**

* SELECT all sales WHERE status \= 'active' AND sale\_end\_date IS NOT NULL AND sale\_end\_date \< CURRENT\_DATE

* For each → insert flag: entity\_type='sale', flag\_type='expired\_date'

* Skip if a flag of the same type already exists and reviewed\_at IS NULL (don't duplicate pending flags)

### **D2b — URL Health Check (Sales & Products)**

* For each active sale/product with an external URL: send HTTP HEAD request with 5s timeout

* Flag if: response is 4xx/5xx, redirect chain leads to homepage (link broken), or domain fails to resolve

* For known merchant sites — optionally parse response body for signals: 'out of stock', 'sale has ended', 'page not found' (configurable per merchant)

* Implement rate limiting and randomised delays — respect robots.txt

* Flag type: 'suspected\_stale' with raw\_signal \= HTTP status or matched text snippet

### **D2c — Stock Check (Own Products)**

* SELECT products WHERE is\_external \= FALSE AND stock\_qty \= 0 AND status \= 'active'

* Flag type: 'out\_of\_stock'

* If Stripe is the stock source of truth — query Stripe inventory via API instead

## **D3. Output & Notifications**

* All flags written to automation\_flags table

* Script sends summary email to admin team: total flags raised, breakdown by type, link to Automation Flags admin page

* Admin Flags page: shows all unreviewed flags sorted by severity. Each row: entity name, flag type, signal, date flagged. Actions: 'Unpublish', 'Mark OK', 'Dismiss'

* 'Mark OK' sets reviewed\_at and records the admin — suppresses re-flagging for 7 days unless signal changes

## **D4. Tech Notes**

* Run as a Node.js or Python script — deployable as a cron job on the same server or as a scheduled serverless function (e.g. Vercel Cron, AWS EventBridge)

* Idempotent — safe to re-run without duplicating flags

* Logs full run output to a file with timestamp — retained for 30 days

* Script should complete within 10 minutes for up to 2,000 active records

# **E. Technical Architecture Notes**

## **E1. Authentication**

* JWT or session-based auth (recommend NextAuth.js / Auth.js if using Next.js)

* Google OAuth for social login

* Email verification on signup — token valid 24 hours

* Admin login: separate /admin/login route, consider IP allowlist \+ 2FA (TOTP)

* Data masking: implemented server-side — gated fields not sent in API response for unauth users

## **E2. Payments — Stripe**

* Stripe Checkout (hosted) — simplest PCI path, no card data on your servers

* Server creates Checkout Session with line\_items from cart

* Stripe webhook: listen for checkout.session.completed → create order record, send confirmation email

* Also handle: payment\_intent.payment\_failed, checkout.session.expired

* Stripe Customer created on first purchase — link to user record for future orders

## **E3. Email**

* Transactional emails (order confirm, password reset, verify email): recommend Resend or Postmark — reliable deliverability, simple API

* Newsletter / marketing emails: Klaviyo or Mailchimp — both have good AU deliverability and list management

* All outbound emails must include unsubscribe link and AU postal address (Spam Act 2003\)

## **E4. Affiliate Click Tracking**

* On click-out: user hits an internal redirect endpoint (e.g. /go/sale/\[id\]) — logs to affiliate\_clicks, then 302 redirects to merchant URL

* Never use direct external links — always go through the internal redirect so clicks are captured

* Store user\_id, sale\_id, merchant\_id, timestamp, session\_id, referrer

* Dashboard: clicks per sale, per merchant, per day — exportable to CSV

## **E5. SEO Considerations**

* Server-side rendering for Sale, Product, and Merchant pages — critical for Google indexing

* Structured data (JSON-LD): Product schema for products, Event schema for timed sales

* Sitemap.xml — auto-generated from active sales/products/merchants

* Canonical URLs — especially important for filtered/paginated browse pages

* Meta title \+ OG tags per page — pulled from record data

* Masked fields: ensure guest-visible teaser text is indexable — the full description behind login is fine to be noindexed

*End of Specification — MoaviaFragranse.com.au v1.0*