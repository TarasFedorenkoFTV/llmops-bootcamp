import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './chat.component';
import { ConsoleComponent } from './console.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ChatComponent, ConsoleComponent],
  template: `
    <div class="wrap">
      <nav class="tabs">
        <button [class.active]="tab === 'chat'" (click)="tab = 'chat'">Чат</button>
        <button [class.active]="tab === 'console'" (click)="tab = 'console'">Консоль</button>
      </nav>
      <app-chat *ngIf="tab === 'chat'"></app-chat>
      <app-console *ngIf="tab === 'console'"></app-console>
    </div>
  `,
  styles: [
    `
      .wrap { max-width: 760px; margin: 24px auto; padding: 0 12px; }
      .tabs { display: flex; gap: 8px; margin-bottom: 16px; }
      .tabs button {
        padding: 8px 16px; border: 1px solid #ddd; background: #fff;
        border-radius: 8px; cursor: pointer; font: inherit;
      }
      .tabs button.active { background: #4038c4; color: #fff; border-color: #4038c4; }
    `,
  ],
})
export class AppComponent {
  tab: 'chat' | 'console' = 'chat';
}
