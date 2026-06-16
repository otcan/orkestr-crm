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
        <div><dt>Type</dt><dd>{{ event.type }}</dd></div>
        <div><dt>Channel</dt><dd>{{ event.channel }}</dd></div>
        <div><dt>Direction</dt><dd>{{ event.direction }}</dd></div>
        <div><dt>Occurred</dt><dd>{{ event.occurredAt | date:'short' }}</dd></div>
        <div><dt>Lead</dt><dd>{{ event.lead?.fullName || event.leadId || "Unlinked" }}</dd></div>
        <div><dt>Task</dt><dd>{{ event.task?.title || event.taskId || "Unlinked" }}</dd></div>
        <div><dt>Thread ID</dt><dd>{{ event.providerThreadId || "None" }}</dd></div>
        <div><dt>Message ID</dt><dd>{{ event.providerMessageId || "None" }}</dd></div>
        <div><dt>External ID</dt><dd>{{ event.externalId || "None" }}</dd></div>
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

      <section class="detail-section">
        <h3>Metadata</h3>
        <pre>{{ event.metadata || {} | json }}</pre>
      </section>
    </section>
  `
})
export class EventDetailComponent {
  @Input({ required: true }) event!: EventRow;
}
