---
title: "Project Overview"
company: "AI Agent Marketplace"
period: "2026.06 - 2026.07 (2 months)"
role: "Role: PO - Led service planning, led architecture design"
techStack:
  [
    "Spring Boot",
    "Spring Cloud",
    "Spring Batch",
    "Spring Data JPA",
    "PostgreSQL",
    "Redis",
    "JWT (RS256)",
    "OAuth",
    "Spring AI",
    "gRPC",
    "REST API",
    "Kafka",
    "Docker",
    "k8s",
    "ELK",
    "MSA",
  ]
order: 0
type: "project"
summary:
  [
    "Led service planning and architecture design as team leader and PO on a 5-person backend MSA team project",
    "Technical implementation details—authentication/authorization, content plagiarism detection, inter-service communication boundaries—are recorded separately in each sub-document",
  ]
---
## Overview

![AI Agent Marketplace project mascot](../../../assets/portfolio/prompthub/overview/mascot.png)
*Service mascot, Promi*

AI Agent Marketplace is an MSA team project consisting of 8 services—admin, ai, notification, order, payment, product, user, and settlement—plus an API Gateway. Four team members each implemented their own domain service, while I served as team leader and PO, responsible for service planning and overall architecture design. This page summarizes the overall structure and tech stack of the project; individual decisions and troubleshooting are recorded separately in the [related documents](#related-documents) below.

## System Architecture

![AWS-based infrastructure architecture - Kubernetes cluster (Control Plane/Work Node), Spring Cloud Gateway/Eureka/Config, 8 Spring Boot microservices, Kafka, PostgreSQL/Redis/Elasticsearch, GitHub Actions CI/CD, Observability (fluentbit/Logstash/Elasticsearch/Kibana)](../../../assets/portfolio/prompthub/overview/architecture.png)
*AWS-based infrastructure architecture - k8s cluster, 8 microservices, Kafka, Observability stack*

The Gateway is stateless and handles only signature verification and routing; authentication/authorization decisions are handled exclusively by user-service.
When a single screen needs data from multiple services, the frontend calls and combines each service's public REST API directly.
When a product is registered, a Kafka event requests automated LLM review from ai-service.
settlement-service is not called directly by clients but runs as a batch job triggered by a cron scheduler, pulling settlement source lines from order-service via internal gRPC.

## Tech Stack

- **Backend**: Spring Boot, Spring Cloud Gateway, MSA
- **Auth/Security**: JWT (RS256), OAuth
- **Data**: PostgreSQL, Redis
- **AI/Messaging**: Spring AI, Kafka
- **Inter-service Communication**: gRPC, REST API
- **Monitoring**: Elasticsearch, Kibana

## API Documentation

[Swagger UI (product-service)](http://13.209.136.116/swagger-ui/index.html?urls.primaryName=product-service)

settlement-service has no REST API—it's a batch server that runs via cron job—so it does not appear in the Swagger list.

![Swagger UI - product-service API list, with a dropdown at the top to switch between per-service definitions (admin/ai/notification/order/payment/product/user-service)](../../../assets/portfolio/prompthub/overview/swagger-product-service.png)
*Swagger UI - product-service API list*

## Monitoring

Kibana is used to track gateway access logs, payment audit logs, and per-service request trends.

![gateway-access-log, payment audit log, and per-service request trends viewed in Kibana](../../../assets/portfolio/prompthub/overview/monitoring-logs.png)
*Kibana - gateway access logs, payment audit logs, per-service request trends*

![Kibana dashboard - total request count, response count by status code, gateway response time p50/p95/p99 percentiles](../../../assets/portfolio/prompthub/overview/monitoring-dashboard.png)
*Kibana dashboard - request count, response count by status code, response time p50/p95/p99*

## Github Repository

- [Backend](https://github.com/prgrms-be-adv-devcourse/beadv6_6_3JMT_BE)
- [Frontend](https://github.com/prgrms-be-adv-devcourse/beadv6_6_3JMT_FE)

## Related Documents

- [Authentication/Authorization Architecture - Canceling auth-service separation and centralizing forward-auth](/portfolio/prompthub-auth-gateway)
- [Near-duplicate Product Content Detection](/portfolio/prompthub-content-duplicate-detection)
- [Redefining Inter-service Communication Boundaries](/portfolio/prompthub-service-boundary)
- [Kakao Login Self-reported Authentication Flaw](/portfolio/prompthub-oauth-vulnerability)
- [Feature/Issue Management System](/portfolio/prompthub-issue-management)
- [220 PR Reviews + Parallel QA](/portfolio/prompthub-pr-review-and-qa)
