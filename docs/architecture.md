# Архітектура capstone

Support / helpdesk bot з LLM control plane. Control plane (routing, fallback, cost, policies)
живе в .NET-сервісі; LiteLLM виступає провайдер-адаптером.

```mermaid
flowchart LR
  U[Користувач] --> UI[Chat UI · Angular]
  UI --> SVC[App service · .NET<br/>control plane]
  SVC -->|обраний виклик| GW[LiteLLM<br/>провайдер-адаптер]
  GW --> P1[OpenAI]
  GW --> P2[Azure]
  GW --> MOCK[Mock provider]
  SVC --> PG[(Postgres<br/>logs · prompts · cost)]
  SVC --> RED[(Redis · cache)]
  SVC -. дані .-> OBS[Обзервабіліті<br/>розділ у продукті]
  EV[Eval runner · Python] --> PG
  CI[GitLab CI<br/>eval gate] --> EV
```

## Хто що робить

- **UI (Angular)** — тонкий фасад, дається готовим, студент не змінює.
- **Сервіс (.NET)** — мозок: routing (яку модель обрати), fallback, cost-облік, guardrails, HITL-approval, розділ обзервабіліті.
- **LiteLLM** — єдиний виклик до будь-якого провайдера + нормалізація відмінностей. Логіки рішень не тримає.
- **Postgres** — логи запитів (`request_id`, model, latency, tokens, cost, prompt_version), prompt registry, cost records.
- **Redis** — кеш (опційно, з уроку про caching).
- **Eval runner (Python)** — golden dataset, graders, пороги.
- **GitLab CI** — eval gate, блокує regression.
