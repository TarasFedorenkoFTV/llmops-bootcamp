<#
.SYNOPSIS
Експортує кожен слайд кожної колоди рендерером самого PowerPoint (COM) у PNG.

.DESCRIPTION
LibreOffice дає близьку, але не тотожну картинку: інші autofit, інший авто-ріст
рядків таблиці, інший фолбек гліфів. Цей скрипт знімає слайди рушієм PowerPoint —
саме тим, у якому колоди відкриватимуть на записі.

Потрібен ДЕСКТОПНИЙ PowerPoint (Microsoft 365 / Office 2021 / окремий).
PowerPoint Online COM не має. У неінтерактивній сесії (WinRM, Session 0) Office
часто не стартує — запускайте у своїй звичайній сесії.

.EXAMPLE
powershell -ExecutionPolicy Bypass -File docs\decks\_build\pptx_export.ps1
#>
[CmdletBinding()]
param(
    [string]$DecksDir = (Join-Path $PSScriptRoot '..'),
    [string]$OutDir   = (Join-Path $PSScriptRoot '..\_render'),
    [int]$Width  = 1920,   # 13.333 x 7.5 in -> 1920x1080 точно за пропорцією
    [int]$Height = 1080
)

$ErrorActionPreference = 'Stop'

$DecksDir = (Resolve-Path $DecksDir).Path
if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Force -Path $OutDir | Out-Null }
$OutDir = (Resolve-Path $OutDir).Path

$decks = Get-ChildItem -Path $DecksDir -Filter 'L*.pptx' | Sort-Object Name
if (-not $decks) { throw "У '$DecksDir' немає файлів L*.pptx" }
Write-Host "Колод знайдено: $($decks.Count)  ->  $OutDir"

try {
    $app = New-Object -ComObject PowerPoint.Application
} catch {
    throw @"
PowerPoint COM недоступний: $($_.Exception.Message)
Потрібен десктопний PowerPoint. Перевірити: Get-Item 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\POWERPNT.EXE'
"@
}

# PowerPoint не вміє працювати повністю невидимим — не всі збірки дозволяють Visible=false.
try { $app.Visible = -1 } catch { }
try { $app.DisplayAlerts = 1 } catch { }   # ppAlertsNone

$manifest = @()
try {
    foreach ($deck in $decks) {
        $pres = $app.Presentations.Open($deck.FullName, -1, 0, 0)  # ReadOnly, не Untitled, без вікна
        try {
            $dir = Join-Path $OutDir $deck.BaseName
            New-Item -ItemType Directory -Force -Path $dir | Out-Null
            Get-ChildItem $dir -Filter '*.png' | Remove-Item -Force -ErrorAction SilentlyContinue

            $count = $pres.Slides.Count
            for ($i = 1; $i -le $count; $i++) {
                $file = Join-Path $dir ('{0}-{1:d2}.png' -f $deck.BaseName, $i)
                $pres.Slides.Item($i).Export($file, 'PNG', $Width, $Height)
            }
            Write-Host ("{0}: {1} слайдів" -f $deck.BaseName, $count)
            $manifest += [pscustomobject]@{ deck = $deck.BaseName; slides = $count }
        } finally {
            $pres.Close()
            [void][Runtime.InteropServices.Marshal]::ReleaseComObject($pres)
        }
    }
} finally {
    $app.Quit()
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($app)
    [GC]::Collect(); [GC]::WaitForPendingFinalizers()
}

$manifest | ConvertTo-Json | Out-File (Join-Path $OutDir 'manifest.json') -Encoding utf8
$total = ($manifest | Measure-Object -Property slides -Sum).Sum
Write-Host "Готово. Слайдів разом: $total. Маніфест: $OutDir\manifest.json"
