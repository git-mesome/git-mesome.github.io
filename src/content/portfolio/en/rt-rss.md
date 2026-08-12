---
title: "Reactive Streaming Preloading Architecture for Industrial IoT (RT-RSS)"
company: "Graduate Research"
period: "2023.09 - 2025.08 (graduate research; paper published 2025.09)"
role: "Research Design and Implementation"
techStack: ["Reactive Streams", "SSE", "Webflux", "MQTT", "CQRS", "PostgreSQL", "Redis", "localStorage"]
order: 1
type: "project"
summary:
  [
    "Reduced HTTP requests from 6 to 1 for repeated range queries, improving average response time by 75.7% (32.408ms to 7.875ms)",
    "Verified 0% loss rate and 0 connection drops across all 5 load conditions in a streaming stability experiment",
  ]
---

## Background

This is an industrial environment where IoT devices continuously publish time-series data every second. The existing thread-per-request synchronous architecture kept a blocking thread per request, so a surge of concurrent requests caused a sharp rise in thread count and heavier context-switching overhead. There was also a structural limitation: without flow control, situations where production speed exceeded consumption speed could lead to data loss or system overload.

![RT-RSS overall architecture diagram - IoT Devices (BMS 1~n) send time-series data to the MQTT Broker via MQTT/MQTTS, which passes through the Real-time Data Processing Component (Data Collection Layer → Anomaly Detection Layer → Data Management Layer's Notification/Query/Persistence Model) and is delivered to the Dashboard via REST API/SSE, with the Cache/Store persisting to the Database (Query: In-Memory Caching + Disk-based storage, Command: Disk-based storage)](../../../assets/portfolio/rt-rss/architecture.png)
*RT-RSS overall architecture - data flow from IoT devices to the dashboard*

## Results

- Reduced HTTP requests from 6 to 1 for repeated range queries (period changes, re-exploration), improving average response time by 75.7% (32.408ms to 7.875ms)
- Verified 0% loss rate and 0 connection drops across all 5 load conditions (1 user for 1min/5min, 100 users for 1min/5min, 10 users for 1 hour) in a streaming stability experiment (under the same conditions, the synchronous approach showed 0.033% loss at 100 users/5min and 0.056% loss at 10 users/1 hour)

## Design and Implementation

**Alternatives comparison - real-time transmission methods**

- Long Polling - simple to implement, but re-establishing the connection on every request increases server load and latency
- WebSocket - low latency with bidirectional communication, but requires an HTTP Upgrade, which can cause compatibility issues in proxy/firewall environments
- SSE - uses plain HTTP, offering high infrastructure compatibility, with automatic reconnection and message-order guarantees built in as standard features, though it only supports one-way communication

Since the dashboard only needs one-way server-to-client push, I judged that WebSocket's bidirectionality was unnecessary and adopted SSE. For the I/O model, I compared thread-per-request (simple, but leads to a surge in threads) against an event-loop-based non-blocking model (scales with fewer threads, but can introduce latency when the event queue backs up), and chose the latter. I used Reactive Streams' backpressure to explicitly control the mismatch in processing speed between producer and consumer.

**Decisions and trade-offs**

- SSE only supports one-way communication, so a redesign would be required if client-to-server control were ever needed, and I accepted the scalability constraint that HTTP/1.1 limits the number of concurrent connections.
- With CQRS, I separated writes (Command Store, PostgreSQL) from reads (Query Store, split between a Redis cache and PostgreSQL disk storage). Small, frequently queried data is routed to the cache, while data requiring large-scale queries, such as an entire given period, is routed to disk.
- The cache retains only the most recent 5 minutes. Since sensor data arrives every second, 5 minutes accumulates 300 observations, which I judged sufficient to identify short-term patterns such as fluctuation trends or anomaly signs during the initial visualization stage.
- Anomaly detection was designed to be rule-based. The rule set was built on three grounds: domain expert experience, quantitative criteria from industry standards/regulations, and statistical patterns from historical operational data. This keeps computation simple and suitable for real-time streaming, and makes the reasoning behind each judgment easy to trace, but it has the limitation of not catching complex patterns.
- Preloading was designed with two strategies: recent-data-first (reflecting the UX characteristic that users view the latest information first) and anomaly-detection-based priority (reordering the surrounding time range as top priority, since data around the point an anomaly occurred is needed first for root-cause analysis).

![Data Management Layer module composition and data flow diagram - data passed from the Data Collection Layer is classified as normal/abnormal by the Anomaly Detection Layer; abnormal data is pushed to the dashboard via SSE by the Notification Model. The full stream and abnormal data are written to the Command Store (Disk-based Storage) by the Persistence Model, while the Query Model reads preloaded time-series data from the Query Store (In-Memory Caching + Disk-based Storage)](../../../assets/portfolio/rt-rss/realtime-processing.png)
*Module composition and data flow of the real-time data processing layer*

Initial connection response times were nearly identical between the two architectures (12.78ms vs 12.46ms), and the gap only appeared during interactive sessions of repeated queries while changing filters or periods, so I treated that interaction segment as the core of perceived responsiveness. Since industrial IoT is a domain where data loss directly translates into anomaly-detection failure, I treated zero-loss as the key metric rather than average speed.

**Failure-handling design**

At the MQTT broker layer, I stabilized the device-broker connection through message queue management, connection keep-alive, and reconnection handling. On a cache miss, the system falls back asynchronously to the disk-based Query Store, and if a range that hasn't been preloaded yet is requested, it waits until streaming completes before processing, preventing immediate failure. Thanks to SSE's standard automatic reconnection and message-order guarantee, the connection recovers from the last received point even after a temporary disconnection.
