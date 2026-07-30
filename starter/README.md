# Starter repository

Те, що студент клонує на першому занятті й дороблює до capstone.

## Що дається готовим, що добудовує студент

| Компонент | Дається готовим | Студент добудовує |
|---|---|---|
| UI (Angular) | готові в'юхи: Chat + Console/Observability | не змінює |
| App service (.NET) | skeleton | control plane: routing, fallback, cost, policies |
| Observability API (.NET) | skeleton | агрегати з Postgres (traces, p95, cost, error-taxonomy) у Console-в'юху |
| Gateway (LiteLLM) | базовий конфіг | моделі/провайдери, порядок fallback |
| Mock provider | готовий | використовує для тестів і failure-сценаріїв |
| Postgres | базова схема | розширює під logs / cost / prompt records |
| Eval runner (Python) | skeleton | dataset, graders, пороги |
| CI (GitHub Actions) | шаблон `.github/workflows/eval-gate.yml` | eval gate |
| Redis / дашборди | опційний шаблон | advanced extension |

## Запуск (мінімальний стек)

```sh
cp gateway/.env.example gateway/.env   # ключі провайдерів (для mock не потрібні)
docker compose up
```

Піднімаються: сервіс, LiteLLM, Postgres, mock provider. Redis і дашборди — опційні (профілі compose).

## Власник репозиторію

Визначається на strategy sync. До того — draft.
