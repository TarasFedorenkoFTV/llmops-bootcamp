import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Card {
  title: string;
  url: string;
  data: unknown;
}

@Component({
  selector: 'app-console',
  standalone: true,
  imports: [CommonModule],
  template: `
    <p class="hint">
      Консоль контрол-плейну — read-only. Дані бере з API сервісу. Поки ендпоінти —
      заглушки (<code>{{ '{' }}todo{{ '}' }}</code>); студент реалізує їх, і картки наповнюються.
    </p>
    <div class="grid">
      <div class="card" *ngFor="let c of cards">
        <div class="k">{{ c.title }}</div>
        <pre class="v">{{ c.data | json }}</pre>
        <div class="src">GET {{ c.url }}</div>
      </div>
    </div>
  `,
  styles: [
    `
      .hint { font-size: 13px; color: #666; margin: 0 0 12px; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
      .card { background: #fff; border: 1px solid #e2e2e2; border-radius: 10px; padding: 14px; }
      .k { font-weight: 600; margin-bottom: 8px; }
      .v { margin: 0; font-size: 12px; background: #f6f6f8; padding: 8px; border-radius: 6px; overflow-x: auto; }
      .src { margin-top: 8px; font-size: 11px; color: #999; font-family: monospace; }
    `,
  ],
})
export class ConsoleComponent implements OnInit {
  cards: Card[] = [
    { title: 'Observability', url: '/api/observability', data: null },
    { title: 'Cost', url: '/api/cost', data: null },
    { title: 'Prompts', url: '/api/prompts', data: null },
    { title: 'Provider health', url: '/api/health', data: null },
    { title: 'Approvals', url: '/api/approvals', data: null },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    for (const c of this.cards) {
      this.http.get(c.url).subscribe({
        next: (d) => (c.data = d),
        error: (e) => (c.data = { error: e.status ?? 'unreachable' }),
      });
    }
  }
}
