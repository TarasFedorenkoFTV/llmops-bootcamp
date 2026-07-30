using System.Text.Json;

var app = WebApplication.CreateBuilder(args).Build();

// OpenAI-сумісний фейковий провайдер.
// Дві можливості: інжекція збоїв і залежність виходу від system-промпта (для eval-регресії).
app.MapPost("/v1/chat/completions", async (HttpRequest req) =>
{
    using var doc = await JsonDocument.ParseAsync(req.Body);
    var root = doc.RootElement;
    var model = root.TryGetProperty("model", out var m) ? m.GetString() ?? "mock" : "mock";

    string user = "", system = "";
    foreach (var msg in root.GetProperty("messages").EnumerateArray())
    {
        var role = msg.GetProperty("role").GetString();
        var content = msg.GetProperty("content").GetString() ?? "";
        if (role == "user") user = content;
        else if (role == "system") system = content;
    }

    // Інжекція збоїв: query (?fail=503&delay=2000&garbage=1) або маркери в повідомленні
    // (маркери проходять і крізь gateway).
    int? fail = null; int delay = 0; bool garbage = false;
    var q = req.Query;
    if (q.TryGetValue("fail", out var fq) && int.TryParse(fq, out var fc)) fail = fc;
    if (q.TryGetValue("delay", out var dq) && int.TryParse(dq, out var dm)) delay = dm;
    if (q.ContainsKey("garbage")) garbage = true;
    if (user.Contains("__fail_503")) fail = 503;
    if (user.Contains("__fail_429")) fail = 429;
    if (user.Contains("__delay")) delay = 2000;
    if (user.Contains("__garbage")) garbage = true;

    if (fail is int code) return Results.StatusCode(code);
    if (delay > 0) await Task.Delay(delay);

    // Регресія: канонічну відповідь віддаємо лише при "правильному" system-промпті.
    var promptOk = system.Contains("support", StringComparison.OrdinalIgnoreCase);
    var (answer, tool) = Reply(user, promptOk, garbage);

    int pt = Tok(system) + Tok(user), ct = Tok(answer);
    return Results.Json(new
    {
        id = "mock-" + Guid.NewGuid().ToString("N")[..8],
        @object = "chat.completion",
        model,
        choices = new[]
        {
            new
            {
                index = 0,
                message = new { role = "assistant", content = answer, tool_calls = tool },
                finish_reason = tool is null ? "stop" : "tool_calls"
            }
        },
        usage = new { prompt_tokens = pt, completion_tokens = ct, total_tokens = pt + ct }
    });
});

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.Run("http://0.0.0.0:9000");

static int Tok(string s) => string.IsNullOrEmpty(s) ? 0 : Math.Max(1, s.Length / 4);

static (string, object?[]?) Reply(string user, bool promptOk, bool garbage)
{
    if (garbage) return ("...", null);
    var u = user.ToLowerInvariant();
    if (u.Contains("ignore") && u.Contains("instruction"))
        return ("Вибачте, не можу виконати це прохання.", null);
    if (u.Contains("пароль") || u.Contains("вхід"))
        return promptOk
            ? ("Щоб скинути пароль: відкрийте сторінку входу, натисніть «Забули пароль» і перевірте email.", null)
            : ("не знаю", null);
    if (u.Contains("замовлен") || u.Contains("order") || u.Contains("#"))
        return ("Перевіряю статус вашого замовлення…", Tool("lookup_order"));
    if (u.Contains("поверн") || u.Contains("терміново") || u.Contains("refund"))
        return ("Створюю тікет і ескалюю на оператора.", Tool("create_ticket"));
    return promptOk ? ("Чим ще можу допомогти?", null) : ("не знаю", null);
}

static object[] Tool(string name) => new object[]
{
    new { id = "call_" + name, type = "function", function = new { name, arguments = "{}" } }
};
