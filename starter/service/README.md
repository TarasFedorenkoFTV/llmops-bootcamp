# App service (.NET) — skeleton

Дається .NET-skeleton із HTTP-ендпоінтом `/chat` і підключенням до gateway та Postgres.
Це control plane — тут студент реалізує:

- **routing** — яку модель обрати під задачу (faq / escalation);
- **fallback** — порядок провайдерів при 429 / збої;
- **cost** — облік tokens і вартості на запит, budget-alert;
- **tool-хендлери** — lookup_order, create_ticket, з human approval перед незворотною дією;
- **guardrails** — PII, prompt injection, policy logs;
- **обзервабіліті** — розділ поверх логів у Postgres.

LiteLLM викликається лише для самого запиту до обраної моделі.

TODO: додати .NET skeleton (Program.cs, Dockerfile) до першого заняття.
