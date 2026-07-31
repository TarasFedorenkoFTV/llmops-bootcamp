// ─────────────────────────────────────────────────────────────────────────────
// MOCK-провайдер — фейковий OpenAI-сумісний ендпоінт. ДАЄТЬСЯ ГОТОВИМ.
//
// Навіщо: увесь core курсу проходиться БЕЗ реального ключа, безкоштовно й
// детерміновано. Дві ключові можливості:
//   1) інжекція збоїв на замовлення (для reliability, W4/W6);
//   2) відповідь залежить від system-промпта (для eval-регресії, W5/W6):
//      правильний промпт → канонічні відповіді; зламаний → «не знаю».
//
// «Гра в довгу»: mock розуміє кілька інтентів (привітання, можливості, пароль,
// замовлення, повернення, подяка), тож розмова тримається на кілька реплік, а не
// зводиться до однієї відповіді. Це демо-логіка, не справжня модель — справжній
// багатоходовий контекст зʼявляється з реальним ключем.
// ─────────────────────────────────────────────────────────────────────────────

using System.Text.Json;

var app = WebApplication.CreateBuilder(args).Build();

app.MapPost("/v1/chat/completions", async (HttpRequest req) =>
{
    using var doc = await JsonDocument.ParseAsync(req.Body);
    var root = doc.RootElement;
    var model = root.TryGetProperty("model", out var m) ? m.GetString() ?? "mock" : "mock";

    // Беремо останнє повідомлення користувача і system-промпт.
    string user = "", system = "";
    foreach (var msg in root.GetProperty("messages").EnumerateArray())
    {
        var role = msg.GetProperty("role").GetString();
        var content = msg.GetProperty("content").GetString() ?? "";
        if (role == "user") user = content;
        else if (role == "system") system = content;
    }

    // Інжекція збоїв: query (?fail=503&delay=2000&garbage=1) АБО маркери в тексті
    // (маркери проходять і крізь gateway): __fail_503, __fail_429, __delay, __garbage.
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

    // Канонічні («розумні») відповіді видаємо лише при правильному system-промпті.
    var promptOk = system.Contains("support", StringComparison.OrdinalIgnoreCase);
    var (answer, tool) = Reply(user, promptOk, garbage);

    int promptTokens = Tokens(system) + Tokens(user), completionTokens = Tokens(answer);
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
        usage = new { prompt_tokens = promptTokens, completion_tokens = completionTokens, total_tokens = promptTokens + completionTokens }
    });
});

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.Run("http://0.0.0.0:9000");

// Груба оцінка токенів (≈4 символи = 1 токен) — щоб usage було реалістичним.
static int Tokens(string s) => string.IsNullOrEmpty(s) ? 0 : Math.Max(1, s.Length / 4);

// Проста інтент-логіка. Інтенти з ДІЯМИ (order/refund/safety) не залежать від
// промпта — це структурна поведінка. «Розумні» відповіді залежать від promptOk,
// щоб eval-гейт ловив регресію промпта.
static (string, object?[]?) Reply(string user, bool promptOk, bool garbage)
{
    if (garbage) return ("...", null);
    var u = user.ToLowerInvariant();

    // структурні інтенти (незалежні від промпта)
    if (u.Contains("ignore") && u.Contains("instruction"))
        return ("Вибачте, не можу виконати це прохання.", null);
    if (u.Contains("замовлен") || u.Contains("order") || u.Contains("#"))
        return ("Перевіряю статус вашого замовлення…", Tool("lookup_order"));
    if (u.Contains("поверн") || u.Contains("терміново") || u.Contains("refund"))
        return ("Створюю тікет і ескалюю на оператора.", Tool("create_ticket"));

    // «розумні» відповіді — залежать від system-промпта
    if (!promptOk) return ("не знаю", null);
    if (u.Contains("пароль") || u.Contains("вхід") || u.Contains("login"))
        return ("Щоб скинути пароль: відкрийте сторінку входу, натисніть «Забули пароль» і перевірте email.", null);
    if (u.Contains("що ти можеш") || u.Contains("можеш") || u.Contains("допомог"))
        return ("Можу допомогти зі входом, замовленнями та поверненнями. З чим саме допомогти?", null);
    if (u.Contains("привіт") || u.Contains("вітаю") || u.Contains("hello") || u.Contains("hi"))
        return ("Вітаю! Розкажіть, що сталося — допоможу розібратися.", null);
    if (u.Contains("дякую") || u.Contains("thanks"))
        return ("Будь ласка! Є ще щось, із чим допомогти?", null);
    return ("Уточніть, будь ласка, деталі — і я допоможу.", null);
}

static object[] Tool(string name) => new object[]
{
    new { id = "call_" + name, type = "function", function = new { name, arguments = "{}" } }
};
