// ─────────────────────────────────────────────────────────────────────────────
// LLMOps capstone — СЕРВІС = CONTROL PLANE.
//
// Це «мозок» системи. Тут студент реалізує routing, fallback, cost, cache,
// guardrails і HITL. LiteLLM (gateway) лише ВИКОНУЄ виклик до обраної моделі —
// рішення (яку модель, коли fallback, скільки коштує) приймаються ТУТ.
//
// Місця для дороблення позначені `TODO(student, W#)` — номер тижня курсу.
//
// Перемикання mock ↔ реальний провайдер — через змінну оточення MODEL:
//   MODEL=mock         за замовчуванням: безкоштовно, без ключа
//   MODEL=gpt-4o-mini  реальна модель: потрібен OPENAI_API_KEY у gateway/.env
// (див. GETTING_STARTED.md → «Перемикання на реальний ключ»)
// ─────────────────────────────────────────────────────────────────────────────

using System.Text;
using System.Text.Json;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpClient();
var app = builder.Build();

// Конфіг береться з оточення (задається в docker-compose.yml).
var gateway = Environment.GetEnvironmentVariable("GATEWAY_URL") ?? "http://gateway:4000";
var dbConn = Environment.GetEnvironmentVariable("DB_CONN")
    ?? "Host=postgres;Database=llmops;Username=llmops;Password=llmops";
var defaultModel = Environment.GetEnvironmentVariable("MODEL") ?? "mock";

// POST /chat — головний вхід. Кожне повідомлення проходить весь control-plane-конвеєр.
app.MapPost("/chat", async (ChatIn body, IHttpClientFactory httpFactory) =>
{
    var requestId = Guid.NewGuid();
    var startedAt = DateTimeOffset.UtcNow;

    // ── W4 · GUARDRAILS (вхід) ─────────────────────────────────────────────
    // TODO(student, W4): перевірити вхід на PII / prompt injection ДО виклику моделі;
    // за потреби — відмовити або замаскувати.

    // ── W2 · ROUTING ───────────────────────────────────────────────────────
    // TODO(student, W2): обрати модель за задачею (проста FAQ → дешева,
    // ескалація → сильніша). Поки — одна модель зі змінної MODEL.
    var model = defaultModel;

    // ── W1 · PROMPT REGISTRY ───────────────────────────────────────────────
    // TODO(student, W1/W2): брати активний system-промпт із таблиці `prompts`,
    // а не хардкодом. Версію писати в лог (`prompt_version`).
    var systemPrompt = "You are a support assistant.";

    // ── W3 · CACHE ─────────────────────────────────────────────────────────
    // TODO(student, W3): перевірити кеш (Redis) до виклику; при попаданні —
    // повернути відповідь звідти й не ходити в модель.

    // ── Виклик моделі через gateway (LiteLLM) ──────────────────────────────
    // ── W4 · FALLBACK ──────────────────────────────────────────────────────
    // TODO(student, W4): при 429/5xx повторити на наступному провайдері
    // (retry-бюджет + circuit breaker + graceful degradation).
    var payload = JsonSerializer.Serialize(new
    {
        model,
        messages = new object[]
        {
            new { role = "system", content = systemPrompt },
            new { role = "user", content = body.Message }
        }
    });

    var http = httpFactory.CreateClient();
    var response = await http.PostAsync(
        $"{gateway}/v1/chat/completions",
        new StringContent(payload, Encoding.UTF8, "application/json"));
    var rawJson = await response.Content.ReadAsStringAsync();

    var answer = "";
    string? toolCall = null;
    int promptTokens = 0, completionTokens = 0;
    try
    {
        using var doc = JsonDocument.Parse(rawJson);
        var message = doc.RootElement.GetProperty("choices")[0].GetProperty("message");
        answer = message.GetProperty("content").GetString() ?? "";

        // ── W3/W4 · TOOLS + HITL ───────────────────────────────────────────
        // TODO(student, W3/W4): якщо модель повернула tool_calls — виконати інструмент.
        // Перед НЕЗВОРОТНОЮ дією (create_ticket тощо) вимагати human approval
        // (покласти в чергу /approvals і виконати лише після підтвердження).
        if (message.TryGetProperty("tool_calls", out var tools)
            && tools.ValueKind == JsonValueKind.Array && tools.GetArrayLength() > 0)
        {
            toolCall = tools[0].GetProperty("function").GetProperty("name").GetString();
        }

        var usage = doc.RootElement.GetProperty("usage");
        promptTokens = usage.GetProperty("prompt_tokens").GetInt32();
        completionTokens = usage.GetProperty("completion_tokens").GetInt32();
    }
    catch
    {
        // Модель/gateway недоступні або віддали не те. TODO(student, W4): тут місце
        // для graceful degradation замість голої заглушки.
        answer = "Сервіс тимчасово недоступний.";
    }

    var latencyMs = (int)(DateTimeOffset.UtcNow - startedAt).TotalMilliseconds;

    // ── W2 · COST ──────────────────────────────────────────────────────────
    // TODO(student, W2): порахувати вартість (tokens × ціна моделі) і записати в cost_usd.
    decimal? costUsd = null;

    // ── W1 · OBSERVABILITY (лог кожного запиту) ────────────────────────────
    await LogRequest(dbConn, requestId, model, latencyMs, promptTokens, completionTokens, costUsd, (int)response.StatusCode);

    return Results.Json(new { request_id = requestId, content = answer, tool = toolCall, latency_ms = latencyMs });
});

// ─── API-контракт для готової Angular-консолі ────────────────────────────────
// Консоль лише ЧИТАЄ ці ендпоінти. Поверни очікувану форму — і плитки/картки оживуть.
// Форми описані в коментарях; поки віддаємо заглушки.

// Ліфнес сервісу (використовує docker healthcheck / CI). Не для консолі.
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

// TODO(student, W5): { p95_ms, requests, cache_hit_pct, error_rate_pct, fallback_events }
app.MapGet("/observability", () => Results.Json(new { todo = "aggregate from requests table" }));

// TODO(student, W2/W5): { today_usd, budget_usd }
app.MapGet("/cost", () => Results.Json(new { todo = "SUM(cost_usd) for today + budget" }));

// TODO(student, W1/W2): [ { name, version, active } ]
app.MapGet("/prompts", () => Results.Json(new { todo = "list from prompts table" }));

// TODO(student, W7): { providers: [ { name, status } ] }
app.MapGet("/providers", () => Results.Json(new { todo = "provider health" }));

// TODO(student, W4): { pending: [ { id, action } ] }
app.MapGet("/approvals", () => Results.Json(new { todo = "pending HITL approvals" }));

app.Run("http://0.0.0.0:8080");

// Пише один рядок у таблицю `requests`. Це основа W1 (observability) і W2 (cost).
// Збій логування НЕ має валити запит користувача.
static async Task LogRequest(string conn, Guid id, string model, int latency,
    int promptTokens, int completionTokens, decimal? cost, int status)
{
    try
    {
        await using var db = new NpgsqlConnection(conn);
        await db.OpenAsync();
        await using var cmd = new NpgsqlCommand(
            "INSERT INTO requests (request_id, model, latency_ms, prompt_tokens, completion_tokens, cost_usd, status) "
            + "VALUES (@id, @model, @lat, @pt, @ct, @cost, @status)", db);
        cmd.Parameters.AddWithValue("id", id);
        cmd.Parameters.AddWithValue("model", model);
        cmd.Parameters.AddWithValue("lat", latency);
        cmd.Parameters.AddWithValue("pt", promptTokens);
        cmd.Parameters.AddWithValue("ct", completionTokens);
        cmd.Parameters.AddWithValue("cost", (object?)cost ?? DBNull.Value);
        cmd.Parameters.AddWithValue("status", status.ToString());
        await cmd.ExecuteNonQueryAsync();
    }
    catch { /* starter: не валимо запит через збій логування */ }
}

// Вхідне тіло POST /chat.
record ChatIn(string Message);
