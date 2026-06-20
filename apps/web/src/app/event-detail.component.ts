import { CommonModule, JsonPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { EventRow } from "./models";

@Component({
  selector: "oc-event-detail",
  standalone: true,
  imports: [CommonModule, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="detail-body">
      <dl class="detail-grid">
        <div><dt>Type</dt><dd>{{ label(event.type) }}</dd></div>
        <div><dt>Channel</dt><dd>{{ label(event.channel) }}</dd></div>
        <div><dt>Direction</dt><dd>{{ label(event.direction) }}</dd></div>
        <div><dt>Occurred</dt><dd>{{ event.occurredAt | date:'short' }}</dd></div>
        <div><dt>Record</dt><dd>{{ event.xrmRecord?.displayName || event.lead?.fullName || "None" }}</dd></div>
        <div><dt>Person</dt><dd>{{ event.person?.fullName || event.lead?.fullName || "None" }}</dd></div>
        <div><dt>Company</dt><dd>{{ event.company?.name || event.lead?.company || "None" }}</dd></div>
        <div><dt>Task</dt><dd>{{ event.task?.title || "None" }}</dd></div>
        <div><dt>External URL</dt><dd>{{ event.externalUrl || "None" }}</dd></div>
      </dl>

      <section class="detail-section">
        <h3>Subject</h3>
        <p>{{ event.subject || "No subject." }}</p>
      </section>

      <section class="detail-section">
        <h3>Body</h3>
        <p>{{ event.body || "No body." }}</p>
      </section>

      @if (knownMetadataEntries().length > 0) {
        <section class="detail-section">
          <h3>Outreach Fields</h3>
          <dl class="detail-grid">
            @for (entry of knownMetadataEntries(); track entry.label) {
              <div><dt>{{ entry.label }}</dt><dd>{{ entry.value }}</dd></div>
            }
          </dl>
        </section>
      }

      <details class="detail-section advanced-section">
        <summary>Advanced</summary>
        <dl class="detail-grid">
          <div><dt>Thread ID</dt><dd>{{ event.providerThreadId || "None" }}</dd></div>
          <div><dt>Message ID</dt><dd>{{ event.providerMessageId || "None" }}</dd></div>
          <div><dt>External ID</dt><dd>{{ event.externalId || "None" }}</dd></div>
        </dl>
        <pre>{{ event.metadata || {} | json }}</pre>
      </details>
    </section>
  `
})
export class EventDetailComponent {
  @Input({ required: true }) event!: EventRow;

  knownMetadataEntries() {
    const metadata = this.event.metadata ?? {};
    return [
      ["Source query", metadata.sourceQuery],
      ["Search page", metadata.searchPage],
      ["Audit directory", metadata.auditDirectory],
      ["LinkedIn result", metadata.linkedinResult],
      ["Row text", metadata.rowText],
      ["Profile URL", metadata.profileUrl],
      ["Note status", metadata.noteStatus],
      ["Proposed note", metadata.proposedNote]
    ]
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([label, value]) => ({ label: String(label), value: String(value) }));
  }

  label(value: string) {
    return value
      .replace(/[_.-]+/g, " ")
      .replace(/\s+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}
