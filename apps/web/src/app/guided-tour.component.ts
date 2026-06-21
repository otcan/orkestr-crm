import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

interface TourStep {
  id: string;
  title: string;
  body: string;
  nav: string;
  target: string;
  action?: "open_ai";
  highlights: string[];
}

const JOB_STEPS: TourStep[] = [
  {
    id: "jobs",
    title: "Jobs",
    nav: "Jobs",
    target: "jobs-table",
    body: "This is your opportunity inbox. Search, filter, and decide which jobs are worth your time.",
    highlights: ["Jobs navigation", "One sample job", "Match indicator"]
  },
  {
    id: "application",
    title: "Application",
    nav: "Applications",
    target: "applications-board",
    body: "Start an application, attach the CV you want to use, and track the next action.",
    highlights: ["Start application", "Selected CV", "Application stage"]
  },
  {
    id: "today",
    title: "Today",
    nav: "Today",
    target: "today-actions",
    body: "oXRM turns applications into an actionable queue, so you always know what to do next.",
    highlights: ["Next actions", "Interview", "Follow-up"]
  },
  {
    id: "ai",
    title: "Assistant support",
    nav: "Today",
    target: "today-actions",
    action: "open_ai",
    body: "Codex, Claude, Gemini, Cursor, VS Code, or another MCP-capable assistant can read this context, compare a job against your CV, prepare drafts, and suggest next steps. Nothing is sent automatically.",
    highlights: ["Run locally", "Connect MCP", "Keep human approval"]
  }
];

const OUTREACH_STEPS: TourStep[] = [
  {
    id: "pipeline",
    title: "Pipeline",
    nav: "Pipeline",
    target: "pipeline-board",
    body: "This is your outreach pipeline. Search, filter, and decide who is worth contacting now.",
    highlights: ["Pipeline navigation", "One sample lead", "Stage lane"]
  },
  {
    id: "draft",
    title: "Draft",
    nav: "Pipeline",
    target: "pipeline-board",
    body: "Open a lead, review the draft, and decide whether the next action is ready.",
    highlights: ["Lead drawer", "Draft tab", "Needs review"]
  },
  {
    id: "today",
    title: "Today",
    nav: "Today",
    target: "today-actions",
    body: "oXRM turns outreach into an actionable queue, so you always know who needs contact or follow-up.",
    highlights: ["Next actions", "Reply received", "Follow-up"]
  },
  {
    id: "ai",
    title: "Assistant support",
    nav: "Today",
    target: "today-actions",
    action: "open_ai",
    body: "Codex, Claude, Gemini, Cursor, VS Code, or another MCP-capable assistant can read this context, summarize history, prepare drafts, and suggest next steps. Nothing is sent automatically.",
    highlights: ["Run locally", "Connect MCP", "Keep human approval"]
  }
];

@Component({
  selector: "oc-guided-tour",
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="tour-panel" aria-live="polite">
      <div class="tour-progress">{{ stepIndex + 1 }} of 4</div>
      <h2>{{ current.title }}</h2>
      <p>{{ current.body }}</p>
      <div class="tour-highlights">
        @for (highlight of current.highlights; track highlight) {
          <span>{{ highlight }}</span>
        }
      </div>
      <div class="tour-actions">
        <button type="button" [disabled]="stepIndex === 0" (click)="back()">Back</button>
        <button type="button" (click)="skip.emit()">Skip</button>
        @if (stepIndex < steps.length - 1) {
          <button type="button" class="primary" (click)="next()">Next</button>
        } @else {
          <button type="button" class="primary" (click)="finish.emit()">Today</button>
        }
      </div>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GuidedTourComponent implements OnInit {
  @Input() mode: "job_search" | "outreach" = "job_search";
  @Output() finish = new EventEmitter<void>();
  @Output() skip = new EventEmitter<void>();
  @Output() stepChange = new EventEmitter<{ index: number; step: TourStep }>();

  stepIndex = 0;

  get steps() {
    return this.mode === "outreach" ? OUTREACH_STEPS : JOB_STEPS;
  }

  get current(): TourStep {
    return this.steps[this.stepIndex] ?? this.steps[0]!;
  }

  ngOnInit() {
    this.emitStep();
  }

  next() {
    this.stepIndex = Math.min(this.stepIndex + 1, this.steps.length - 1);
    this.emitStep();
  }

  back() {
    this.stepIndex = Math.max(this.stepIndex - 1, 0);
    this.emitStep();
  }

  private emitStep() {
    this.stepChange.emit({ index: this.stepIndex, step: this.current });
  }
}
