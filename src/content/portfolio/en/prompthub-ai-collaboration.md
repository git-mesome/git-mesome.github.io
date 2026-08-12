---
title: "My Attitude Toward Using AI"
company: "AI Agent Marketplace"
period: "2026.06 - 2026.07 (2 months)"
role: "PO and Backend Development"
techStack: []
order: 7
type: "practice"
summary:
  [
    "Despite adding a guideline prohibiting service-boundary violations, the same violation recurred three times and was caught in code review each time; traced the root cause to duplicated, scattered guidelines across services and consolidated them - confirmed the limitation that AI does not self-review whether it followed its own guidelines",
    "Found that harnesses (OMC, Superpowers, DryForge) adopted two months earlier attached multi-agent loops even to simple tasks, wasting tokens; removed harnesses that took over execution and kept only grill-me, which validates the planning stage",
  ]
---

## Thoughts

I believe an AI's ability to repeatedly execute a defined task and its ability to notice unexpected problems on its own are separate capabilities. I consider the latter to still be a domain humans need to own, and I ground this in a case I actually experienced.

After splitting services under MSA, we added a guideline that said "do not touch other services' code," but a PR from one teammate's work still modified another service's code (related: [Reviewing 220 Backend PRs While Running QA in Parallel](/portfolio/prompthub-pr-review-and-qa)). Even after confirming the guideline was in place, the same issue recurred two more times, and the teammate themselves was puzzled why it kept happening despite the guideline being there. All three instances were caught at the code review stage.

The root cause wasn't the absence of a guideline — it was that the same content was duplicated and scattered across the global guideline and individual service guidelines. I concluded that the guideline read slightly differently depending on scope, which kept it from being followed consistently. This case confirmed two things.

- Prompt guidelines function more like probabilistic nudges than hard enforcement, so when scopes are scattered, leakage paths remain.
- AI does not self-review whether it violated a guideline. It was the code review process that checked for recurrence and caught it.

Based on this experience, I draw the line between what I hand off to AI and what I check myself according to whether the task is hard to reverse. Easily reversible work, like CRUD API endpoints or button styling, I leave to AI; work that affects other services after deployment, like touching another service's code, I check myself.

## How I Use It

Until two months ago, I had no concept of skills — I was just improvising a different prompt each time. After encountering discussions on token optimization, I studied harness engineering (root context composition, etc.), and in the process tried adopting harnesses like OMC (Oh My Claude Code), Superpowers, and DryForge.

They built out complex design documents in depth, but even simple tasks like adding a CRUD API or tweaking a button style got a multi-agent review/verification loop attached, burning tokens. I checked the ponytail and Caveman skills the same way — Caveman turned out unnecessary as a skill, since a single line in CLAUDE.md ("use informal speech") achieved the same effect. Conversely, I didn't adopt the reasoning-reduction optimization built into the Caveman skill, because it looked likely to cut token usage at the cost of answer quality.

**I judged which to economize — tokens or answer quality — on a per-task basis, this way.**

After going through this review, the only thing I kept is the grilling skill (grill-me). The other harnesses took over the execution ("how") stage, but that actually made it harder to track how the work was progressing; grill-me doesn't take over execution — its only role is to probe deeply for assumptions missed at the planning stage.

When the planning is tightened up thoroughly beforehand, it's enough for execution afterward to split the work across agents and direct them myself, and it's also easier to track progress. **I judged that the ROI of repeating execution loops differs from the ROI of validating a plan with a handful of questions, and I use that distinction as my standard.**

We ran into the same problem at the team level. Because guidelines were managed separately per service, content duplicated from the global guideline piled up in each service, and every time the AI worked, it re-read the same content across multiple scopes, wasting tokens. During development, we held a team meeting and consolidated the duplicated guidelines across the whole backend repo into one, and after that the service-boundary violation problem I described earlier didn't recur either.

The work was aimed at reducing token usage, but it turned out to be a case that also confirmed that having guidelines scattered across multiple places was itself a source of reliability problems.
