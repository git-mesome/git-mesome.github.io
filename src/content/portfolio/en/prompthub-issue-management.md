---
title: "An Issue Management System for a Team That Kept Missing Deadlines"
company: "AI Agent Marketplace"
period: "2026.06 - 2026.07 (2 months)"
role: "PO, Collaboration Process Design"
techStack: ["Notion", "GitHub Issues","Soft Skills"]
order: 4
type: "practice"
summary:
  [
    "Narrowed my PO scope from User + API Gateway down to API Gateway alone and redefined my role as team schedule management - shifting my time from personal implementation to team progress management",
    "Ran a Notion task management system + daily scrum, shifting a team culture that hid issues and bugs into one that shares them proactively",
  ]
---
## Background

Over a month of running a semi-project, I identified two problems. Team members would report tasks as "done," but opening the actual code often revealed a badly designed structure or code that simply didn't work. Work also wasn't clearly divided, so deadlines kept slipping.  
I concluded the root cause was that, since everyone was still a junior developer, people didn't know exactly what they were supposed to do, which led to poor time allocation.  
If we continued the remaining month before the final project submission this way, I judged we would either fail to finish with the result we wanted, or end up doing "mindless AI development" - just following whatever the AI produced.

## Outcomes

- Narrowed my PO scope from User + API Gateway down to API Gateway alone, and redefined my role as team schedule management
- Made the remaining month's milestones and each member's **tasks and priorities** visible to the whole team through a Notion task management DB + a **daily morning scrum**
- Shifted the team culture from hesitating to share issues/bugs to proactively sharing today's issues
- Completed 100% of tasks on schedule

## Judgment and Execution

The first thing I changed was my own role. During the month-long semi-project, as both PO and a team member I was responsible for two domains, User and API Gateway. I narrowed my scope to API Gateway alone and used the freed-up time for managing teammates' schedules. I judged that knowing what the whole team needed to finish by when in the remaining month mattered more than implementing one more feature myself.

To do this, I created a task management page in Notion and consolidated the information the team needed into a single database. I rebuilt the milestones for the entire remaining month, registered each member's individual tasks, and set priorities through a meeting.

![Notion workload view - a donut chart comparing the number of tasks assigned per team member, used in the initial task allocation meeting to spot and adjust workload imbalances at a glance](../../../assets/portfolio/prompthub/issue-management/workload-view.png)
![Notion priority view - a priority filter added to the due-date view showing task counts by P1-P4, used by the PO to signal which tasks teammates should tackle first](../../../assets/portfolio/prompthub/issue-management/priority-view.png)

*Left: donut chart of task allocation per team member · Right: task view by priority (P1-P4)*

By checking this page alone, team members could immediately see what they needed to do by that day.

![Notion schedule report table view - a list of estimated difficulty, progress status, priority, and due date for the features I (Minseo Kim) was responsible for (teammates' information is hidden for privacy)](../../../assets/portfolio/prompthub/issue-management/schedule-table.png)
![Notion calendar view - the due dates from the table above linked to a calendar database and visualized by date](../../../assets/portfolio/prompthub/issue-management/schedule-calendar.png)

*Left: schedule table by assigned feature · Right: calendar view of due dates*

Every morning, I checked progress through the daily scrum and reflected it in Notion.

![Notion progress view - a bar chart showing the number of completed tasks per team member, reflecting the progress confirmed in the daily scrum](../../../assets/portfolio/prompthub/issue-management/progress-view.png)
*Task progress per team member - bar chart of completed task counts*

The other piece was issue sharing. Early on, the team was hesitant to be the first to share bugs or issues, so I took the lead by checking issues posted on GitHub myself and directly asking the person responsible.  
Once one or two people started answering, a flow emerged where asking "anyone have an issue or bug worth sharing today?" would get an immediate response from whoever it applied to, and knowledge sharing settled in as a natural part of the culture.

**Operations and Retrospective**

The trade-off of this role change was less time for my own technical implementation.  
However, since I was the sole reviewer of every teammate's code as PO, I don't think I fell behind technically - I kept asking questions and looking things up during the review process whenever something was unfamiliar.  
As a result, the team started meeting deadlines, and for me, the process of building a culture of schedule management and issue sharing became an opportunity to grow my soft skills.

→ [The Notion task management page used at the time](https://playful-shield-230.notion.site/po-schedule-manage?source=copy_link)
