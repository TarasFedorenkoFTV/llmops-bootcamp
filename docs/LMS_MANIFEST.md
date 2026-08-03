# LMS-маніфест курсу: комплект кожного заняття

Робочий чек автора для публікації занять у LMS: що входить у заняття N,
звідки це брати і в якому воно статусі. Канонічна назва заняття = `<title>`
лонг-ріда. Статуси відео/дати заповнюй по ходу запису; правило rolling-буфера —
готові відео мінімум на **2 заняття вперед** від дати публікації.

| # | Тиждень | Канонічна назва | HTML (LMS-матеріал) | Конспект | Бранч еталона (лаба) | ДЗ у складі заняття | Відео | Зміст | Відео-статус | Дата публікації |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | W1 | LLMOps і архітектура production LLM-системи | docs/longreads/L01.html | docs/lessons/L01.md | starter | прев'ю hw1 | T01 + Lab01 | ✅ готово | — | |
| 2 | W1 | Prompt lifecycle: промпт як production-артефакт | docs/longreads/L02.html | docs/lessons/L02.md | w1 | hw1 (повний) | T02 + Lab02 | ✅ готово | — | |
| 3 | W2 | Мультипровайдерний gateway і маршрутизація моделей | docs/longreads/L03.html | docs/lessons/L03.md | w2 | прев'ю hw2 | T03 + Lab03 | ✅ готово | — | |
| 4 | W2 | Токеноміка і cost attribution | docs/longreads/L04.html | docs/lessons/L04.md | w2 | hw2 (повний) | T04 + Lab04 | ✅ готово | — | |
| 5 | W3 | Кешування: точний кеш, метрика і semantic cache | docs/longreads/L05.html | docs/lessons/L05.md | w3 | прев'ю hw3 | T05 + Lab05 | ✅ готово | — | |
| 6 | W3 | Tool calls: коли модель починає діяти | docs/longreads/L06.html | docs/lessons/L06.md | w3 | hw3 (повний) | T06 + Lab06 | ✅ готово | — | |
| 7 | W4 | Reliability: fallback, деградація і circuit breaker | docs/longreads/L07.html | docs/lessons/L07.md | w4 | прев'ю hw4 | T07 + Lab07 | ✅ готово | — | |
| 8 | W4 | Safety, guardrails і human-in-the-loop | docs/longreads/L08.html | docs/lessons/L08.md | w4 | hw4 (повний) | T08 + Lab08 | ✅ готово | — | |
| 9 | W5 | Observability для LLM-систем | docs/longreads/L09.html | docs/lessons/L09.md | w5 | прев'ю hw5 | T09 + Lab09 | ✅ готово | — | |
| 10 | W5 | Golden dataset і eval suite | docs/longreads/L10.html | docs/lessons/L10.md | w5 | hw5 (повний) | T10 + Lab10 | ✅ готово | — | |
| 11 | W6 | CI/CD quality gates, canary і rollback | docs/longreads/L11.html | docs/lessons/L11.md | w6 | прев'ю hw6 | T11 + Lab11 | ✅ готово | — | |
| 12 | W6 | Фінал: LLMOps operating model | docs/longreads/L12.html | docs/lessons/L12.md | w6 | hw6 (повний) | T12 + Lab12 | ✅ готово | — | |

## Супровідні матеріали (публікуються один раз)

| Артефакт | Файл | Коли в LMS |
|---|---|---|
| Зміст курсу (навігація) | docs/longreads/index.html | разом із заняттям 1 |
| Pre-work: пре-реквізити | starter/PREREQUISITES.md | ДО заняття 1 (лінк у welcome-листі) |
| Setup guide | starter/GETTING_STARTED.md | ДО заняття 1 |
| ДЗ hw1–hw6 | starter/homework/ | hwN — у складі парного заняття тижня |
| Гайд ментора | docs/MENTOR_GUIDE.md | собі під руку до старту потоку (ментор = зазвичай автор) |

## Правила виробництва

- Перед записом відео уроку N: тег `video-LNN` на коміт бранча `wN`
  (розділ «Заморозка еталона» у [PRODUCTION.md](longreads/PRODUCTION.md)).
- Перед публікацією заняття в LMS: QA-чекліст публікації у
  [STYLE.md](longreads/STYLE.md).
- Передумови запису по уроках (L07/L10/L11/L12 мають підготовку) —
  у PRODUCTION.md.
- Зовнішні залежності сторінок: репозиторії `llmops-bootcamp` і
  `llmops-bootcamp-solutions` (бранчі `w1`–`w6`, demo-PR #1) мають лишатися
  публічними на весь час потоку.
