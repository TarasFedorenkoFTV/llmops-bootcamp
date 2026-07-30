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
| | cost attribution + budget-alert | 1.5 | core |
| | provider normalization (легко, дає LiteLLM) | 0.5 | core |
| | **разом (core)** | **~3** | ок після трима |
| **W3** | tool-safety wrapper (schema / timeout / retry / idempotency) | 2.0 | core |
| | cache | — | optional |
| | **разом** | **~2** | ок |
| **W4** | fallback chain (429 / 5xx → наступний провайдер) | 1.5 | core |
| | human approval перед незворотною дією | 1.0 | core |
| | circuit breaker | 1.0 | optional |
| | guardrails (PII / injection) | 1.5 | optional |
| | **разом (core)** | **~2.5** | ок після трима |
| **W5** | eval runner (dataset → gateway → grader → поріг) | 2.0 | core |
| | golden dataset (10–15 кейсів) | 0.5–1 | core |
| | trace schema (спрощено) | 1.0 | core |
| | **разом (core)** | **~2.5–3** | ок після трима |
| **W6** | CI eval gate (run.py у GitHub Actions, блок за порогом) | 1.0 | core |
| | incident demo (outage → fallback → recovery) | 1.0 | core |
| | фінальне впорядкування repo / README | 0.5–1 | core |
| | **разом** | **~2.5–3** | ок |

## На кінець тижня студент має

- **W1** — піднятий стек; запит проходить через сервіс, логуються id/model/latency/tokens/cost; промпт версіонується.
- **W2** — routing «faq → mini / escalation → 4o» + fallback-порядок; cost/request з budget-alert.
- **W3** — tool-виклик зі схемою, timeout, ідемпотентністю.
- **W4** — AI-фіча переживає падіння провайдера; незворотна дія — через human approval.
- **W5** — повторюване оцінювання output проти golden dataset із порогами.
- **W6** — CI блокує regression; демо інциденту з fallback; зібраний фінальний repo.

## Тримінг перевантажених тижнів

Без тримів W2, W4, W5 перевищують 3 год. Тримаємо їх у бюджеті так:

- **W2** — provider normalization майже повністю дає LiteLLM-адаптер, тож лишається легкою; core = routing + cost.
- **W4** (найважчий) — core = fallback + human approval; circuit breaker і розширені guardrails — optional.
- **W5** — core = eval runner + мінімальний golden dataset; повна trace schema — спрощена.

Мета: кожен тиждень — один чіткий core-deliverable ≤3 год, решта в optional.
Розподіл навантаження студента: [student-load.md](student-load.md).
