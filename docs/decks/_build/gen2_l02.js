// L02 v2 — Prompt lifecycle
const path = require("path");
const { createDeck, notesFrom } = require("./deck_lib2");
const SRC = process.env.DECKS_DIR || path.join(__dirname, "..");
const N = notesFrom(path.join(SRC, "L02-script.md"));
const D = createDeck({ lesson: 2, week: 1, fileTitle: "Prompt lifecycle: промпт як production-артефакт", notes: N });
const { P, F, MX } = D;

D.titleSlide({
  title: "Prompt lifecycle: промпт\nяк production-артефакт",
  lead: "Одне речення в промпті може зробити більше шкоди, ніж поганий деплой, — бо деплой хоча б лишає слід. Сьогодні промпт переїжджає з коду в реєстр із версіями, promote і rollback.",
  notes: N(),
});

// LO
{
  const s = D.slide({ title: "Що ви зможете після уроку", pill: "absorb", kicker: "П'ять дій, які перевірите руками", notes: N() });
  [["Перенести промпт у реєстр", "із хардкоду в базу, дві версії"],
   ["Розділити інструкції й дані", "не відкрити вектор injection"],
   ["Зробити activate атомарним", "promote і rollback — одна операція"],
   ["Заповнити prompt_version", "знайти регресію SQL-запитом"],
   ["Відтворити регресію наживо", "v1 → «не знаю» → повернути v2"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + (i % 3) * 4.05, y: 1.95 + Math.floor(i / 3) * 1.9, w: 3.85, h: 1.6, badge: i + 1, title: t, body: b }));
}

// карта
{
  const s = D.slide({ title: "Маршрут на сьогодні", pill: "absorb", notes: N() });
  [["01","Регресія без коміта"],["02","Промпт — не «просто текст»"],["03","Анатомія промпта"],
   ["04","Змінні й підстановка"],["05","Реєстр у базі"],["06","Сервіс читає активну версію"],
   ["07","Promote і rollback"],["08","Чому mock відчуває промпт"],["09","Дисципліна версій"],
   ["10","Audit trail · опційно"],["11","Лабораторна"],["12","Антипатерни"],
  ].forEach(([n, t], i) => D.tile(s, { x: MX + (i % 3) * 4.05, y: 1.8 + Math.floor(i / 3) * 1.15, w: 3.85, h: 0.95,
      badge: n, title: t, tone: n === "10" ? "warn" : "card" }));
  D.band(s, { x: MX, y: 6.32, w: 12.1, h: 0.44, tone: "card", text: "Від «git чистий, система зламана» — до реєстру, у якому відкат займає секунду." });
}

// глосарій
{
  const s = D.slide({ title: "Терміни, якими користуватимемось", pill: "absorb",
    kicker: "Шість слів сьогоднішнього уроку — щоб вони не відволікали по ходу",
    notes: N() });
  D.terms(s, { x: MX, y: 1.95, w: 12.1, cols: 3, rowH: 1.3, items: [
    { term: "реєстр промптів", def: "таблиця в базі: кожна версія — рядок, активна одна" },
    { term: "версія", def: "незмінний текст промпта; активну не редагуємо ніколи" },
    { term: "promote / rollback", def: "зробити версію активною; у нас це одна операція" },
    { term: "prompt_version", def: "поле лога: котра версія відповідала користувачу" },
    { term: "few-shot", def: "1–5 показових пар просто в промпті" },
    { term: "prompt injection", def: "дані, які модель прочитала як інструкцію (урок 8)" },
  ] });
  D.band(s, { x: MX, y: 4.95, w: 12.1, h: 0.85, tone: "card", text: "Кожне розберемо на місці — тут вони лише щоб не спотикатися." });
}

// 01 регресія — таймлайн
{
  const s = D.slide({ num: "01", title: "Регресія без коміта: git чистий, система зламана", pill: "absorb", notes: N() });
  D.timeline(s, { x: MX + 1.2, y: 2.65, w: 9.7, marks: [
    { time: "П'ятниця", label: "хтось «трохи уточнив формулювання»", tone: "acc" },
    { time: "Понеділок", label: "підтримка тоне у скаргах: бот відповідає не по темі", tone: "warn" },
    { time: "Розслідування", label: "git чистий, деплой тиждень тому — що змінилося?", tone: "crit" },
  ] });
  D.band(s, { x: MX, y: 4.55, w: 12.1, h: 1.5, tone: "acc", label: "Навіщо цей шар",
    text: "Проти регресії без коміта безсилі і git, і HTTP-моніторинг: метрики зелені, помилок немає — просто відповіді стали гіршими. Захист із двох частин: реєстр версій і слід у лозі." });
}

// 02 код vs промпт
{
  const s = D.slide({ num: "02", title: "Як живе код — і як живе типовий промпт", pill: "absorb", notes: N() });
  D.table(s, { x: MX, y: 1.85, w: 12.1, colW: [3.2, 3.4, 5.5], rowH: 0.62, size: 12,
    head: ["питання", "код", "промпт у типовій команді"],
    rows: [
      { cells: ["Хто і коли міняв?", "git blame", "ніхто не знає"], cellTones: [null, null, "crit"] },
      { cells: ["Що саме змінилося?", "diff у PR", "«та я трохи переформулював»"], cellTones: [null, null, "crit"] },
      { cells: ["Яка версія в проді?", "тег релізу", "та, що зараз у коді… мабуть"], cellTones: [null, null, "crit"] },
      { cells: ["Як відкотити?", "revert + деплой", "згадати, як було, і вписати назад"], cellTones: [null, null, "crit"] },
    ] });
  D.flow(s, { x: MX, y: 5.15, w: 12.1, h: 0.72, size: 11.5, items: [
    { label: "історія версій", tone: "good" }, { label: "атомарний promote", tone: "good" }, { label: "слід у лозі", tone: "good" }] });
  D.band(s, { x: MX, y: 6.15, w: 12.1, h: 0.72, tone: "card", text: "Реєстр закриває всі чотири рядки трьома механізмами." });
}

// 03 анатомія
{
  const s = D.slide({ num: "03", title: "Анатомія промпта: що саме ви версіонуєте", pill: "absorb",
    kicker: "Чотири частини — і те, як кожна ламається", notes: N() });
  // заголовок тут 2-рядковий + кікер, тож маркер формату опускається до 1.86 —
  // контент починаємо нижче, а місце добираємо меншим проміжком між шарами
  D.layers(s, { x: MX, y: 1.94, w: 12.1, h: 0.85, gap: 0.1, items: [
    { label: "Роль і межа", body: "ким модель себе вважає · без межі консультує з будь-чого вашим голосом", tone: "acc" },
    { label: "Правила", body: "тон, довжина, коли ескалювати · побажання не змінюють нічого" },
    { label: "Формат", body: "структура відповіді · «як вийде» перетворює парсинг на лотерею" },
    { label: "Приклади", body: "1–5 показових пар · їдуть у кожному запиті й коштують грошей" },
  ] });
  D.band(s, { x: MX, y: 5.88, w: 12.1, h: 0.8, tone: "good", label: "Принцип",
    text: "Разом ці чотири частини — одна незмінна версія. Змінили будь-яку — це нова версія, а не «трохи підправив»." });
}

// 04 правила
{
  const s = D.slide({ num: "03", title: "Правила, які працюють, і ціна прикладів", pill: "absorb", notes: N() });
  D.tile(s, { x: MX, y: 1.85, w: 5.85, h: 1.8, title: "Побажання — не інструкція",
    body: "«будь точним», «не вигадуй» — немає нічого, що модель могла б порушити перевірюваним чином", tone: "crit" });
  D.tile(s, { x: 6.87, y: 1.85, w: 5.85, h: 1.8, title: "Перевірювана вимога — дія і межа",
    body: "«немає відповіді — скажи, що не знаєш, і запропонуй заявку»; «не більше трьох речень»", tone: "good" });
  D.tile(s, { x: MX, y: 3.9, w: 5.85, h: 1.55, title: "Few-shot: 1–5 показових пар",
    body: "приклад має демонструвати саме те, що модель робить неправильно" });
  D.tile(s, { x: 6.87, y: 3.9, w: 5.85, h: 1.55, title: "Ціна прикладів",
    body: "їдуть у кожному запиті — множаться на весь трафік (урок 4)", tone: "warn" });
  D.band(s, { x: MX, y: 5.7, w: 12.1, h: 0.95, tone: "warn", label: "Лайфхак",
    text: "Стабільне (роль, правила, формат) — на початку, змінне (контекст користувача) — у кінці: провайдери кешують стабільний префікс дешевше." });
}

// 04 injection
{
  const s = D.slide({ num: "04", title: "Шов підстановки: тут народжується injection", pill: "absorb", notes: N() });
  D.code(s, { x: MX, y: 1.9, w: 12.1, h: 1.5, size: 13, lines: [
    [{ t: "// так робити не треба", c: P.dim }],
    [{ t: "var systemPrompt = template + ", c: P.darktext }, { t: '"\\n\\nДані клієнта: "', c: "177245" }, { t: " + customerNotes;", c: P.darktext }],
  ] });
  D.flow(s, { x: MX, y: 3.7, w: 12.1, h: 0.8, size: 11.5, items: [
    { label: "ваші правила" }, { label: "+ дані клієнта", tone: "crit" }, { label: "один потік тексту для моделі", tone: "crit" }] });
  D.band(s, { x: MX, y: 4.85, w: 12.1, h: 1.5, tone: "good", label: "Принцип",
    text: "Інструкції та дані живуть у різних місцях: усе від користувача чи з бази їде окремим user-повідомленням. Текст міг потрапити туди без зловмисника — коментар оператора, поле форми, підтягнутий лист." });
}

// 04 підстановка
{
  const s = D.slide({ num: "04", title: "Підстановка — в одному місці", pill: "absorb", notes: N() });
  D.code(s, { x: MX, y: 1.9, w: 12.1, h: 2.05, size: 12.5, lines: [
    [{ t: "// шаблон із реєстру: \"Ти асистент підтримки {service}. Відповідай {lang}.\"", c: P.dim }],
    [{ t: "var systemPrompt = template", c: P.darktext }],
    [{ t: '    .Replace("{service}", "SupportGW")', c: "5A05F4" }],
    [{ t: '    .Replace("{lang}", "українською");', c: "5A05F4" }],
    [{ t: "// дані користувача сюди НЕ підставляються — вони йдуть окремим user-повідомленням", c: P.dim }],
  ] });
  D.band(s, { x: MX, y: 4.25, w: 12.1, h: 1.75, tone: "crit", label: "Типова помилка",
    text: "Складати промпт із трьох джерел «по дорозі»: щось із реєстру, щось із конфіга, щось дописано в коді. У лозі — версія v3, а в модель летять два різні промпти." });
}

// 05 реєстр
{
  const s = D.slide({ num: "05", title: "Реєстр у базі: розтин таблиці prompts", pill: "absorb", notes: N() });
  D.code(s, { x: MX, y: 1.85, w: 6.6, h: 2.9, size: 12, lines: [
    [{ t: "CREATE TABLE IF NOT EXISTS prompts (", c: "5A05F4" }],
    [{ t: "  name        TEXT NOT NULL,", c: P.darktext }],
    [{ t: "  version     TEXT NOT NULL,", c: P.darktext }],
    [{ t: "  body        TEXT NOT NULL,", c: P.darktext }],
    [{ t: "  active      BOOLEAN NOT NULL DEFAULT false,", c: P.darktext }],
    [{ t: "  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),", c: P.darktext }],
    [{ t: "  PRIMARY KEY (name, version)", c: "B45309" }],
    [{ t: ");", c: "5A05F4" }],
  ] });
  D.tile(s, { x: 7.6, y: 1.85, w: 5.12, h: 1.4, title: "У стартері таблиця порожня", body: "навмисно: наповнюєте ви — v1 і v2", tone: "warn" });
  D.tile(s, { x: 7.6, y: 3.4, w: 5.12, h: 1.35, title: "Ключ (name, version)", body: "одна назва — багато версій, кожна незмінна" });
  D.band(s, { x: MX, y: 5.05, w: 12.1, h: 1.2, tone: "acc",
    text: "Сьогодні покладете туди v1 «You are an assistant.» (зумисне погану) і v2 «You are a support assistant. Be concise and helpful.» — активною зробите v2." });
}

// 06 сервіс читає
{
  const s = D.slide({ num: "06", title: "Сервіс читає реєстр — і пише версію в лог", pill: "absorb", notes: N() });
  D.code(s, { x: MX, y: 1.85, w: 7.2, h: 1.85, size: 12, lines: [
    [{ t: "// [W1] промпт беремо з реєстру — активну версію, а не хардкод", c: P.dim }],
    [{ t: "SELECT", c: "5A05F4" }, { t: " version, body ", c: P.darktext }, { t: "FROM", c: "5A05F4" }, { t: " prompts", c: P.darktext }],
    [{ t: "WHERE", c: "5A05F4" }, { t: " active = true ", c: P.darktext }, { t: "ORDER BY", c: "5A05F4" }, { t: " created_at DESC LIMIT 1;", c: P.darktext }],
  ] });
  D.tile(s, { x: 8.2, y: 1.85, w: 4.52, h: 1.85, title: "Fail-visible", body: "реєстр порожній → версія «none» і дефолт без «support»: поломка помітна", tone: "crit" });
  D.flow(s, { x: MX, y: 4.15, w: 12.1, h: 0.8, size: 11.5, items: [
    { label: "prompts", tone: "acc" }, { label: "активна версія" }, { label: "виклик моделі" }, { label: "prompt_version у лозі", tone: "good" }] });
  D.band(s, { x: MX, y: 5.35, w: 12.1, h: 1.0, tone: "good",
    text: "Поле prompt_version, яке з уроку 1 стояло порожнім, від сьогодні заповнене — розслідування якості стає SQL-запитом." });
}

// 07 promote / rollback
{
  const s = D.slide({ num: "07", title: "Promote і rollback — одна операція", pill: "absorb", notes: N() });
  D.code(s, { x: MX, y: 1.85, w: 6.4, h: 1.45, size: 13, lines: [
    [{ t: "UPDATE", c: "5A05F4" }, { t: " prompts", c: P.darktext }],
    [{ t: "   SET", c: "5A05F4" }, { t: " active = (version = @v)", c: P.darktext }],
    [{ t: " WHERE", c: "5A05F4" }, { t: " name = 'support-system';", c: P.darktext }],
  ] });
  D.tile(s, { x: 7.35, y: 1.85, w: 5.37, h: 1.45, title: "Атомарно", body: "не існує моменту, коли активні дві версії або жодної", tone: "good" });
  [["Невідома версія → 404", "чесна відмова, не тихе «ок»: одруківка не деактивує все"],
   ["Подія з міткою часу", "розслідування «що змінилося о 19:42» має за що зачепитися"],
   ["Promote і rollback — те саме", "відкат не потребує окремого механізму"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + i * 4.05, y: 3.55, w: 3.85, h: 1.75, badge: i + 1, title: t, body: b }));
  D.band(s, { x: MX, y: 5.6, w: 12.1, h: 0.8, tone: "acc", text: "Відкат за секунди замість розкопок «а як там було вчора»." });
}

// 07 A/B
{
  const s = D.slide({ num: "07", title: "А якщо порівняти дві версії на живому трафіку?", pill: "absorb", notes: N() });
  [["Ділити за користувачем", "не за запитом: інакше одна людина отримає дві манери — поміряєте плутанину"],
   ["Метрика — заздалегідь", "назвати метрику й тривалість: інакше експеримент вічний"],
   ["Відкат — одна операція", "та сама активація; експеримент без виходу — не експеримент"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + i * 4.05, y: 2.0, w: 3.85, h: 2.0, badge: i + 1, title: t, body: b, tone: "acc" }));
  D.band(s, { x: MX, y: 4.4, w: 12.1, h: 1.2, tone: "card",
    text: "Активні дві версії; «кому яку» вирішує той самий шар, що обирає модель (урок 3). У курсі це не обов'язкова доріжка — але механізм у вас уже буде." });
}

// 08 mock
{
  const s = D.slide({ num: "08", title: "Чому mock відчуває промпт", pill: "absorb", notes: N() });
  D.code(s, { x: MX, y: 1.85, w: 12.1, h: 1.15, size: 12.5, lines: [
    [{ t: "// «розумні» відповіді — тільки коли промпт правильний", c: P.dim }],
    [{ t: "var promptOk = system.Contains(", c: P.darktext }, { t: '"support"', c: "177245" }, { t: ", StringComparison.OrdinalIgnoreCase);", c: P.darktext }],
  ] });
  D.flow(s, { x: MX, y: 3.3, w: 12.1, h: 0.75, size: 11.5, items: [
    { label: "v1 «You are an assistant.»", tone: "crit" }, { label: "маркера немає" }, { label: "«не знаю»", tone: "crit" }] });
  D.flow(s, { x: MX, y: 4.3, w: 12.1, h: 0.75, size: 11.5, items: [
    { label: "v2 «You are a support assistant…»", tone: "good" }, { label: "маркер є" }, { label: "відповіді по суті", tone: "good" }] });
  D.band(s, { x: MX, y: 5.4, w: 12.1, h: 1.1, tone: "acc",
    text: "Навчальний трюк, який чесно моделює реальність: гірша версія промпта — гірші відповіді, і залежність видима для перевірок, а не лише для ока." });
}

// 09 дисципліна
{
  const s = D.slide({ num: "09", title: "Дисципліна версій: що вважати новою версією", pill: "absorb", notes: N() });
  [["Активну не редагуємо ніколи", "створюємо нову і promote'имо її"],
   ["Стара лишається в історії", "для порівняння «що саме змінили» і для відкату"],
   ["Одруківка — теж нова версія", "дешевше зайвий рядок, ніж «та сама v3» з різною поведінкою"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + i * 4.05, y: 1.9, w: 3.85, h: 1.85, badge: i + 1, title: t, body: b, tone: "good" }));
  D.band(s, { x: MX, y: 4.1, w: 12.1, h: 1.35, tone: "crit", label: "Рев'ю зміни промпта — чесний diff двох body",
    text: "Шукати зміни інструкцій, тону і видалені приклади: найнебезпечніше саме видалене — прибрали «уточнюй, якщо не впевнений», і бот упевнено вигадує." });
}

// 09 версія моделі
{
  const s = D.slide({ num: "09", title: "Версія моделі й рецепт контексту — та сама логіка", pill: "absorb", notes: N() });
  D.layers(s, { x: MX, y: 1.95, w: 12.1, h: 0.9, gap: 0.16, items: [
    { label: "Версія моделі", body: "провайдери оновлюють «ту саму» модель — фіксуйте снапшот" },
    { label: "Рецепт контексту", body: "вхід збирається з інструкцій, схем інструментів, фактів — версіонуйте рецепт, не текст", tone: "acc" },
    { label: "Не лише промпт", body: "параметри генерації, список інструментів, правила роутера — теж model-adjacent" },
  ] });
  D.band(s, { x: MX, y: 5.2, w: 12.1, h: 1.15, tone: "card",
    text: "Логіка «версія + активація + слід у лозі» застосовується до кожного з них без змін." });
}

// 10 audit trail — опційно
{
  const s = D.slide({ num: "10", title: "Audit trail: хто, коли, що активував", pill: "absorb", opt: true, notes: N() });
  D.tile(s, { x: MX, y: 2.1, w: 5.85, h: 1.9, title: "Журнал активацій", body: "окрема таблиця, куди activate дописує рядок: версія, час, хто", tone: "acc" });
  D.tile(s, { x: 6.87, y: 2.1, w: 5.85, h: 1.9, title: "Версії з міткою часу", body: "замість ручних v1/v2 — час створення в самій назві версії", tone: "acc" });
  D.band(s, { x: MX, y: 4.35, w: 12.1, h: 1.2, tone: "card",
    text: "Обидві ідеї — еволюція тієї самої таблиці, а не новий механізм: якщо базовий реєстр зроблений чисто, додаються за вечір. Це опційна частина ДЗ тижня 1." });
}

// місток
{
  const s = D.slide({ title: "Зараз ви побачите — і навіщо", pill: "do", notes: N() });
  [["SELECT з prompts", "у реєстрі дві версії, активна v2"],
   ["чат відповідає по суті", "з активною v2"],
   ["activate v1", "«погана» версія стає активною"],
   ["те саме питання", "«не знаю» — регресія на очах"],
   ["activate v2", "полагодилось, без деплою"],
   ["картка Prompt registry", "версії з активною в консолі"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + (i % 3) * 4.05, y: 1.8 + Math.floor(i / 3) * 1.75, w: 3.85, h: 1.55,
      badge: i + 1, title: t, body: b, tone: i === 3 ? "crit" : "good" }));
  D.band(s, { x: MX, y: 5.5, w: 12.1, h: 1.15, tone: "acc", label: "Навіщо",
    text: "Побачити регресію і відкат наживо: зміна версії ламає і лагодить відповіді без жодної зміни коду — git чистий. Сьогодні це ловлять ваші очі; на тижні 5–6 робитиме гейт." });
}

// лаба
{
  const s = D.slide({ title: "Лабораторна: чотири частини + опційна", pill: "do", notes: N() });
  [["Наповнити реєстр", "seed v1 + v2 (активна v2) → down -v && up -d", false],
   ["Прибрати хардкод", "GetActivePrompt у service/Program.cs; версію → LogRequest", false],
   ["Оживити консоль", "GET /prompts + POST /prompts/{version}/activate", false],
   ["Відтворити регресію", "activate v1 → «не знаю» → activate v2 → полагодилось", false],
   ["Audit trail · опційно", "окрема таблиця активацій", true],
  ].forEach(([t, b, opt], i) => {
    const y = 2.0 + i * 0.92;
    s.addShape("ellipse", { x: MX, y, w: 0.5, h: 0.5, fill: { color: opt ? P.warn : P.acc }, line: { type: "none" } });
    s.addText(String(i + 1), { x: MX, y, w: 0.5, h: 0.5, align: "center", valign: "middle", fontFace: F.mono, fontSize: 13, bold: true, color: "FFFFFF", margin: 0 });
    s.addText([{ text: t + "  ", options: { bold: true, fontSize: 14, color: opt ? P.warn : P.ink } },
               { text: b, options: { fontSize: 12, color: P.soft } }],
      { x: MX + 0.68, y, w: 11.4, h: 0.5, fontFace: F.body, valign: "middle", margin: 0 });
  });
}

// що це довело
{
  const s = D.slide({ title: "Що це довело", pill: "connect", notes: N() });
  D.tile(s, { x: MX, y: 1.9, w: 3.9, h: 2.0, title: "Регресія без коміта — реальна", body: "activate v1 зламав відповіді: git чистий, деплою не було", tone: "crit" });
  D.tile(s, { x: 4.72, y: 1.9, w: 3.9, h: 2.0, title: "Rollback — одна операція", body: "activate v2 полагодив за секунди: той самий ендпоінт", tone: "good" });
  D.tile(s, { x: 8.82, y: 1.9, w: 3.9, h: 2.0, title: "Лог знає, кого винуватити", body: "сплеск «не знаю» збігається з активацією v1", tone: "acc" });
  D.flow(s, { x: MX, y: 4.35, w: 12.1, h: 0.75, size: 11.5, items: [
    { label: "сьогодні: ловлять очі", tone: "warn" }, { label: "W5: eval-кейси" }, { label: "W6: гейт у CI", tone: "good" }] });
  D.band(s, { x: MX, y: 5.45, w: 12.1, h: 1.0, tone: "card",
    text: "Механіка та сама: вхід, очікування щодо відповіді, версія промпта в лозі — змінюється лише те, хто дивиться." });
}

// перевір себе
{
  const s = D.slide({ title: "Перевір себе", pill: "connect", notes: N() });
  s.addShape("roundRect", { x: MX, y: 1.95, w: 12.1, h: 2.05, rectRadius: 0.12, fill: { color: P.card }, line: { color: P.line, width: 1 } });
  D.checklist(s, { x: MX + 0.45, y: 2.3, w: 11.3, cols: 2, items: [
    "промпт живе в БД — хардкоду в сервісі немає",
    "у свіжих рядках лога заповнений prompt_version",
    "activate v1 ламає, v2 — лагодить, і це відтворюється",
    "консоль показує список версій з активною",
  ] });
  s.addText("Де завагалися — туди і повертайтеся. Питання — у канал потоку або на Q&A.",
    { x: MX, y: 4.25, w: 12, h: 0.35, fontFace: F.body, fontSize: 12, italic: true, color: P.faint, margin: 0 });
}

// антипатерни
{
  const s = D.slide({ title: "Антипатерни тижня", pill: "connect", notes: N() });
  [["Правити активний промпт «на живу»", "знищує можливість порівняти «до» і «після»; нова версія — один INSERT"],
   ["Промпт у коді, у документі або в голові тімліда", "усі три означають одне: система не знає, що нею керує"],
   ["Лог без prompt_version", "реєстр є, а розслідування наосліп"],
   ["«Достатньо git-історії»", "git скаже, як змінювався код, а не яка версія відповідала користувачу"],
  ].forEach(([t, b], i) => {
    const y = 2.0 + i * 1.0;
    s.addShape("roundRect", { x: MX, y, w: 12.1, h: 0.85, rectRadius: 0.1, fill: { color: P.card }, line: { color: P.line, width: 1 } });
    s.addShape("ellipse", { x: MX + 0.22, y: y + 0.21, w: 0.42, h: 0.42, fill: { color: P.critbg }, line: { type: "none" } });
    D.cross(s, { x: MX + 0.22, y: y + 0.21, size: 0.42, color: P.crit });
    s.addText([{ text: t + "   ", options: { bold: true, fontSize: 13.5, color: P.ink } },
               { text: b, options: { fontSize: 12, color: P.soft } }],
      { x: MX + 0.8, y, w: 11.1, h: 0.85, fontFace: F.body, valign: "middle", margin: 0 });
  });
}

// ДЗ
{
  const s = D.slide({ title: "Домашнє завдання", pill: "do", notes: N() });
  D.tile(s, { x: MX, y: 1.9, w: 5.85, h: 2.2, title: "Обов'язково",
    body: "здати ДЗ тижня 1 одним PR у своєму репозиторії — це рівно те, що ми пройшли за два уроки: у лабах більша частина зроблена руками, вдома довести до чистого стану" });
  D.tile(s, { x: 6.87, y: 1.9, w: 5.85, h: 2.2, title: "Опційно (не оцінюється)",
    body: "• audit trail: таблиця активацій — хто, коли, яку версію\n\n• версії з міткою часу замість ручних v1/v2", tone: "warn" });
  s.addShape("roundRect", { x: MX, y: 4.4, w: 12.1, h: 1.85, rectRadius: 0.14, fill: { color: P.card }, line: { color: P.acc, width: 1.5 } });
  s.addText("ДЗ тижня 1: логування + prompt registry", { x: MX + 0.3, y: 4.6, w: 11.5, h: 0.4, fontFace: F.body, fontSize: 15, bold: true, color: P.acc, margin: 0 });
  s.addText("Критерії коротко: стек піднімається однією командою; промпт живе в базі, сервіс бере активну версію; у кожному лог-рядку заповнений prompt_version; GET /prompts і activate працюють; відкат на «поганий» промпт відтворювано ламає відповіді. Повні критерії — у файлі ДЗ.",
    { x: MX + 0.3, y: 5.05, w: 11.5, h: 1.05, fontFace: F.body, fontSize: 12.5, color: P.ink, valign: "top", margin: 0 });
}

D.closingSlide({
  summary: [
    "регресія без коміта реальна: git чистий, система зламана",
    "промпт — конфігурація поведінки: роль, правила, формат, приклади = одна версія",
    "інструкції та дані живуть у різних місцях — інакше це вектор injection",
    "реєстр = таблиця на чотири поля + атомарний activate: promote і rollback — одна операція",
    "prompt_version у кожному рядку лога перетворює розслідування якості на SQL-запит",
  ],
  nextTitle: "Наступний крок → Урок 3 · Мультипровайдерний gateway і маршрутизація моделей",
  nextBody: "Промпт під контролем — тепер під контроль береться модель. Наступного уроку з'являється другий елемент ланцюга і точка рішення: яке питання куди відправити, чому «одна модель на все» дорога, і як розподіл трафіку стає видимим у лозі.",
  notes: N(),
});

const OUT = process.env.DECKS_OUT || SRC;
D.save(path.join(OUT, "L02.pptx"), path.join(OUT, "L02-script.md"));
