# Тижневі outcomes і оцінка часу

Бюджет на **студента** (бриф §7): матеріали + відео ≤2 год, guided lab 1–1.5 год,
домашнє ≤3 год. Правило: якщо deliverable не робиться за 2–3 год після lab —
спростити або перенести в optional. Час нижче — це домашня частина **після** lab.

## Розкладка по тижнях

| Тиждень | Під-задача | Час, год | Ядро / опц |
|---|---|---|---|
| **W1** | scaffold + перший запит service → LiteLLM → mock | 0.5 | core |
| | unified logging (id/model/latency/tokens/cost → Postgres) | 1.0 | core |
| | prompt registry (версія + promote/rollback + у лог) | 1.0–1.5 | core |
| | **разом** | **~2.5–3** | на межі |
| **W2** | routing (модель за задачею, конфіг) | 1.5 | core |
| | cost attribution (+ фіксація fallback-порядку) | 1.5 | core |
| | budget-alert / деградація за бюджетом | 0.5 | optional |
| | provider normalization (легко, дає LiteLLM) | 0.5 | core |
| | **разом (core)** | **~3** | ок після трима |
| **W3** | cache відповідей + лічильники hit/miss | 1.0 | core |
| | tool-виклик (read-only) + рішення timeout/idempotency у PR | 1.0–1.5 | core |
| | TTL / semantic cache / реалізація timeout | — | optional |
| | **разом** | **~2–2.5** | ок |
| **W4** | fallback chain (429 / 5xx → наступний провайдер) | 1.5 | core |
| | human approval перед незворотною дією | 1.0 | core |
| | circuit breaker | 1.0 | optional |
| | guardrails (PII / injection) | 1.5 | optional |
| | **разом (core)** | **~2.5** | ок після трима |
| **W5** | observability-ендпоінти (/observability, /providers) | 1.0 | core |
| | розширення golden dataset (+4 кейси) + поріг | 1.0 | core |
| | таксономія помилок / LLM-as-judge | — | optional |
| | **разом (core)** | **~2.5–3** | ок після трима |
| **W6** | CI eval gate (run.py у GitHub Actions, блок за порогом) | 1.0 | core |
| | incident demo (outage → fallback → recovery) | 1.0 | core |
| | фінальне впорядкування repo / README | 0.5–1 | core |
| | **разом** | **~2.5–3** | ок |

## На кінець тижня студент має

- **W1** — піднятий стек; запит проходить через сервіс, логуються id/model/latency/tokens/cost; промпт версіонується.
- **W2** — routing «faq → mock-mini / escalation → mock-strong» + зафіксований fallback-порядок; cost/request і бюджет на консолі (алерт — опційно).
- **W3** — кеш із лічильниками; tool-виклик виконується, timeout/ключ ідемпотентності зафіксовані як рішення.
- **W4** — AI-фіча переживає падіння провайдера; незворотна дія — через human approval.
- **W5** — жива консоль (усі плитки) + повторюване оцінювання проти розширеного golden dataset.
- **W6** — CI блокує regression; демо інциденту з fallback; зібраний фінальний repo.

## Тримінг перевантажених тижнів

Без тримів W2, W4, W5 перевищують 3 год. Тримаємо їх у бюджеті так:

- **W2** — provider normalization майже повністю дає LiteLLM-адаптер; core = routing + cost; budget-політика — optional.
- **W3** — реалізація timeout та ідемпотентності — optional; core фіксує ці рішення текстом у PR.
- **W4** (найважчий) — core = fallback + human approval; circuit breaker і PII-guardrail — optional.
- **W5** — core = observability-ендпоінти + розширення готового runner-а кейсами; таксономія і judge — optional.

Мета: кожен тиждень — один чіткий core-deliverable ≤3 год, решта в optional.
Розподіл навантаження студента: [student-load.md](student-load.md).
