# Optional і згадки на відео

Щоб не забути: усе, що за межами обовʼязкового core. Частину студент бере за бажанням,
частину лектор просто згадує на відео, частину свідомо не беремо.

## Optional у курсі (за бажанням / advanced)

Роблять ті, хто хоче глибше; на core-результат не впливає.

- semantic cache
- третій provider
- circuit breaker
- розширені guardrails / advanced red-team pack
- повний Grafana / Prometheus stack
- canary deployment
- KPI dashboard (`/metrics` + зовнішній дашборд)
- **model-based evals / LLM-as-judge** — потребує реального ключа (усе інше — на mock)

## Згадати на відео, але не будувати

Важливі production-теми, які виходять за 6 тижнів. Проговорити, що вони є, і куди рости.

- **Багатоходовий діалог + контекст** — історія, розмір вікна, cost довгого контексту
- **Streaming відповідей** — потік токенів, time-to-first-token
- **Secrets і ротація ключів**
- **Quota / rate limiting per user / per tenant**
- **RAG / vector** — це вже окремий капстоун
- **Fine-tuning**

## Свідомо поза курсом

Сказати прямо, щоб не було очікувань:

- реальний хмарний деплой, autoscaling, мультитенантність (у нас — локальний runtime + план rollout, не деплой)

## Core (для контрасту)

runnable gateway · prompt registry · routing + fallback · cost attribution ·
safe tool calls + human approval · reliability · базова observability ·
golden dataset + rule-based eval runner · CI regression gate ·
**30-day rollout plan** (обов'язковий deliverable hw6 — головний transfer-артефакт).

Усе це — на mock, без реального ключа.
