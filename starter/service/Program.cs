using System.Text;
using System.Text.Json;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpClient();
var app = builder.Build();

var gateway = Environment.GetEnvironmentVariable("GATEWAY_URL") ?? "http://gateway:4000";
var dbConn = Environment.GetEnvironmentVariable("DB_CONN")
    ?? "Host=postgres;Database=llmops;Username=llmops;Password=llmops";

app.MapPost("/chat", async (ChatIn body, IHttpClientFactory httpFactory) =>
{
    var requestId = Guid.NewGuid();
    var t0 = DateTimeOffset.UtcNow;

    // TODO(student): routing — обрати модель за задачею (faq → mini, escalation → 4o).
    var model = "mock";

    // TODO(student): guardrails — перевірити вхід (PII / prompt injection) до виклику.

    // TODO(student): prompt registry — брати system-промпт із реєстру, а не хардкодом.
    var payload = JsonSerializer.Serialize(new
    {
        model,
        messages = new object[]
        {
            new { role = "system", content = "You are a support assistant." },
            new { role = "user", content = body.Message }
        }
    });

    // TODO(student): fallback — при 429/5xx повторити на наступному провайдері.
    var http = httpFactory.CreateClient();
    var res = await http.PostAsync($"{gateway}/v1/chat/completions",
        new StringContent(payload, Encoding.UTF8, "application/json"));
    var json = await res.Content.ReadAsStringAsync();

    var answer = ""; int pt = 0, ct = 0;
    try
    {
        using var doc = JsonDocument.Parse(json);
        answer = doc.RootElement.GetProperty("choices")[0].GetProperty("message")
            .GetProperty("content").GetString() ?? "";
        var usage = doc.RootElement.GetProperty("usage");
        pt = usage.GetProperty("prompt_tokens").GetInt32();
        ct = usage.GetProperty("completion_tokens").GetInt32();
    }
    catch { answer = "Сервіс тимчасово недоступний."; }

    var latency = (int)(DateTimeOffset.UtcNow - t0).TotalMilliseconds;

    // TODO(student): cost — порахувати за таблицею цін і записати cost_usd.
    decimal? cost = null;

    await Log(dbConn, requestId, model, latency, pt, ct, cost, (int)res.StatusCode);

    // TODO(student): HITL — якщо у відповіді tool_call на незворотну дію, вимагати approval.

    return Results.Json(new { request_id = requestId, content = answer, latency_ms = latency });
});

// API-контракт для готової Angular-консолі. TODO(student): реалізувати ці ендпоінти.
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapGet("/observability", () => Results.Json(new { todo = "traces, p95, cost, error-taxonomy" }));
app.MapGet("/cost", () => Results.Json(new { todo = "cost/request, cost/day, budget" }));
app.MapGet("/prompts", () => Results.Json(new { todo = "prompt versions + active" }));
app.MapGet("/approvals", () => Results.Json(new { todo = "pending approvals" }));

app.Run("http://0.0.0.0:8080");

static async Task Log(string conn, Guid id, string model, int latency, int pt, int ct, decimal? cost, int status)
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
        cmd.Parameters.AddWithValue("pt", pt);
        cmd.Parameters.AddWithValue("ct", ct);
        cmd.Parameters.AddWithValue("cost", (object?)cost ?? DBNull.Value);
        cmd.Parameters.AddWithValue("status", status.ToString());
        await cmd.ExecuteNonQueryAsync();
    }
    catch { /* starter: збій логування не має валити запит */ }
}

record ChatIn(string Message);
