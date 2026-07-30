# Тижневі outcomes і оцінка часу

Бюджет: guided lab 1–1.5 год + домашнє до 3 год. Правило брифу: якщо deliverable
не робиться за 2–3 год після lab — спростити або перенести в optional.

Оцінка часу — моя (Тараса), потребує валідації.

| Тиждень | Deliverable | На кінець тижня студент має | Оцінка часу | Навантаження |
|---|---|---|---|---|
| W1 | Gateway scaffold, unified logging, prompt registry | піднятий стек; запит проходить через сервіс і логуються request_id/model/latency/tokens/cost; промпт версіонується | ~2.5–3 год | на межі |
| W2 | Provider normalization, routing policy, cost attribution | routing «faq→mini / escalation→4o» + fallback-порядок; cost/request з budget-alert | ~4 год | **перевантажено** |
| W3 | Tool-safety wrapper (cache — optional) | tool-виклик зі схемою, timeout, ідемпотентністю; кеш опційно | ~2 год | ок |
| W4 | Fallback, circuit breaker, human approval, basic guardrails | AI-фіча переживає падіння провайдера; незворотна дія — через approval | ~4–5 год | **перевантажено** |
| W5 | Trace schema, golden dataset, eval runner | повторюване оцінювання output проти golden dataset із порогами | ~3.5 год | важко |
| W6 | CI eval gate, incident demo, фінальний repo | CI блокує regression; демо інциденту з fallback | ~2.5–3 год | ок |

## Рекомендації по перевантажених тижнях

- **W2** — normalization уже дає LiteLLM-адаптер, тож у core лишити **routing + cost**; глибша normalization — optional.
- **W4** (найважчий) — у core лишити **fallback + human approval**; circuit breaker і розширені guardrails — optional або наступний тиждень.
- **W5** — у core лишити **eval runner + мінімальний golden dataset**; повна trace schema — спрощено.

Мета: кожен тиждень має один чіткий core-deliverable ≤3 год, решта в optional.
