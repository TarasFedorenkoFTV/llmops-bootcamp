# LLMOps Engineering Bootcamp — capstone & starter

Матеріали наскрізного capstone-проєкту курсу: **support / helpdesk bot з LLM control plane**.
Студент отримує готовий каркас і добудовує control plane до production-рівня.

## Огляд

**Як виглядатиме застосунок**

![Макет капстоуна](docs/capstone-mockup.png)

**Архітектура**

![Архітектура](docs/architecture.png)

**Request flow**

![Request flow](docs/request-flow.png)

**Навантаження студента (на тиждень)**

![Навантаження студента](docs/student-load.png)

**Контрол-плейн: хто що пише**

![Контрол-плейн](docs/control-plane.png)

Джерела діаграм (mermaid, рендеряться на GitHub): [architecture](docs/architecture.md) · [request-flow](docs/request-flow.md) · [навантаження студента](docs/weekly-outcomes.md) · [control-plane](docs/control-plane.md).

## Стек

| Шар | Технологія |
|---|---|
| UI (чат) | Angular — тонкий, дається готовим |
| Сервіс | C# / .NET — control plane (routing, fallback, cost, policies) |
| Gateway | LiteLLM — провайдер-адаптер (єдиний виклик + нормалізація) |
| Evals | Python |
| Сховище / кеш | Postgres + Redis |
| CI | GitHub Actions — eval gate |
| Рантайм | Docker Compose (локально) |

LiteLLM виступає провайдер-адаптером: єдиний виклик до моделей і нормалізація провайдерів.
Routing, fallback, cost і policies студент пише в сервісі.

## Структура

- `docs/longreads/` — **навчальні матеріали 12 занять** (self-contained HTML) + [зміст курсу](docs/longreads/index.html) — єдине джерело правди про зміст занять
- `docs/` — [гайд ментора](docs/MENTOR_GUIDE.md), [маніфест занять](docs/COURSE_MANIFEST.md), архітектура, request flow, тижневі outcomes, [optional і згадки](docs/optional-and-mentions.md)
- `starter/` — те, що клонує студент: каркас, mock provider, конфіги, [пре-реквізити](starter/PREREQUISITES.md), [ДЗ по тижнях](starter/homework/README.md)

## Мінімальний стек для запуску

LiteLLM + Postgres + сервіс + mock, зібрані через `docker compose up`.
Redis, дашборди й реальний ключ провайдера — опційно.

## Статус

Контент курсу готовий: 12 лонг-рідів (база знань студента), ДЗ hw1–hw6 з критеріями,
пре-реквізити і setup guide, CI-гейт у шаблоні. Еталонні рішення — окремий
репозиторій [llmops-bootcamp-solutions](https://github.com/TarasFedorenkoFTV/llmops-bootcamp-solutions),
бранчі `w1`…`w6` (тиждень = бранч); студентам відкриті — політика «спершу
власна спроба, потім звірка».
