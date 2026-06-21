import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { WorkspaceMode } from "./models";

@Component({
  selector: "oc-demo-welcome-page",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="demo-welcome" aria-labelledby="demo-welcome-title">
      <div>
        <span class="eyebrow">Sample workspace</span>
        <h1 id="demo-welcome-title">{{ headline }}</h1>
        <p>{{ body }}</p>
        <div class="demo-welcome-actions">
          <button type="button" class="primary" (click)="showWorkflow.emit()">Show me the workflow</button>
          <button type="button" (click)="runLocally.emit()">Run locally with an assistant</button>
          <button type="button" (click)="explore.emit()">Explore sample data</button>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoWelcomePageComponent {
  @Input() mode: WorkspaceMode = "job_search";
  @Output() showWorkflow = new EventEmitter<void>();
  @Output() runLocally = new EventEmitter<void>();
  @Output() explore = new EventEmitter<void>();

  get headline() {
    return this.mode === "outreach"
      ? "Turn oXRM into your private assistant-ready outreach workspace."
      : "Turn oXRM into your private assistant-ready job-search workspace.";
  }

  get body() {
    if (this.mode === "outreach") {
      return "Run oXRM locally, then connect Codex, Claude, Gemini, Cursor, VS Code, or another MCP-capable assistant to review leads, prepare draft-only messages, and keep every follow-up moving while your data stays on your machine.";
    }
    return "Run oXRM locally, then connect Codex, Claude, Gemini, Cursor, VS Code, or another MCP-capable assistant to compare jobs with your CV, prepare tailored applications, and keep every follow-up moving while your data stays on your machine.";
  }
}
