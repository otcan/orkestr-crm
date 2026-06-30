import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { XrmRecord } from "./models";

type ApplicationDetailTab = "overview" | "documents" | "route" | "activity";

@Component({
  selector: "oc-job-application-detail",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="detail-tabs" aria-label="Application detail tabs">
      <button type="button" [class.active]="tab === 'overview'" (click)="tab = 'overview'">Overview</button>
      <button type="button" [class.active]="tab === 'documents'" (click)="tab = 'documents'">Documents</button>
      <button type="button" [class.active]="tab === 'route'" (click)="tab = 'route'">Route</button>
      <button type="button" [class.active]="tab === 'activity'" (click)="tab = 'activity'">Activity</button>
    </section>

    @if (tab === 'overview') {
      <section class="detail-section">
        <dl class="detail-kv">
          <div><dt>Role</dt><dd>{{ field("role", record.displayName) }}</dd></div>
          <div><dt>Company</dt><dd>{{ field("company") }}</dd></div>
          <div><dt>Stage</dt><dd>{{ human(field("stage", "Saved")) }}</dd></div>
          <div><dt>Fit</dt><dd>{{ fitField("fitRate", "0") }}</dd></div>
          <div><dt>Contact</dt><dd>{{ field("responsiblePerson", "No contact assigned") }}</dd></div>
          <div><dt>Next action</dt><dd>{{ field("nextAction", "Decide next step") }}</dd></div>
          <div><dt>Next-action date</dt><dd>{{ dateField("nextActionAt", "No due date") }}</dd></div>
        </dl>
      </section>
    }

    @if (tab === 'documents') {
      <section class="detail-section">
        <div class="document-row">
          <div>
            <span>CV</span>
            <strong>{{ field("cvVersion", "Not selected") }}</strong>
          </div>
          <button type="button" (click)="openCvLibrary.emit()">Change</button>
        </div>
        <div class="document-row">
          <div>
            <span>Cover letter</span>
            <strong>{{ field("coverLetterVersion", "Not prepared") }}</strong>
          </div>
          <button type="button">Create draft</button>
        </div>
        @if (field("cvVersion", "") === "") {
          <p class="detail-note warn">No CV is linked to this application. Choose a CV before applying, or continue only after reviewing the risk.</p>
        }
      </section>
    }

    @if (tab === 'route') {
      <section class="detail-section">
        <dl class="detail-kv">
          <div><dt>Application channel</dt><dd>{{ human(field("channel", "manual_research")) }}</dd></div>
          <div><dt>Target email</dt><dd>{{ field("targetEmail", "Not recorded") }}</dd></div>
          <div><dt>Target URL</dt><dd>{{ field("targetUrl", field("jobUrl", "Not recorded")) }}</dd></div>
          <div><dt>External platform</dt><dd>{{ field("externalPlatform", field("source", "Not recorded")) }}</dd></div>
          <div><dt>Application packet</dt><dd>{{ field("applicationPacketId", "No packet prepared") }}</dd></div>
          <div><dt>Submission confirmed</dt><dd>{{ booleanLabel(field("submissionConfirmed", "")) }}</dd></div>
          <div><dt>Last inbound</dt><dd>{{ dateField("lastInboundAt", "No inbound message") }}</dd></div>
          <div><dt>Last outbound</dt><dd>{{ dateField("lastOutboundAt", "No outbound action") }}</dd></div>
        </dl>
      </section>
    }

    @if (tab === 'activity') {
      <section class="detail-section">
        <p class="detail-note">Use the communication ledger to record confirmed applications, replies, interviews, rejections, and follow-ups. Nothing is sent automatically.</p>
        <div class="mini-list">
          @for (event of record.activities ?? []; track event.id) {
            <div class="mini-row">
              <strong>{{ event.subject || human(event.type) }}</strong>
              <span>{{ human(event.channel) }} · {{ human(event.direction) }}</span>
              <small>{{ event.occurredAt | date:'short' }}</small>
            </div>
          } @empty {
            <div class="empty">No application events recorded yet.</div>
          }
        </div>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobApplicationDetailComponent {
  @Input({ required: true }) record!: XrmRecord;
  @Output() openCvLibrary = new EventEmitter<void>();

  tab: ApplicationDetailTab = "overview";

  field(key: string, fallback = "-") {
    const value = this.record.fields?.[key];
    return value === undefined || value === null || value === "" ? fallback : String(value);
  }

  dateField(key: string, fallback = "-") {
    const value = this.field(key, "");
    if (!value) return fallback;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString([], { dateStyle: "medium" });
  }

  fitField(key: string, fallback = "0") {
    const value = this.field(key, fallback);
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? `${numberValue}%` : value;
  }

  booleanLabel(value: string) {
    if (!value) return "Unknown";
    return ["true", "yes", "1"].includes(value.toLowerCase()) ? "Yes" : "No";
  }

  human(value: unknown) {
    return String(value ?? "-").replace(/[_.-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}
