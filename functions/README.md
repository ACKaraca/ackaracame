# Firebase backend operations

Cloud Functions, admin scripts and deploy procedures for the site. Unless stated
otherwise, run commands from the repository root. Scripts in this package are
called with `--prefix functions`.

## Access model

Only one person, the site owner, can use the admin callables and write from the
Studio. A request is accepted only if all of these hold:

- the Firebase user's email is verified;
- the ID token has the custom claim `admin: true`;
- the sign-in completed a TOTP second factor;
- the email exactly matches `ACKARACA_ADMIN_EMAIL`;
- the token UID and email match the `systemPolicies/owner-access` document, which
  only the Admin SDK can write.

No web endpoint can grant or change this access. A copied or stale `admin` claim
on another account is rejected.

## Prerequisites

- **Runtime:** Node.js 22.
- **App Check:** enabled for the web app and for Functions. Use a debug token only
  locally and never ship it in the production bundle.
- **Limited-use App Check tokens:** callables that must resist replay use
  `{ limitedUseAppCheckTokens: true }`. Grant **Firebase App Check Token
  Verifier** to the runtime service account
  `ackaracame-functions@<project>.iam.gserviceaccount.com`. Every function runs as
  this account. It holds only: datastore.user, bucket objectAdmin, secretAccessor
  on the three secrets, eventarc.eventReceiver, run.invoker, and logging and
  monitoring writer. See Firebase's
  [Cloud Functions App Check guide](https://firebase.google.com/docs/app-check/cloud-functions)
  before changing it.
- **Identity Platform:** upgrade Firebase Authentication. The one-account gate and
  TOTP both need it.
- **Parameters:** set `ACKARACA_STORAGE_BUCKET` to the exact bucket name and
  `ACKARACA_ADMIN_EMAIL` to the owner's normalized email. If the email is empty or
  malformed, every sign-up and sign-in is rejected.
- **Secret:** create `RATE_LIMIT_SALT` with at least 32 random characters, and give
  the Functions runtime access to it:
  `firebase functions:secrets:set RATE_LIMIT_SALT`.
- **Storage Rules to Firestore:** Storage Rules read the default Firestore
  database (owner policy, active publication manifests). Enable the
  [cross-service permission](https://firebase.google.com/docs/rules/manage-deploy#manage_permissions_for_cross-service_cloud_storage_security_rules)
  and check that
  `service-<PROJECT_NUMBER>@gcp-sa-firebasestorage.iam.gserviceaccount.com` has the
  **Firebase Rules Firestore Service Agent** role. Without it, Storage requests are
  denied. These reads count toward Firestore quota, and only the default database
  is supported.
- **Deploy identity:** the Application Default Credentials used for manual deploys
  and the GitHub Workload Identity service account both run the owner preflight.
  Give them `roles/firebaseauth.viewer` (it includes `firebaseauth.users.get`) and a
  scoped Firestore read of `systemPolicies/owner-access`. Do not use a broad
  Firebase Admin or Owner role. Media and rebuild operations need the separate
  Firestore writes described below. See the
  [Authentication role table](https://firebase.google.com/docs/projects/iam/roles-predefined-product#firebase_authentication_roles).

The production deploy wrapper checks the four non-secret parameters against the web
project and bucket. It writes a temporary `functions/.env.<firebase-project-id>`
(mode `0600`) so the Firebase CLI can resolve them, and deletes only the file it
created. If you already have that file, it must be a private regular file with
exactly the same values; the wrapper never overwrites it.

The wrapper and the legacy retirement script use only the `firebase-tools` version
pinned in the root lockfile, and neither accepts a CLI path override. Run
`npm run audit:policy` after both `npm ci` commands. Runtime dependencies must have
no known advisories. The only exception, for the deploy tool, is recorded with an
expiry in `scripts/dependency-audit-policy.json`. Any change to it fails the check.

## First deploy from the legacy production setup

The old repository deployed `adminLoginGuard` and an insecure HTTP
`seedContent` function in `us-central1`. The new seed function is a callable in
`europe-west1`. Firebase can't change a function's trigger type in place, so the
old ones have to be removed first. The old seed function may also have written
documents with an incompatible schema.

Don't migrate Firestore data until the new triggers and the private backup rules
are deployed. Follow this order.

### 1. Prepare the owner account

Enable Identity Platform and the email/password provider, create the owner account
and verify its email. The deploy wrapper's bootstrap preflight refuses to continue
without it. See [Bootstrap the sole administrator](#bootstrap-the-sole-administrator),
steps 1–2.

### 2. Remove the two legacy functions

```sh
FIREBASE_PROJECT_ID='firebase-project-id' \
CONFIRM_LEGACY_FUNCTION_MIGRATION='retire:adminLoginGuard,seedContent:firebase-project-id' \
npm run legacy:retire --prefix functions
```

The script lists functions for the given project (`functions:list --json`), selects
only `adminLoginGuard` and `seedContent` in `us-central1`, and deletes those. It
fails if the CLI reports a different project, can be run more than once, and never
touches the new `europe-west1` callable. Do not use `firebase deploy --force`: it
can delete production functions you didn't mean to remove. This follows Firebase's
[trigger-type migration procedure](https://firebase.google.com/docs/functions/manage-functions#modify).

### 3. Deploy the bundled fallback as revision 0

Install both dependency trees, check the dependency policy and the bundled public
content, then create the deployment plan:

```sh
npm ci
npm ci --prefix functions
npm run audit:policy
node scripts/verify-public-content.mjs

FIREBASE_PROJECT_ID='firebase-project-id' \
npm run bootstrap:plan
```

Read the printed file count, size and SHA-256. Then deploy exactly that bundle
without exporting from Firestore. Export the production web values from the root
`.env.example` and the Functions parameters from `functions/.env.example` first.
Both confirmation variables are required, and bootstrap mode only works at
revision `0` before the rebuild queue has started:

```sh
FIREBASE_PROJECT_ID='firebase-project-id' \
ACKARACA_STORAGE_BUCKET='firebase-project-id.firebasestorage.app' \
ACKARACA_CONTENT_REVISION='0' \
ACKARACA_BOOTSTRAP_FROM_BUNDLED_CONTENT='true' \
CONFIRM_BUNDLED_BOOTSTRAP='bootstrap-bundled:firebase-project-id:<sha256-from-plan>' \
CONFIRM_PRODUCTION_DEPLOY='deploy:firebase-project-id' \
npm run deploy:production
```

The wrapper temporarily puts the validated fallback into `generated-content.json`,
prepares the media manifest, and deploys static Hosting before anything restrictive.
Only after Hosting succeeds does it deploy Firestore rules and indexes, Storage
Rules and Functions. It finalizes media after both phases and restores your
`generated-content.json` with hash-checked atomic writes. The bundle is rejected if
it references Firebase Storage media.

If something fails midway, the new static site is live with limited backend
features. The old Firestore-dependent site is never left running behind the new
deny-by-default rules.

### 4. Enable TOTP and grant admin access

Once revision `0` is live, complete steps 4–7 of the next section. Then run the
normal owner check:

```sh
FIREBASE_PROJECT_ID='firebase-project-id' \
ACKARACA_ADMIN_EMAIL='owner@example.com' \
ACKARACA_OWNER_PREFLIGHT_MODE='normal' \
npm run owner:verify --prefix functions
```

### 5. Migrate the canonical content

Run the migration as a dry run first:

```sh
FIREBASE_PROJECT_ID='firebase-project-id' \
npm run legacy:migrate-content --prefix functions
```

It reads only the exact documents of the canonical bundle: `siteSettings/main`,
eight `projects/{slug}` and two `journal/{slug}`. It never runs a collection query
and never touches other legacy documents. Each document is classified:

| Class | What the apply step does |
| --- | --- |
| `absent` | creates it |
| `already-valid-v2` | leaves it alone |
| `recognized-legacy` | replaces it after review (`siteSettings/main`, `draw-or-die`, `hocapuanla`) |
| `unexpected` | stops the whole apply |

Replacements come from `functions/data/canonical-content.json`. The file is
validated against the schemas, pinned to a reviewed SHA-256, and the root build
requires it to match the bundled public fallback exactly. If it drifts by a single
byte, seeding and migration refuse to load it. The migration never reads
`generated-content.json`. The old seed fixture is parsed with the shared validator
only to recognize the two colliding projects. It is never used as replacement data.

The dry run writes a private plan to `.legacy-migration/` (mode `0600`, git-ignored).
The writer refuses symlinks, hard links, non-regular files, path escapes and files
owned by another local user. The plan's SHA-256 covers the source data, Firestore
read versions, every path, the replacement payloads and the replacement source.
For each path it holds a readable `sourceData` and `replacementData` pair, with
timestamps shown as type, ISO value, seconds and nanoseconds. Values over the
review size limit are shown as size and hash, and such a value can't be a
recognized legacy overwrite. No document values are printed to the console.

Read every pair, then apply with both confirmation tokens. The second token
confirms you reviewed the data, not just the labels:

```sh
FIREBASE_PROJECT_ID='firebase-project-id' \
CONFIRM_LEGACY_CONTENT_MIGRATION='replace:firebase-project-id:<sha256>:<exact-comma-separated-path-list-from-dry-run>' \
CONFIRM_LEGACY_CONTENT_REVIEWED='reviewed:firebase-project-id:<sha256>' \
npm run legacy:migrate-content --prefix functions -- --apply
```

Apply re-reads all eleven paths in a single Firestore transaction and fails on a
stale hash, a changed read version, an unknown field, a malformed legacy edit, or an
existing backup with the same identity. Before overwriting anything, the same
transaction creates a private backup,
`migrationBackups/canonical-content-bootstrap-v2-<sha256>`, with one source entry
per path (including an explicit "absent" entry before a create). Client rules deny
access to that collection. The transaction then creates missing documents,
overwrites only the reviewed legacy collisions, keeps an old valid `createdAt`,
writes v2 server timestamps, and checks the result with the root Zod schemas.
Credentials come from Application Default Credentials or
`FIREBASE_SERVICE_ACCOUNT_JSON` / `FIREBASE_SERVICE_ACCOUNT_PATH`; a project
mismatch is an error.

Because the new triggers are live, these writes enter the rebuild outbox and merge
into a normal server-issued revision above zero. Let that rebuild finish, or use the
manual recovery callable. Never repeat bundled bootstrap after the queue has
started.

### 6. Clean up legacy data

After the new Firestore rules are live, review and delete the legacy
`adminLoginSecurity/default` document. The retired function may have stored raw IP
addresses and user agents there, and the new auth path doesn't use it. This is left
manual on purpose, so that you make the retention decision.

## Bootstrap the sole administrator

Order matters. `restrictUserCreation` and `restrictUserSignIn` are Identity
Platform blocking functions. They reject every new account and every sign-in except
the exact configured owner email. If the configuration is empty or invalid, they
reject all of them.

1. Upgrade Firebase Authentication to Identity Platform and enable a first factor
   that supports MFA (email/password for this site). Keep anonymous auth and all
   unused federated providers disabled. Firebase doesn't run blocking functions for
   anonymous or custom-token sign-in, and this repository deliberately has no
   custom-token endpoint.
2. Before deploying the blocking functions, create the owner account in the
   Firebase console and verify its email. Note its UID. Review and disable any old
   non-owner users; the sign-in gate denies them anyway. Don't add a public sign-up
   UI.
3. Put the same normalized address in `functions/.env.<firebase-project-id>` as
   `ACKARACA_ADMIN_EMAIL` and deploy Functions. Check that a throwaway address can't
   sign up or sign in, and that the owner can open `/studio/setup`. That first
   sign-in works by email match alone, without the admin claim.
4. Enable TOTP for the project. The command is locked to an explicit project and
   confirmation phrase:

   ```sh
   FIREBASE_PROJECT_ID='firebase-project-id' \
   CONFIRM_TOTP_ENABLE='enable-totp:firebase-project-id' \
   npm run auth:enable-totp --prefix functions
   ```

   It keeps existing MFA settings, enables project-level MFA, and enables TOTP with
   one adjacent 30-second interval. It uses Application Default Credentials or
   `FIREBASE_SERVICE_ACCOUNT_JSON` / `FIREBASE_SERVICE_ACCOUNT_PATH`, fails on a
   project mismatch, and does nothing without the exact confirmation.
5. Sign in as the owner at `/studio/setup` and enroll the TOTP factor.
6. Only after enrollment, grant the admin claim with the owner's email and UID:

   ```sh
   FIREBASE_PROJECT_ID='firebase-project-id' \
   FIREBASE_ADMIN_UID='firebase-uid' \
   FIREBASE_ADMIN_EMAIL='owner@example.com' \
   ACKARACA_ADMIN_EMAIL='owner@example.com' \
   CONFIRM_ADMIN_CLAIM='grant:firebase-uid' \
   npm run admin:claim --prefix functions -- grant
   ```

   The script checks the UID, the exact email, that the email is verified, that the
   user is enabled, and that a TOTP factor is enrolled. It rejects a project
   mismatch and requires both email values to match, so you can't claim a
   differently configured account by accident. It adds the claim, then atomically
   replaces `systemPolicies/owner-access` with the UID and lowercase email, then
   revokes existing sessions so the next sign-in gets a fresh token. Until the
   policy write succeeds the claim is useless. Clients can't read, write or delete
   the policy document.

   Use a separate, temporary identity for this step. Enabling TOTP and writing the
   claim need `roles/firebaseauth.admin` (`firebaseauth.configs.update` and
   `firebaseauth.users.update`) and a Firestore write to
   `systemPolicies/owner-access`. Remove those permissions afterward. Routine
   deploys need only `roles/firebaseauth.viewer`.
7. Sign out, sign in again with password and TOTP, open `/studio`, and run
   `ACKARACA_OWNER_PREFLIGHT_MODE=normal npm run owner:verify --prefix functions`
   before deleting any temporary credentials.

To remove access, revoke the claim. A revoke deletes the policy first, so an
interrupted revoke still leaves access closed. It needs only the target email (plus
project, UID and the `revoke:<uid>` confirmation), so you can strip a wrongly
claimed account even after the configured owner email changed:

```sh
FIREBASE_PROJECT_ID='firebase-project-id' \
FIREBASE_ADMIN_UID='firebase-uid' \
FIREBASE_ADMIN_EMAIL='wrongly-claimed@example.com' \
CONFIRM_ADMIN_CLAIM='revoke:firebase-uid' \
npm run admin:claim --prefix functions -- revoke
```

Never commit credentials, UIDs, emails, App Check debug tokens or secret values.

Don't delete or rename either blocking function without also unregistering its
Identity Platform trigger. An orphaned trigger can lock everyone out. Read
Firebase's
[auth blocking trigger documentation](https://firebase.google.com/docs/functions/auth-blocking-events)
before changing this.

## Seed content

The `seedContent` callable and the local CLI read the same file,
`functions/data/canonical-content.json`: site settings, eleven projects and two
journal entries. The root build checks that it matches the bundled fallback exactly.
Both are create-only, so existing documents are never overwritten, even if the
fallback changes. `content-seeds.json` remains only as a fixture for recognizing
old collisions and is never seeded.

The CLI needs an explicit project and confirmation:

```sh
FIREBASE_PROJECT_ID='firebase-project-id' \
CONFIRM_CREATE_ONLY_SEED='ACKARACA_CREATE_ONLY' \
npm run seed:content --prefix functions
```

Use the callable from the admin panel when you can. The CLI is for controlled
recovery with local Admin SDK credentials, and it rejects a service-account/project
mismatch. After you intentionally change the fallback content, run
`npm run content:sync-functions`. CI and the build fail until the Functions copy is
valid and identical.

## Media

### Upload and promote

Browser uploads go to a staging path, `admin-media/{uid}/{uuid.ext}`, and can't be
read anonymously. The browser sends `private,max-age=0,no-store` caching and never
creates a download-token URL. Storage Rules can't see cache headers, so privacy
rests on authentication, the owner-scoped immutable path and the absence of
download tokens.

Once a project or journal slug exists, the editor calls `promoteMedia` with
`{ stagingPath, entity: 'project' | 'journal', slug }`. In the client this is
`promoteAdminImage(stagingPath, entity, slug)`. The callable checks ownership,
MIME metadata, size, extension and file signature, copies that exact object
generation to an immutable scoped path, and returns:

```json
{
  "ok": true,
  "url": "https://firebasestorage.googleapis.com/v0/b/.../o/...?alt=media",
  "storagePath": "media/projects/example/uuid.webp",
  "contentType": "image/webp",
  "size": 123456,
  "promotedNow": true,
  "deletionCapability": "43-character-one-time-session-secret"
}
```

### Who can read it

The returned URL becomes publicly readable only when its filename is listed in the
**active deployment** document `mediaPublications/{entity--slug}`, which only the
server writes. The Firestore `status` of a document is deliberately not used: the
public site is a static snapshot, so saving a draft or a failed rebuild must not
cut images from the site that is still live. A promoted but unsaved image stays
private even if its slug belongs to a deployed page. Clients can't read or write
manifests.

### Checks before a release

Before `prepare` or `finalize` can claim the publication lease, the publisher sends
bounded-concurrency metadata `HEAD` requests for every public media path. It aborts,
before changing any manifest, if an object is missing or any of these differ from
what is expected: path, entity, slug, uploader or staging source, MIME type or
extension, size, source generation, current generation. The verified set is hashed
into the deployment snapshot identity, so `prepare` and `finalize` must see
identical generations. After the publication and media-mutation leases are claimed,
each phase checks the whole set again and requires the same hash before its first
manifest write. Every later manifest transaction also verifies that both leases are
still held. The same validation protects `promoteMedia` when the destination already
exists, so a partially written or altered file is never returned as success.

### Deleting

`deletePromotedMedia` takes `{ storagePath, entity, slug, deletionCapability }`. It
uses a limited-use App Check token, requires the TOTP owner, and checks the
server-written ownership, MIME and generation metadata. The capability is a
session secret, valid for two hours and not recoverable. Only the request that
actually creates a promoted object receives it; repeated promotion calls never
return it. Deletion uses a generation precondition and checks both the active
deployment and every draft, published and archived reference while holding the
shared media-mutation lease. So only an object promoted during the current,
unsaved editor session can be deleted this way. Every attempted delete is first
written to a journal by exact path and generation. A missing object counts as
success. Any ambiguity about ownership, capability, references, manifests or
generation fails the request.

Browser rules deny create, update and delete on all promoted and site-media paths,
including for the admin.

### Garbage collection

`collectOrphanedMedia` runs daily at 03:17 Europe/Berlin. It deletes staging
objects older than 48 hours and promoted objects older than 30 days, only if all of
these still hold right before a generation-preconditioned delete:

- the object has valid server promotion metadata;
- no active deployment manifest contains it;
- no draft, published or archived Firestore record references it.

Invalid manifests, malformed references, inspection errors and deployment overlap
all keep the object. The final scan and the delete run under the same server-owned
lease as the publisher, and client saves are blocked by the rules while it runs.
Cursors per prefix are saved every 25 inspected objects and at page boundaries, so
a killed run resumes without starving later objects. Each delete is journaled
before Storage is touched, and the result counters are audited separately.

## Public callables

Browsers can't read `projects`, `journal` or `siteSettings` directly, not even
published documents. The public site gets them through the build-time snapshot.
The two callables below are the only runtime public lookups.

### `submitInquiry`

Handles the contact form. Its Firestore transaction reads `siteSettings/main`
before it counts anything against the IP, email or global rate limits and before it
creates the inquiry. Only the availability values `open-to-inquiries` and `limited`
allow a submission. `unavailable`, a missing settings document or field, or an
invalid value is rejected with `failed-precondition`. If availability changes
concurrently, the transaction retries, so closing inquiries can't use up a quota
slot or leave a new record.

### `getPublishedPafta`

The only public data path for `/pafta/{code}`. Direct client reads of `paftas` stay
denied. The callable requires and consumes an App Check token and allows 30 lookups
per IP every 10 minutes. The input must match the old generator's format exactly:

```json
{ "code": "pafta-1700000000000-a1b2c3d4e" }
```

It queries `status == 'published'` with the exact `qrCodeData`, limited to one
document. A missing, unpublished or corrupt document returns
`{ "ok": true, "pafta": null }`. A match returns only a sanitized `title`, optional
`description`, `semester`, `year`, `course` and `professor`, a bounded `technologies`
list, and image URLs allowed by the CSP (Firebase, Google or same-origin). Internal
IDs, the QR code, project links, AI prompts, blocks and unknown fields are never
returned. Deploy the composite index `paftas(status, qrCodeData)` together with the
function.

## Security Rules tests

Run `npm run test:rules` from the repository root. The Firebase emulators need Java
on `PATH`. The suite covers:

- no anonymous reads of the snapshot collections;
- owner UID/email plus MFA checks, and denial of a wrong admin claim that looks
  valid;
- client denial of the owner policy;
- function-owned collections;
- staging upload limits;
- quarantine of legacy media;
- active-deployment media manifests, including that old-site media stays readable
  after draft or delete changes, while promoted-but-unsaved and finalized-retired
  files stay private.

The emulator can't test the production cross-service IAM grant. After the first
backend deploy, check that role and run a Storage smoke test with the owner and
with a wrong admin.

## Rebuild outbox

Writes that can change the public snapshot no longer depend on the browser sending
a second request. Retrying Firestore triggers queue a rebuild for every project or
journal write where the before or after state is published, and for every
`siteSettings/main` write.

The hashed Firestore event ID names a private `rebuildOutbox` document and a
deterministic request ID. Creating that document and incrementing
`systemOperations/site-rebuild.requestedRevision` happen in one transaction, so a
redelivered event resumes the same revision instead of allocating a new one.
Concurrent events keep revisions increasing and merge their paths. If sending
fails, the record stays queued and the trigger retry takes over an expired lease.

The HTTP call and its Firestore acknowledgement can't be made one atomic
exactly-once step, so a retry after an uncertain result sends the same request ID
and revision. Receivers must be idempotent on those two values.

Triggers only update a server-owned dispatch signal. A single-instance worker waits
for ten seconds of quiet, then sends the latest revision. A large seed or batch
write therefore produces one deployment, even if per-document trigger deliveries
are backlogged. Earlier outbox events are acknowledged with the merged revision.

### GitHub Actions claim

Before any build or deploy, the workflow must claim the revision:

```sh
REBUILD_EXECUTION_ID="github-${GITHUB_RUN_ID}" \
CONFIRM_REBUILD_EXECUTION="claim:${ACKARACA_CONTENT_REVISION}:${FIREBASE_PROJECT_ID}" \
npm run rebuild:claim --prefix functions
```

The script writes `should_run` and `claim_outcome` to `GITHUB_OUTPUT`. Run
`npm run deploy:production` only when `should_run=true`. The claim:

- is bound to the exact revision and request ID the server accepted;
- has a 40-minute recovery lease;
- skips stale or already-active revisions;
- blocks concurrent duplicate runs (a different run ID can't take an active lease).

Keep `REBUILD_EXECUTION_ID` set during deploy so `report-rebuild-result.mjs` can
mark the claim `active` or `failed`. The deploy wrapper reports its own failure by
stage (`build`, media prepare, Firebase deploy, media finalize) and writes
`result_reported=true` to `GITHUB_OUTPUT` only after that report is stored. The
workflow's generic `github-workflow-failed` report runs only when the marker is
missing, and a duplicate report never replaces the first, more specific code.

A cancelled run or a platform timeout may not get to report. Its claim then stays
blocked until the 40 minutes pass, after which a new run can take over. Re-running
the same GitHub run keeps the same owner ID (`github-${GITHUB_RUN_ID}`) and can
recover right away. Media `prepare` remains an independent last check.

### Retention

Queued outbox records have no TTL. Finished ones (`hook-accepted`) expire after 90
days. A running claim also gets a 90-day TTL, far longer than its 40-minute lease,
so an abandoned claim doesn't stay forever; a final `active` or `failed` report
refreshes it. Firestore TTL is enabled for both collections.

One consequence: if an event is redelivered after its finished outbox record was
already deleted, it gets a new revision and triggers a redundant deployment. It
can't reuse or corrupt an earlier revision. We accept this as the price of bounded
retention.

## Manual rebuild requests

`requestSiteRebuild` is the TOTP-admin, App Check callable for manual and recovery
rebuilds. Normal Studio saves use the outbox instead. It never accepts or returns a
deploy token. Manual and automatic requests go through the same dispatcher, the
same revision/request pair, the same retry path, audit log and outbox
acknowledgement.

Configure the target URL and bearer token as Functions secrets, and choose the
provider and host separately:

```sh
firebase functions:secrets:set SITE_REBUILD_WEBHOOK_URL
firebase functions:secrets:set SITE_REBUILD_WEBHOOK_TOKEN
# Put these non-secret values in functions/.env.<project-id>,
# or answer the Firebase CLI prompt at deploy time.
SITE_REBUILD_WEBHOOK_HOST='build-provider.example'
SITE_REBUILD_PROVIDER='generic'
```

For this repository's GitHub Actions flow, use `SITE_REBUILD_PROVIDER='github'`,
host `api.github.com`, and the URL
`https://api.github.com/repos/{owner}/{repo}/dispatches`. The fine-grained token
needs permission to create repository dispatches for this repository only. GitHub
gets `event_type: "site-rebuild"` with the payload under `client_payload`. Generic
providers get `event: "site.rebuild.requested"` with the same payload at the top
level. Both use `Authorization: Bearer ...`.

The workflow has no free-form revision input. For every revision above zero, the
runner checks the revision and the server-issued request ID against the accepted
Firestore queue before preparing media, so a forged or future revision can't
disturb the revision order. Revision `0` is accepted only before the queue has ever
started, and only from the operator command in the legacy migration section.

Request body:

```json
{
  "reason": "content-published",
  "paths": ["projects/example-project"]
}
```

Allowed `reason` values: `content-published`, `content-updated`, `settings-updated`
and `manual`. For content-driven requests, paths must be `projects/{slug}`,
`journal/{slug}` or `siteSettings/main`.

How dispatch works:

- exact-host HTTPS allowlist, no redirects, 15-second timeout, App Check token is
  consumed;
- every request gets a growing `revision`;
- the queue at `systemOperations/site-rebuild` merges paths that arrive during an
  in-flight dispatch, and the active dispatcher sends the trailing revision
  afterward;
- each caller waits for its own revision to be accepted. If the active dispatcher
  fails or its lease expires, a waiting caller takes over atomically;
- three automatic attempts, and failed paths are kept;
- success is reported as
  `{ status: "hook-accepted", revision, acceptedRevision, coalesced }`. Webhook
  acceptance is never reported as a finished deployment.

### Status for the Studio

The Studio polls `getSiteRebuildStatus` (TOTP and App Check). It combines the
accepted hook, the deploy wrapper's failure result and
`media-publication.activeContentRevision`. Only the last one produces the green
"live deployment verified" state. Hook failures, build, prepare, deploy and
finalize failures, and a 15-minute confirmation timeout stay visible with a retry
action.

`getLatestSiteRebuildStatus` takes no input and returns the same limited admin
view for dashboard monitoring. Before the queue exists it returns
`targetRevision: 0` and `state: "idle"`. Afterward it targets the latest requested
revision, including `queueStatus: "queued"` during the quiet window. It never
returns request IDs, credentials, raw queue documents or unbounded error text.

### What the build provider must do

The webhook body carries the same `revision`. The provider must run one job at a
time for this site, drop stale revisions, and pass the accepted value as
`ACKARACA_CONTENT_REVISION` to the production deploy. This revision acts as a
fence: an older job can't prepare or finalize media after a newer one.

## Build-time content export

A deploy hook alone doesn't refresh the static pages. Every normal revision above
zero must replace the bundled fallback with a validated Firestore snapshot before
prerendering. The one exception is the confirmed revision-0 bootstrap, which
exists so invalid legacy Firestore data can't block installing the new rules and
functions. The build runs the export first when enabled:

```sh
ACKARACA_EXPORT_FIRESTORE=true \
CONFIRM_CONTENT_EXPORT=ACKARACA_PUBLIC_CONTENT \
npm run build
```

The export step:

1. needs both dependency trees installed (`npm ci` and `npm ci --prefix functions`);
2. resolves `FIREBASE_PROJECT_ID` and authenticates with
   `FIREBASE_SERVICE_ACCOUNT_JSON`, `FIREBASE_SERVICE_ACCOUNT_PATH` or Application
   Default Credentials. Credentials stay in the build provider's secret store and
   never end up in artifacts or logs;
3. reads `projects` and `journal` where `status == 'published'`, and exactly
   `siteSettings/main`;
4. removes Firestore-owned timestamp fields, validates every record with the same
   root parsers the app uses, and fails on any invalid record or duplicate slug.
   It never reuses an old snapshot;
5. sorts projects by `order` then slug and journal entries by publication date then
   slug, serializes with stable key order, and atomically writes
   `src/data/generated-content.json`;
6. makes `entry-server`, static path discovery, sitemap generation and the client
   all use that same snapshot for the whole build. A build that still imports only
   `src/data/portfolio.ts` is not a fresh build.

## Atomic Hosting and media deployment

The hook target must run the two-phase deploy wrapper, not a bare
`firebase deploy`.

1. **`prepare`** validates the generated snapshot and activates the union of old
   and new media filenames.
2. After Firebase confirms the Hosting deploy, **`finalize`** narrows the manifests
   to exactly the new snapshot.

If the build or deploy fails, the old files stay active. A growing content
revision, an internal deployment revision and a single prepared-release fence
reject overlapping, stale or conflicting activations. An expired or failed attempt
can restart only the identical snapshot and revision, under a new deployment ID.
Successful or modified duplicates stay blocked.

For the first deploy, use the planned bundled revision `0` (see above). After that,
disable bootstrap mode and use the revision from the rebuild webhook. Export every
production web value from the root `.env.example` and every non-secret Functions
parameter from `functions/.env.example` first. Validation rejects missing,
placeholder, cross-project or cross-bucket values before the build starts.

In normal mode the wrapper exports and validates Firestore content and deploys all
targets. In bootstrap mode it temporarily installs the planned fallback for the
build, restores your previous file afterward, and deploys static Hosting first,
then Firestore rules and indexes, Storage Rules and Functions. In both modes, media
is finalized only if every resource phase succeeded. Hosting and backend failures
have separate codes, so you know where to resume.

The wrapper records each stage failure, and the verified active result, in
`systemOperations/site-rebuild`, using the same deployment ID and revision the
Studio status polling reads. It needs an authenticated Firebase CLI and either
Application Default Credentials or the documented service-account variables. When
a GitHub run holds a claim and the failure was stored, the wrapper also writes
`result_reported=true` (see above).

If Hosting succeeds but finalize fails, the union stays in place, which is safe,
and the log prints the deployment ID so you can retry only the finalize step. If
the deploy can't be confirmed, the attempt is marked aborted and old files are not
removed.

You can run the phases by hand with the same snapshot, `MEDIA_DEPLOYMENT_ID`,
project, bucket and revision:

```sh
CONFIRM_MEDIA_PUBLICATION='prepare:deployment-id:firebase-project-id' \
npm run media:publication --prefix functions -- prepare

# Deploy the exact dist/ built from the same generated-content.json.

CONFIRM_MEDIA_PUBLICATION='finalize:deployment-id:all-resources-deployed:firebase-project-id' \
npm run media:publication --prefix functions -- finalize
```

Finalize only after every intended Firebase resource phase is confirmed. Otherwise
run `abort` with
`abort:deployment-id:release-not-fully-deployed:firebase-project-id`, which leaves
the union manifest in place. If a bootstrap backend phase fails, the already-safe
static Hosting release stays live and the failure is recorded. Retry with the same
revision and snapshot under a new deployment ID.

The export identity can be read-only. The deploy identity also needs narrow write
access to `mediaPublications`, `systemOperations/media-publication`, and the
deployment result in `systemOperations/site-rebuild`. The scheduled Functions
identity additionally owns `systemOperations/media-gc` and orphan deletion. None of
these credentials or operational documents reach the browser or any callable
response.
