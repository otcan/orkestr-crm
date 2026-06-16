import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CrmApiService } from "./crm-api.service";
import { DetailPanelComponent } from "./detail-panel.component";
import { DetailSelection, EventRow, LeadEditForm, LeadRow, Metric, NavItem, TaskEditForm, TaskRow } from "./models";

@Component({
  selector: "oc-root",
  standalone: true,
  imports: [CommonModule, DetailPanelComponent, FormsModule],
  templateUrl: "./app.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly api = inject(CrmApiService);

  readonly navItems: NavItem[] = ["Dashboard", "Leads", "Tasks", "Events", "Settings"];
  readonly selectedNav = signal<NavItem>("Dashboard");
  readonly backupHealth = signal<"ok" | "degraded">("degraded");
  readonly leads = signal<LeadRow[]>([]);
  readonly tasks = signal<TaskRow[]>([]);
  readonly queue = signal<TaskRow[]>([]);
  readonly events = signal<EventRow[]>([]);
  readonly selectedDetail = signal<DetailSelection | null>(null);
  readonly leadActivities = signal<EventRow[]>([]);
  readonly detailLoading = signal(false);
  readonly detailError = signal<string | null>(null);
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);
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
      this.api.health().catch(() => ({ status: "degraded" as const })),
      this.api.listLeads().catch(() => []),
      this.api.listDueTasks().catch(() => []),
      this.api.listTasks().catch(() => []),
      this.api.listEvents().catch(() => [])
    ]);

    this.backupHealth.set(health.status === "ok" ? "ok" : "degraded");
    this.leads.set(leads);
    this.queue.set(queue);
    this.tasks.set(tasks);
    this.events.set(events);
    this.syncSelectedFromLists();
  }

  async createLead() {
    if (!this.leadForm.fullName.trim()) {
      return;
    }

    await this.api.createLead({
      fullName: this.leadForm.fullName,
      company: this.leadForm.company,
      email: this.leadForm.email,
      linkedinUrl: this.leadForm.linkedinUrl,
      source: "web"
    });

    this.leadForm.fullName = "";
    this.leadForm.company = "";
    this.leadForm.email = "";
    this.leadForm.linkedinUrl = "";
    await this.refresh();
  }

  async selectLead(lead: LeadRow) {
    this.selectedDetail.set({ kind: "lead", item: lead });
    this.leadActivities.set([]);
    this.detailError.set(null);
    this.saveError.set(null);
    this.detailLoading.set(true);

    try {
      const [detail, activities] = await Promise.all([this.api.getLead(lead.id), this.api.getLeadActivities(lead.id)]);
      if (this.selectedDetail()?.kind === "lead" && this.selectedDetail()?.item.id === lead.id) {
        this.selectedDetail.set({ kind: "lead", item: detail });
        this.leadActivities.set(activities);
      }
    } catch (error) {
      this.detailError.set(error instanceof Error ? error.message : "Could not load lead detail.");
    } finally {
      this.detailLoading.set(false);
    }
  }

  selectTask(task: TaskRow) {
    this.selectedDetail.set({ kind: "task", item: task });
    this.leadActivities.set([]);
    this.detailError.set(null);
    this.saveError.set(null);
  }

  selectEvent(event: EventRow) {
    this.selectedDetail.set({ kind: "event", item: event });
    this.leadActivities.set([]);
    this.detailError.set(null);
    this.saveError.set(null);
  }

  closeDetail() {
    this.selectedDetail.set(null);
    this.leadActivities.set([]);
    this.detailError.set(null);
    this.saveError.set(null);
  }

  isSelected(kind: DetailSelection["kind"], id: string) {
    const selected = this.selectedDetail();
    return selected?.kind === kind && selected.item.id === id;
  }

  async saveLead(form: LeadEditForm) {
    const selected = this.selectedDetail();
    if (selected?.kind !== "lead") {
      return;
    }

    this.saving.set(true);
    this.saveError.set(null);
    try {
      const updated = await this.api.updateLead(selected.item.id, form);
      this.leads.update((items) => items.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      await this.selectLead({ ...selected.item, ...updated });
    } catch (error) {
      this.saveError.set(error instanceof Error ? error.message : "Could not save lead.");
    } finally {
      this.saving.set(false);
    }
  }

  async saveTask(form: TaskEditForm) {
    const selected = this.selectedDetail();
    if (selected?.kind !== "task") {
      return;
    }

    this.saving.set(true);
    this.saveError.set(null);
    try {
      const updated = await this.api.updateTask(selected.item.id, form);
      this.tasks.update((items) => items.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      this.queue.update((items) => items.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      this.selectedDetail.set({ kind: "task", item: { ...selected.item, ...updated } });
      await this.refresh();
    } catch (error) {
      this.saveError.set(error instanceof Error ? error.message : "Could not save task.");
    } finally {
      this.saving.set(false);
    }
  }

  private syncSelectedFromLists() {
    const selected = this.selectedDetail();
    if (!selected || selected.kind === "lead") {
      return;
    }

    if (selected.kind === "task") {
      const task = this.tasks().find((item) => item.id === selected.item.id) ?? this.queue().find((item) => item.id === selected.item.id);
      if (task) {
        this.selectedDetail.set({ kind: "task", item: task });
      }
    }

    if (selected.kind === "event") {
      const event = this.events().find((item) => item.id === selected.item.id);
      if (event) {
        this.selectedDetail.set({ kind: "event", item: event });
      }
    }
  }
}
