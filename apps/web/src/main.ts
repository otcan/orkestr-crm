import { ChangeDetectionStrategy, Component, computed, signal } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";

interface Metric {
  label: string;
  value: string;
  tone: "neutral" | "good" | "warn";
}

@Component({
  selector: "oc-root",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="shell">
      <aside class="sidebar" aria-label="Primary">
        <div class="brand">
          <span class="brand-mark">OC</span>
          <div>
            <strong>Orkestr CRM</strong>
            <small>MCP control plane</small>
          </div>
        </div>

        <nav>
          @for (item of navItems; track item) {
            <button type="button" [class.active]="item === selectedNav()" (click)="selectedNav.set(item)">
              {{ item }}
            </button>
          }
        </nav>
      </aside>

      <section class="workspace">
        <header class="topbar">
          <div>
            <h1>{{ selectedNav() }}</h1>
            <p>{{ subtitle() }}</p>
          </div>
          <div class="status-pill" [class.warn]="backupHealth() !== 'ok'">
            Backup {{ backupHealth() }}
          </div>
        </header>

        <section class="metrics" aria-label="CRM metrics">
          @for (metric of metrics(); track metric.label) {
            <article class="metric" [class.good]="metric.tone === 'good'" [class.warn]="metric.tone === 'warn'">
              <span>{{ metric.label }}</span>
              <strong>{{ metric.value }}</strong>
            </article>
          }
        </section>

        <section class="panels">
          <article class="panel">
            <header>
              <h2>Agent Queue</h2>
              <button type="button">Sync</button>
            </header>
            <div class="queue">
              @for (item of queue(); track item.lead) {
                <div class="queue-row">
                  <div>
                    <strong>{{ item.lead }}</strong>
                    <span>{{ item.action }}</span>
                  </div>
                  <time>{{ item.due }}</time>
                </div>
              }
            </div>
          </article>

          <article class="panel">
            <header>
              <h2>Connectors</h2>
              <button type="button">Test</button>
            </header>
            <div class="connectors">
              @for (connector of connectors(); track connector.name) {
                <div class="connector">
                  <span>{{ connector.name }}</span>
                  <strong [class.good-text]="connector.status === 'ready'" [class.warn-text]="connector.status !== 'ready'">
                    {{ connector.status }}
                  </strong>
                </div>
              }
            </div>
          </article>
        </section>
      </section>
    </main>
  `,
  styles: []
})
export class AppComponent {
  readonly navItems = ["Dashboard", "Leads", "Pipeline", "Scheduler", "Activities", "Integrations", "Settings"];
  readonly selectedNav = signal("Dashboard");
  readonly backupHealth = signal<"ok" | "degraded">("degraded");

  readonly metrics = signal<Metric[]>([
    { label: "Due follow-ups", value: "0", tone: "warn" },
    { label: "Active leads", value: "0", tone: "neutral" },
    { label: "Meetings booked", value: "0", tone: "good" },
    { label: "MCP tools", value: "5", tone: "good" }
  ]);

  readonly queue = signal([
    { lead: "No leads yet", action: "Import or create the first lead", due: "now" },
    { lead: "MCP queue", action: "crm.get_daily_queue is scaffolded", due: "ready" }
  ]);

  readonly connectors = signal([
    { name: "SalesNav", status: "planned" },
    { name: "LinkedIn", status: "planned" },
    { name: "Email", status: "planned" },
    { name: "Calendar", status: "planned" }
  ]);

  readonly subtitle = computed(() => {
    const selected = this.selectedNav();
    if (selected === "Dashboard") {
      return "Agent-first operating view for CRM state, queues, integrations, and backup health.";
    }

    return `${selected} module scaffold is ready for implementation.`;
  });
}

bootstrapApplication(AppComponent).catch((error: unknown) => {
  console.error(error);
});

