---
title: "Product Content Near-Duplicate Detection"
company: "AI Agent Marketplace"
period: "2026.06 - 2026.07 (2 months)"
role: "Designed and implemented product content plagiarism detection (including the product-service ↔ ai-service contract) - preemptively blocked plagiarism with normalized hashing instead of blockchain/NFT"
techStack: ["Spring Boot", "pgvector", "Spring AI", "MSA"]
order: 3
type: "project"
summary:
  [
    "Discarded the blockchain/NFT certification idea and redesigned around exact-match normalized hashing to fit the problem that actually needed solving (preemptively blocking unauthorized content reuse)",
    "Distinguished the two failure modes that occur on concurrent submission (self-collapse / TOCTOU false negative), eliminated only self-collapse via an asymmetric comparison plus a single-DB-clock trigger, and explicitly deferred the remaining risk",
  ]
---
## Background

The initial plan was to attach blockchain/NFT certification to products. **On review**, I concluded that the means didn't match the problem we were trying to solve.

- The target was reproducible digital content, not one-of-a-kind physical items, so ownership tokenization wasn't the right fix for the problem.
- All an NFT proves is a timestamp — it can't judge "how similar is this piece of writing to that one."
- The actual harm original creators suffered was **near-duplicates**: someone else's prompt re-listed as a new product with nothing but a space changed.
- The existing LLM auto-review (Spring AI + OpenAI Vision) caught policy violations (illegal, obscene, fraudulent, spam, low-quality) but **judged each product in isolation**, with no way to compare it against other sellers' products — so it couldn't structurally detect plagiarism.

→ I reframed the plan from "issuing a certificate" to **"comparing content identity at registration time."**

## Outcomes

- **Redirected the plan**: reframed the problem to discard the blockchain/NFT certification approach and replace it with duplicate detection
- **Adopted after comparing alternatives**: compared reusing existing embeddings against normalized hashing and adopted exact-hash matching  
 exact matching **structurally produces no false positives**, with no additional OpenAI calls and no new infrastructure
- **Established the criterion for determining the original**: identified the failure scenario for each of the two existing timestamp columns, added a dedicated column, and used a DB trigger to guarantee total order across multiple pods
- **Separated concurrency failure modes and handled them individually**: eliminated self-collapse with a conditional expression alone, and explicitly deferred the TOCTOU (Time-of-check to time-of-use) false negative by specifying its promotion criteria
- **Scope of work**: owned the product-service ↔ ai-service contract change (extending the review-request payload) and the implementation

## Design and Implementation

**1. Normalized hashing instead of embedding reuse**

> Decision: rejected reusing the existing pgvector embedding, because of its false-positive structure and the loss of its one reuse advantage.

Reasons for rejection:

- The embedding source was built by concatenating name, tags, and description, so products in the same category could score similar purely on shared vocabulary — a significant risk of **flagging honest products as plagiarism**.
- Content was truncated at 2,000 characters (`EmbeddingSource.MAX_CONTENT_CHARS`), so long prompts couldn't be checked past that point.
- Embedding content alone would require building a separate vector, index, and batch job from scratch, which would erase the one advantage of "reusing what already exists."

Reasons for adoption (normalized hash + exact match):

- It only reacts to the body content and is exact-match, so false positives structurally cannot occur.
- No OpenAI call is involved, so there's no added cost or latency.
- It covers the full body content, so there's no truncation problem.

Known limitations left in place (v1 scope):

- Exact matching only catches differences at the level of whitespace and case, so **changing even a single word evades it.**
- Strengthening normalization to also strip punctuation and markdown would widen detection coverage, but it comes with a **trade-off**: the risk of distinct bodies colliding into the same hash also rises.
- So without measured evidence, I didn't raise the strength and stopped at v1 (whitespace collapsing + trim + lowercasing).
- **The promotion criteria were defined in advance.** If word-level edit evasion is actually observed, we switch to threshold-based shingling (MinHash/LSH).

**2. Scoping detection and the "asymmetric-key signatures aren't needed" argument**

> Decision: narrowed detection scope to PROMPT only, and concluded that DB timestamps alone are sufficient to determine precedence without signatures.

- Only the PROMPT product type has a content field (PPT/EXCEL are files, NOTION is an external link), so I scoped detection accordingly.
- During review, someone pointed out that "an NFT-style approach should have asymmetric-key signatures," but I judged the premise didn't apply here.
- What a signature proves is **attribution and non-repudiation** ("this identity agreed to this content"), not **precedence** ("who created it first"). A plagiarist can copy the original verbatim and sign it with their own key, and that signature is still valid.
- Our system isn't decentralized — **product-service processes every registration through a single path** — so a single DB-stamped timestamp, without any signature, was enough to establish precedence in a way that can't be forged.

**3. The pitfall of ordering comparisons - neither existing column was usable**

> Decision: since neither `created_at` nor `updated_at` could serve as the ordering criterion, I added a dedicated column, `content_hash_at`.

| Column | Flaw | Consequence |
| ------------ | --------------------------------------------- | ------------------------------------------------ |
| `created_at` | Doesn't change even when the content is completely replaced (update / nextVersion) | Replacing an old product's content with stolen content causes **the thief to be judged as the original** |
| `updated_at` | Keeps getting refreshed by changes unrelated to content, like view or sale counts | The more popular a long-selling product is, the more recent it looks — and **the very thing we're trying to protect walks right into this trap** |

So I added a dedicated column that updates **only when the content hash actually changes.**

**4. Separating the two failure modes of concurrent submission**

If different sellers submit the same content at nearly the same time, two kinds of failure were possible.

| Failure mode | Symptom | Handling |
| ----------- | ---------------------------- | ------------- |
| ① Self-collapse | Both sides see each other, so **even the original gets rejected along with the copy** | Eliminated with a conditional expression alone |
| ② TOCTOU false negative | Neither side sees the other, so **both pass** | Deliberately deferred |

- **①** is eliminated purely by the conditional expression itself, via the asymmetric comparison `content_hash_at < mine`. Whichever one was truly confirmed first can never find a row earlier than its own, so no additional structure was needed.
- **②** is a **visibility problem** that value comparison alone can't close. If a commit isn't yet visible to the other side's query, no value, however correct, can filter it out. Closing it would require separate serialization (e.g., a table with a unique-constraint lock), but since concurrent plagiarism submissions haven't actually been observed, I drew the line at not building it for now.

**Another source of order inversion eliminated - clock skew across pods**

- If `content_hash_at` were stamped by the app using `LocalDateTime.now()`, then since product-service runs across multiple pods, clock skew between pods could invert the order — **a plagiarist who submitted later ending up with an earlier timestamp.**
- To prevent this, I moved value generation from the app to a DB trigger (`BEFORE INSERT OR UPDATE`, calling `now()` only on the branch where the hash actually changed), guaranteeing total order against a single DB clock.

**5. Adding a signal to the existing review flow instead of a new event**

> **Decision: instead of creating a new event, I added a single field, `duplicateOfProductId`, to the existing** `PRODUCT_REVIEW_REQUESTED`**.**

- I extended ai-service so that whenever this value is present, it **auto-rejects without calling OpenAI.**
- Because there's no separate signal arriving on its own path that needs to join up at decision time, **there's no race condition to begin with.**
- Even if the event is lost, the product simply stays in PENDING_REVIEW, so there's **no fail-open risk of silent approval.**

![Plagiarism-detection review flow sequence diagram - product-service computes a normalized content hash, a DB trigger finalizes content_hash_at, it looks up the earliest other seller's product with the same hash, publishes PRODUCT_REVIEW_REQUESTED including duplicateOfProductId, and delivers it to ai-service. If duplicateOfProductId is present, it auto-rejects without an OpenAI call; otherwise it runs the existing LLM policy review](../../../assets/portfolio/prompthub/content-duplicate-detection/review-sequence.svg)
*Plagiarism-detection review flow - auto-rejects without an OpenAI call when the normalized hash matches*

## What I Deliberately Left Undone

- **TOCTOU false negative** - closing it would require a serialization structure, but since the risk hasn't been observed yet, I chose to promote it only if and when it is observed.
- **Rather than pre-building structure for an unobserved risk, I documented the promotion criteria to draw a clear boundary.**
