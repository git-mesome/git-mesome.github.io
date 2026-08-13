---
title: "백엔드 PR 220개 리뷰 + QA 병행 - 개인 구현량 대신 택한 팀 전체 품질 관리"
company: "AI Agent 마켓플레이스"
period: "2026.06 - 2026.07 (2개월)"
role: "팀 리더 겸 PO, PR 리뷰 및 QA 전담"
techStack: ["GitHub", "Code Review", "QA"]
order: 5
type: "practice"
summary:
  [
    "팀원 5명이 돌아가며 리뷰하다 코드베이스 품질이 저하되는 걸 겪고, 리뷰어 역할을 전담하기로 팀 회의에서 결정 - 개인 기능 구현량 대신 팀 전체 코드 일관성·품질 관리에 시간을 배분",
    "백엔드 PR 220개(closed 기준) 리뷰, QA 병행으로 버그 30개 이상 직접 발견, 정적 분석 도구로 별도 이슈도 생성",
  ]
---

## 배경

- 초반엔 팀원 5명 전원을 리뷰어로 지정해, 시간 되는 사람이 그때그때 랜덤으로 PR을 봐주는 방식으로 운영했습니다.
- 첫 1주는 정상적으로 운영되는 것처럼 보였지만, 시간이 지날수록 각자 자기 구현에 바빠지며 패키지 구조·아키텍처 확인 없이 PR 문서만 보고 승인하는 사례가 나타났습니다.
- PR 문서에 적힌 기능이 실제 코드에는 반영되지 않은 경우도 있었습니다.
- 세미 프로젝트 마감이 다가올수록 커밋 30개가 한 번에 올라오는 등 리뷰가 어려운 규모의 PR도 늘면서, 코드베이스 품질 관리가 점점 어려워졌습니다.
- 이 상태를 팀 회의로 공유하고(관련: [마감을 놓치던 팀에 제시한 이슈 관리 체계](/portfolio/prompthub-issue-management)), 리뷰를 전담하기로 팀과 결정했습니다.

## 성과

- 백엔드 PR 220개(현재 closed 기준)를 리뷰어 1명(본인)으로 전담 검토
- QA를 병행해 버그 30개 이상 직접 발견
- 코드베이스 정적 분석 도구(CodeFlow)를 별도로 돌려 이슈를 추가로 생성
- 개인 기능 구현 시간을 줄이는 대신, 팀 전체 코드베이스를 리뷰 관점에서 파악

![CodeFlow로 백엔드 레포 전체(prgrms-be-adv-devcourse/beadv6_6_3JMT_BE)를 정적 분석한 화면 - Health A등급 92/100, 1.9K 파일·2.5K 함수·208.3K줄·17개 언어. 220개 PR 리뷰와 QA를 병행한 결과 전체 저장소가 이 수준의 건강도를 유지함](../../assets/portfolio/prompthub/pr-review-and-qa/codeflow-repo-health.png)
*CodeFlow 정적 분석 - 백엔드 레포 전체 Health A등급 92/100*

![CodeFlow로 백엔드 레포 전체를 정적 분석한 화면 - Health A등급 92/100, 1975개 파일·2550개 함수·213,832줄(java 47%·md 43%·yaml/yml/json/sh). 실제 마이크로서비스 폴더(admin/ai/apigateway/order/payment/product/settlement/user/notification-service 등) 기준 트리맵과 우측 Architecture Issues 패널에 Unused Functions 4개·Large Files 9개·Highly Coupled 84개·Duplicate Function Names 18개·Similar Code Blocks 3개·Architecture Violations 185개·High Complexity Files 20개가 카테고리별로 집계됨. 이 리포트를 근거로 리팩터 이슈를 추가 생성](../../assets/portfolio/prompthub/pr-review-and-qa/codeflow-backend-full-analysis.png)
*CodeFlow 정적 분석 - 백엔드 레포 전체 Health A등급 92/100, Architecture Issues 7개 카테고리*

## 판단 및 진행

팀원 4명이 기능 구현에 집중하는 동안, 본인이 리뷰어 역할을 전담하기로 팀 회의에서 결정했습니다 - 개인 구현량을 늘리는 대신, PR 하나하나를 검토해 도메인 간 정합성과 코드 일관성을 담당하는 쪽으로 시간을 배분했습니다.

담당 기능 구현 작업도 있어 PR을 실시간으로 확인하기 어려웠던 문제는, **AI로 개인용 GitHub 대시보드를 만들어** 해결했습니다. "**내가 열어둔 PR·리뷰 요청된 PR·멘션된 항목**"을 한 화면에서 모아 보고, 정각마다 한 번씩 몰아서 리뷰하는 규칙을 세웠습니다.

![개인용 GitHub 대시보드 - Minseo Kim(@git-mesome) 계정 기준 내가 열어둔 PR·리뷰 요청된 PR·멘션된 항목 3개 패널을 한 화면에 모아 보여줌. AI로 직접 만들어 정각마다 PR 현황을 확인하는 용도로 사용](../../assets/portfolio/prompthub/pr-review-and-qa/personal-pr-dashboard.png)
*AI로 만든 개인용 GitHub 대시보드 - 내가 열어둔 PR·리뷰 요청·멘션 모아보기*

QA는 아래 순서로 진행했습니다.

1. PR 문서를 읽고 설계가 파악 안 되는 부분 질문
2. 코드베이스 패키지 구조가 팀이 합의한 아키텍처대로 구현됐는지 확인
3. 다른 서비스 영역의 코드가 섞이지 않았는지 확인(실제로 조정한 사례가 있었음)
4. 코드가 길면 IntelliJ에서 브랜치를 열어 메서드를 따라가며 파악
5. 트랜잭션 분리가 필요한 지점을 제안
6. 의도를 드러내는 클래스·메서드 명명을 제안
7. 머지 후에는 스웨거로 실제 동작을 확인하도록 요청
8. 개발서버에 직접 들어가 버그를 확인하고, 발견하면 프론트 또는 백엔드에 버그·리팩터 이슈를 생성

![팀 발표자료 - 로컬 테스트 → Swagger 스펙 검증 → 프론트 배포 → 개발서버 E2E 순으로 진행한 4단계 검증 프로세스. 위 QA 절차의 7·8번(스웨거 확인, 개발서버 확인)이 이 프로세스의 일부로 진행됨](../../assets/portfolio/prompthub/pr-review-and-qa/team-test-process-slide.png)
*팀 검증 프로세스 - 로컬 테스트 → Swagger 검증 → 프론트 배포 → 개발서버 E2E*

**운영 및 회고**

리뷰어 1명 구조는 병목이 될 수밖에 없었고, 실제로 팀원들이 리뷰를 기다린 적이 있습니다.

프로젝트 착수 시점에 이미 정해둔 우선순위 기준으로 급한 것부터 리뷰한다고 안내했습니다.  
다음 작업을 위해 승인이 급한 팀원에게는, 새 브랜치(워크트리)를 파서 먼저 진행하거나 나중에 리베이스해서 머지하는 방법을 제안했습니다.

개인 기능 구현량은 줄었지만, 그만큼 팀 전체 코드를 리뷰 관점에서 파악하게 됐다는 게 이 트레이드오프의 다른 쪽입니다.  
정해진 기한 안에서 무엇을 남기고 무엇을 포기할지 먼저 판단한다는 원칙을, 이번엔 "내 기능 구현"을 포기하는 쪽으로 적용한 사례였습니다.
