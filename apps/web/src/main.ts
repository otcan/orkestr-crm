import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { bootstrapApplication } from "@angular/platform-browser";

interface Metric {
  label: string;
  value: string;
  tone: "neutral" | "good" | "warn";
}

interface LeadRow {
  id: string;
  fullName: string;
  company?: string | null;
  email?: string | null;
  source?: string | null;
  updatedAt: string;
}

interface TaskRow {
  id: string;
  title: string;
  status: string;
  type: string;
  priority: number;
  dueAt?: string | null;
  lead?: LeadRow | null;
}

interface EventRow {
  id: string;
  type: string;
  channel: string;
  direction: string;
  subject?: string | null;
  body?: string | null;
  occurredAt: string;
  lead?: LeadRow | null;
}

type NavItem = "Dashboard" | "Leads" | "Tasks" | "Events" | "Settings";

@Component({
  selector: "oc-root",
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="shell">
      <aside class="sidebar" aria-label="Primary">
        <div class="brand">
          <span class="brand-mark">OC</span>
          <div>
            <strong>Orkestr CRM</strong>
            <small>Docker CRM ledger</small>
          </div>
        </div>

        <nav>
          @for (item of navItems; track item) {
            <button type="button" [class.active]="item === selectedNav()" (click)="selectNav(item)">
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
          <button type="button" class="status-pill" [class.warn]="backupHealth() !== 'ok'" (click)="refresh()">
            Backup {{ backupHealth() }}
          </button>
        </header>

        @switch (selectedNav()) {
          @case ("Dashboard") {
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
                  <h2>Due Tasks</h2>
                  <button type="button" (click)="refresh()">Sync</button>
                </header>
                <div class="queue">
                  @for (task of queue(); track task.id) {
                    <div class="queue-row">
                      <div>
                        <strong>{{ task.title }}</strong>
                        <span>{{ task.lead?.fullName || task.type }} · {{ task.status }}</span>
                      </div>
                      <time>{{ task.dueAt ? (task.dueAt | date:'short') : 'No due date' }}</time>
                    </div>
                  } @empty {
                    <div class="empty">No due work.</div>
                  }
                </div>
              </article>

              <article class="panel">
                <header>
                  <h2>Recent Events</h2>
                  <button type="button" (click)="selectNav('Events')">Open</button>
                </header>
                <div class="queue">
                  @for (event of events().slice(0, 5); track event.id) {
                    <div class="queue-row">
                      <div>
                        <strong>{{ event.subject || event.type }}</strong>
                        <span>{{ event.channel }} · {{ event.direction }}</span>
                      </div>
                      <time>{{ event.occurredAt | date:'short' }}</time>
                    </div>
                  } @empty {
                    <div class="empty">No events recorded.</div>
                  }
                </div>
              </article>
            </section>
          }

          @case ("Leads") {
            <section class="panels">
              <article class="panel">
                <header>
                  <h2>Create Lead</h2>
                  <button type="button" (click)="createLead()">Save</button>
                </header>
                <div class="form-grid">
                  <label>
                    Name
                    <input [(ngModel)]="leadForm.fullName" name="fullName">
                  </label>
                  <label>
                    Company
                    <input [(ngModel)]="leadForm.company" name="company">
                  </label>
                  <label>
                    Email
                    <input [(ngModel)]="leadForm.email" name="email">
                  </label>
                  <label>
                    LinkedIn URL
                    <input [(ngModel)]="leadForm.linkedinUrl" name="linkedinUrl">
                  </label>
                </div>
              </article>

              <article class="panel">
                <header>
                  <h2>Recent Leads</h2>
                  <button type="button" (click)="refresh()">Refresh</button>
                </header>
                <div class="queue">
                  @for (lead of leads(); track lead.id) {
                    <div class="queue-row">
                      <div>
                        <strong>{{ lead.fullName }}</strong>
                        <span>{{ lead.company || lead.email || lead.source || 'No details' }}</span>
                      </div>
                      <time>{{ lead.updatedAt | date:'short' }}</time>
                    </div>
                  } @empty {
                    <div class="empty">No leads yet.</div>
                  }
                </div>
              </article>
            </section>
          }

          @case ("Tasks") {
            <section class="panels single">
              <article class="panel">
                <header>
                  <h2>Tasks</h2>
                  <button type="button" (click)="refresh()">Refresh</button>
                </header>
                <div class="queue">
                  @for (task of tasks(); track task.id) {
                    <div class="queue-row">
                      <div>
                        <strong>{{ task.title }}</strong>
                        <span>{{ task.type }} · {{ task.status }} · priority {{ task.priority }}</span>
                      </div>
                      <time>{{ task.dueAt ? (task.dueAt | date:'short') : 'No due date' }}</time>
                    </div>
                  } @empty {
                    <div class="empty">No tasks.</div>
                  }
                </div>
              </article>
            </section>
          }

          @case ("Events") {
            <section class="panels single">
              <article class="panel">
                <header>
                  <h2>Event Timeline</h2>
                  <button type="button" (click)="refresh()">Refresh</button>
                </header>
                <div class="queue">
                  @for (event of events(); track event.id) {
                    <div class="queue-row event-row">
                      <div>
                        <strong>{{ event.subject || event.type }}</strong>
                        <span>{{ event.channel }} · {{ event.direction }} · {{ event.lead?.fullName || 'unlinked' }}</span>
                        @if (event.body) {
                          <small>{{ event.body }}</small>
                        }
                      </div>
                      <time>{{ event.occurredAt | date:'short' }}</time>
                    </div>
                  } @empty {
                    <div class="empty">No events recorded.</div>
                  }
                </div>
              </article>
            </section>
          }

          @case ("Settings") {
            <section class="panels single">
              <article class="panel">
                <header>
                  <h2>System</h2>
                  <button type="button" (click)="refresh()">Refresh</button>
                </header>
                <div class="queue">
                  <div class="queue-row">
                    <div>
                      <strong>Backup</strong>
                      <span>{{ backupHealth() }}</span>
                    </div>
                    <time>active</time>
                  </div>
                  <div class="queue-row">
                    <div>
                      <strong>Runtime</strong>
                      <span>Docker instance; CLI and MCP run inside the instance network.</span>
                    </div>
                    <time>ocrm</time>
                  </div>
                </div>
              </article>
            </section>
          }
        }
      </section>
    </main>
  `,
  styles: []
})
export class AppComponent {
  readonly navItems: NavItem[] = ["Dashboard", "Leads", "Tasks", "Events", "Settings"];
  readonly selectedNav = signal<NavItem>("Dashboard");
  readonly backupHealth = signal<"ok" | "degraded">("degraded");
  readonly leads = signal<LeadRow[]>([]);
  readonly tasks = signal<TaskRow[]>([]);
  readonly queue = signal<TaskRow[]>([]);
  readonly events = signal<EventRow[]>([]);
  readonly leadForm = {
    fullName: "",
    company: "",
    email: "",
    linkedinUrl: ""
  };

  readonly metrics = computed<Metric[]>(() => [
    { label: "Due tasks", value: String(this.queue().length), tone: this.queue().length ? "warn" : "good" },
    { label: "Active leads", value: String(this.leads().length), tone: "neutral" },
    { label: "Open tasks", value: String(this.tasks().filter((task) => task.status === "open").length), tone: "neutral" },
    { label: "Events", value: String(this.events().length), tone: "good" }
  ]);

  readonly subtitle = computed(() => {
    switch (this.selectedNav()) {
      case "Dashboard":
        return "CRM state at a glance: due work, recent leads, and event timeline.";
      case "Leads":
        return "Identity-resolved people and company workflow records.";
      case "Tasks":
        return "Actionable CRM work owned by this instance.";
      case "Events":
        return "Append-only timeline for messages, emails, connection requests, notes, and meetings.";
      case "Settings":
        return "Instance health and Docker runtime status.";
    }
  });

  constructor() {
    void this.refresh();
  }

  selectNav(item: NavItem) {
    this.selectedNav.set(item);
  }

  async refresh() {
    const [health, leads, queue, tasks, events] = await Promise.all([
      fetch("/api/health").then((res) => res.json()).catch(() => ({ status: "degraded" })),
      fetch("/api/leads").then((res) => res.json()).catch(() => []),
      fetch("/api/assignments/due").then((res) => res.json()).catch(() => []),
      fetch("/api/tasks").then((res) => res.json()).catch(() => []),
      fetch("/api/events?limit=50").then((res) => res.json()).catch(() => [])
    ]);

    this.backupHealth.set(health.status === "ok" ? "ok" : "degraded");
    this.leads.set(Array.isArray(leads) ? leads : []);
    this.queue.set(Array.isArray(queue) ? queue : []);
    this.tasks.set(Array.isArray(tasks) ? tasks : []);
    this.events.set(Array.isArray(events) ? events : []);
  }

  async createLead() {
    if (!this.leadForm.fullName.trim()) {
      return;
    }

    await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fullName: this.leadForm.fullName,
        company: this.leadForm.company || undefined,
        email: this.leadForm.email || undefined,
        linkedinUrl: this.leadForm.linkedinUrl || undefined,
        source: "web"
      })
    });

    this.leadForm.fullName = "";
    this.leadForm.company = "";
    this.leadForm.email = "";
    this.leadForm.linkedinUrl = "";
    await this.refresh();
  }
}

bootstrapApplication(AppComponent).catch((error: unknown) => {
  console.error(error);
});
