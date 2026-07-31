# Handoff: виробництво лонг-рідів L02–L12

Інструкція для сесії, що продовжує роботу. Еталон затверджено: [L01.html](L01.html).
Правила формату: [STYLE.md](STYLE.md) — прочитати повністю до старту.

## Задача

Зробити `L02.html` … `L12.html` у стилі й глибині L01 (той самий `<style>`,
~2300 слів теорії, дві доріжки, ДЗ-блок за правилами тижня).

## Джерела на кожен урок

| Урок | Конспект (зміст) | Код для розтину | ДЗ | Еталон |
|---|---|---|---|---|
| L02 | docs/lessons/L02.md | starter/db/schema.sql, service `/prompts` | hw1 (повний блок) | branch `w1` |
| L03 | docs/lessons/L03.md | gateway/litellm-config.yaml, Route() | hw2 (прев'ю) | `w2` |
| L04 | docs/lessons/L04.md | prices, cost_usd, `/cost` | hw2 (повний) | `w2` |
| L05 | docs/lessons/L05.md | cache + лічильники | hw3 (прев'ю) | `w3` |
| L06 | docs/lessons/L06.md | tool_calls, RunTool | hw3 (повний) | `w3` |
| L07 | docs/lessons/L07.md | CallGateway, fallback, CB half-open | hw4 (прев'ю) | `w4` |
| L08 | docs/lessons/L08.md | MaskPii, approvals-черга | hw4 (повний) | `w4` |
| L09 | docs/lessons/L09.md | `/observability`, `/providers` | hw5 (прев'ю) | `w5` |
| L10 | docs/lessons/L10.md | evals/run.py, golden.jsonl | hw5 (повний) | `w5` |
| L11 | docs/lessons/L11.md | .github/workflows/eval-gate.yml | hw6 (прев'ю) | `w6` |
| L12 | docs/lessons/L12.md | INCIDENT_RUNBOOK (w6), увесь стек | hw6 (повний) | `w6` |

Конспекти — це зміст і war-stories; лонг-рід — їх глибша, відео-готова форма.
Опційні теми на розкладання по уроках: docs/optional-and-mentions.md.

## Розподіл core/optional по уроках (узгоджено, не міняти)

- L03: третій маршрут/tier — опц. L04: budget-політика — опц.
- L05: TTL, semantic cache — опц. L06: розширений реєстр інструментів — опц.
- L07: **circuit breaker (з half-open) — опц.**, core = fallback + degradation.
- L08: **PII-guardrail — опц.**, core = HITL. L09: таксономія помилок — опц.
- L10: model-based grader / LLM-as-judge — опц (реальний ключ).
- L11: canary — опц. L12: `/metrics` + зовнішні дашборди — опц.

Уроки L07/L08 у конспектах ще подають CB і guardrail як частину лаби — у
лонг-рідах розкласти за списком вище (hw4 уже виправлений).

## Процес на кожен урок

1. Прочитати конспект + відповідний код (стартер і бранч еталона).
2. Написати HTML (копія `<style>` з L01; chain-стрічка → правильний W).
3. Прогнати чек-лист із STYLE.md; порахувати слова (~2300 ±15%).
4. Headless-перевірка: сторінка відкривається з диска без помилок.
5. Коміт + пуш у `main` (доступ до репо є; Co-Authored-By як у історії).

## Kickoff-промпт для нової сесії

> Прочитай `docs/longreads/STYLE.md`, `docs/longreads/HANDOFF.md` і еталон
> `docs/longreads/L01.html` у репозиторії `C:\Work\llmops-bootcamp`. Зроби
> лонг-ріди L02–L12 за handoff-таблицею: по одному, з headless-перевіркою і
> комітом після кожного. Почни з L02 і покажи його мені на затвердження тону
> перед рештою.
