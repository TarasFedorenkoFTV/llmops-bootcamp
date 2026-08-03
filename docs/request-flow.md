# Мінімальний request flow

```mermaid
sequenceDiagram
  actor U as Користувач
  participant UI as Chat UI (Angular)
  participant S as Service (.NET) · control plane
  participant GW as LiteLLM (adapter)
  participant P as Provider / mock
  participant DB as Postgres

  U->>UI: повідомлення
  UI->>S: POST /chat
  S->>S: routing (faq → mock-mini / escalation → mock-strong)
  S->>GW: виклик обраної моделі
  GW->>P: provider call
  P-->>GW: відповідь + usage
  GW-->>S: нормалізована відповідь
  S->>DB: лог (request_id, model, latency, tokens, cost)
  S-->>UI: відповідь
  Note over S,P: при 429 / збої — fallback на наступного провайдера
```

Крок за кроком (мінімальний сценарій із брифу):

1. Користувач надсилає повідомлення.
2. Запит проходить через сервіс (control plane).
3. Сервіс обирає provider / model і викликає його через LiteLLM.
4. Логуються latency, tokens, cost.
5. При падінні провайдера спрацьовує fallback.
6. Tool-call перед незворотною дією потребує human approval.
7. Eval runner перевіряє якість.
8. CI блокує regression.
