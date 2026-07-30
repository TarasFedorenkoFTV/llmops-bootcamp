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

Джерела діаграм (mermaid, рендеряться на GitHub): [docs/architecture.md](docs/architecture.md) · [docs/request-flow.md](docs/request-flow.md) · [docs/student-load.md](docs/student-load.md).

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

- `docs/` — архітектура, request flow, тижневі outcomes, failure scenarios
- `starter/` — те, що клонує студент: каркас, mock provider, базові конфіги

## Мінімальний стек для запуску

LiteLLM + Postgres + сервіс + mock, зібрані через `docker compose up`.
Redis, дашборди й реальний ключ провайдера — опційно.

## Статус

Draft для strategy sync. Reference solution ще не додано — окрема private-гілка після узгодження власника репозиторію.
