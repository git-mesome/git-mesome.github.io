---
title: "Reviewing 220 Backend PRs + Parallel QA - Choosing Team-Wide Quality Over Personal Output"
company: "AI Agent Marketplace"
period: "2026.06 - 2026.07 (2 months)"
role: "Team Lead & PO, dedicated to PR review and QA"
techStack: ["GitHub", "Code Review", "QA"]
order: 5
type: "practice"
summary:
  [
    "After watching the codebase deteriorate under a rotating review system with 5 team members, decided at a team meeting to take on the reviewer role myself - allocating time to team-wide code consistency and quality instead of personal feature output",
    "Reviewed 220 backend PRs (closed), directly found 30+ bugs through parallel QA, and generated additional issues using a static analysis tool",
  ]
---

## Background

- Early on, all 5 team members were designated as reviewers, with whoever had time randomly picking up PRs to review.
- The first week seemed to run fine, but as time went on, everyone got busy with their own implementation work, and cases emerged where PRs were approved just by skimming the PR description without checking the package structure or architecture.
- We even found cases where a feature described in the PR document didn't actually exist in the code.
- The codebase kept getting messier, and as the semi-project deadline approached, PRs with 30 commits dumped in at once - PRs that were essentially unreviewable - started showing up.
- I shared this situation at a team meeting (related: [The Issue Management System I Proposed to a Team That Kept Missing Deadlines](/portfolio/prompthub-issue-management)), and it was decided that I would take on the review role full-time.

## Results

- Reviewed 220 backend PRs (currently closed) as the sole reviewer
- Directly found 30+ bugs through parallel QA
- Ran a separate codebase static analysis tool (CodeFlow) to generate additional issues
- Traded personal feature implementation time for a review-level understanding of the entire team codebase

![Static analysis screen of the apigateway service using CodeFlow - Health Score 97/100, 120 files, 9,321 lines. The Design Patterns & Anti-Patterns panel on the right shows a God Object anti-pattern found in 2 files (files with 15+ functions, needing responsibility separation). This report was used as the basis for creating additional refactor issues](../../../assets/portfolio/prompthub/pr-review-and-qa/codeflow-apigateway-analysis.png)
*CodeFlow static analysis - apigateway Health Score 97/100*

## Decisions and Process

While the other 4 team members focused on feature implementation, it was decided at a team meeting that I would take on the reviewer role full-time - instead of increasing my own implementation output, I allocated my time to reviewing each PR individually and taking charge of cross-domain consistency and code coherence.

The problem of not being able to check PRs in real time, since I also had my own feature implementation work, was solved by **building a personal GitHub dashboard using AI**. I set up a rule to gather "**PRs I've opened, PRs where I'm requested as a reviewer, and items where I'm mentioned**" into a single screen, and to review them all at once on the hour.

![Personal GitHub dashboard - shows 3 panels in one screen for account Minseo Kim (@git-mesome): PRs I've opened, PRs requested for review, and mentioned items. Built with AI and used to check PR status once every hour](../../../assets/portfolio/prompthub/pr-review-and-qa/personal-pr-dashboard.png)
*Personal GitHub dashboard built with AI - a combined view of my open PRs, review requests, and mentions*

QA was carried out in the following order:

1. Read the PR document and ask questions about anything the design didn't make clear
2. Check whether the codebase's package structure was implemented according to the architecture the team had agreed on
3. Check that another person's service code hadn't been touched (this actually happened)
4. If the code was long, open the branch in IntelliJ and trace through the methods
5. Point out places where transaction separation was needed
6. Point out class/method naming that should reveal intent
7. After merging, ask that actual behavior be verified via Swagger
8. Go into the dev server directly to check for bugs, and if found, create a bug/refactor issue for the frontend or backend

![Team presentation slide - a 4-stage verification process going local testing → Swagger spec validation → frontend deployment → dev server E2E. Steps 7 and 8 of the QA process above (Swagger check, dev server check) were carried out as part of this process](../../../assets/portfolio/prompthub/pr-review-and-qa/team-test-process-slide.png)
*Team verification process - local testing → Swagger validation → frontend deployment → dev server E2E*

**Operations and Retrospective**

Having a single reviewer was inevitably a bottleneck, and there were actual cases of team members waiting on reviews.

I let people know that PRs would be reviewed by urgency, based on priority criteria already set at project kickoff, and had them wait accordingly.
For teammates asking me to rush approval so they could move on to the next task, I persuaded them by suggesting they branch off into a new worktree and continue, or rebase and merge later.

My personal feature implementation output dropped, but in exchange I gained a review-level understanding of the entire team's codebase - that's the other side of this trade-off.
This was a case of applying the principle of deciding upfront what to keep and what to give up within a fixed deadline, this time by choosing to give up "my own feature implementation."
