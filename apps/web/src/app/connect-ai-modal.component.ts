import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal } from "@angular/core";

const START_COMMAND = `git clone https://github.com/otcan/oxrm.git
cd oxrm
./oxrm init personal --template job-search --ports auto`;

const CONNECT_ASSISTANT = `./oxrm -i personal urls
./oxrm -i personal doctor`;

const OPTIONAL_CODEX_CHECK = `./oxrm -i personal doctor --codex
codex --version`;

const STARTER_PROMPT = `You are helping me operate my local oXRM workspace.

First inspect the local web/API/MCP URLs.
Then read today's queue and the job-search views.
Summarize what oXRM stores, what needs attention, and which records are linked.

For job search:
- inspect job postings, job-fit records, applications, CV versions, cover letters, tasks, and events
- compare promising jobs against the linked CV/context
- propose next actions and draft application or follow-up text

Do not send anything.
Do not apply to jobs, email recruiters, upload CVs, or take external actions.
Ask before modifying local records.`;

@Component({
  selector: "oc-connect-ai-modal",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <section class="modal ai-modal" (click)="$event.stopPropagation()" role="dialog" aria-modal="true" aria-labelledby="connect-ai-title">
        <header>
          <div>
            <h2 id="connect-ai-title">Run locally with an assistant</h2>
            <p>Use the public demo to learn the workflow. Run your own local oXRM workspace before connecting Codex, Claude, Gemini, Cursor, VS Code, or another MCP-capable assistant.</p>
          </div>
          <button type="button" (click)="close.emit()">Close</button>
        </header>

        <section class="copy-panel">
          <div>
            <h3>1. Start oXRM</h3>
            <button type="button" (click)="copy(START_COMMAND)">Copy command</button>
          </div>
          <pre>{{ START_COMMAND }}</pre>
        </section>

        <section class="copy-panel">
          <div>
            <h3>2. Get local endpoints</h3>
            <button type="button" (click)="copy(CONNECT_ASSISTANT)">Copy command</button>
          </div>
          <pre>{{ CONNECT_ASSISTANT }}</pre>
        </section>

        <section class="copy-panel">
          <div>
            <h3>3. Connect your assistant</h3>
            <button type="button" (click)="copy(OPTIONAL_CODEX_CHECK)">Copy Codex check</button>
          </div>
          <p class="copy-help">
            Register the MCP endpoint printed by <code>./oxrm -i personal urls</code> in your assistant. Use Codex, Claude, Gemini, Cursor, VS Code, or any tool that can call local MCP/HTTP tools. Codex users can run:
          </p>
          <pre>{{ OPTIONAL_CODEX_CHECK }}</pre>
        </section>

        <section class="copy-panel">
          <div>
            <h3>Starter prompt</h3>
            <button type="button" (click)="copy(STARTER_PROMPT)">Copy prompt</button>
          </div>
          <pre>{{ STARTER_PROMPT }}</pre>
        </section>

        <p class="modal-note">
          The shared public demo is read-only guidance. Real assistant work should happen on your own local instance, with human approval before external actions.
        </p>

        @if (copied()) {
          <div class="toast inline">Copied</div>
        }
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnectAiModalComponent {
  @Output() close = new EventEmitter<void>();
  readonly copied = signal(false);
  readonly START_COMMAND = START_COMMAND;
  readonly CONNECT_ASSISTANT = CONNECT_ASSISTANT;
  readonly OPTIONAL_CODEX_CHECK = OPTIONAL_CODEX_CHECK;
  readonly STARTER_PROMPT = STARTER_PROMPT;

  async copy(value: string) {
    await navigator.clipboard?.writeText(value).catch(() => undefined);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1800);
  }
}
