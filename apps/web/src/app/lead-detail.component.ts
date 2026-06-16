import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { EventRow, LeadEditForm, LeadRow } from "./models";

@Component({
  selector: "oc-lead-detail",
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="detail-body">
      @if (!editing) {
        <dl class="detail-grid">
          <div><dt>Name</dt><dd>{{ lead.fullName }}</dd></div>
          <div><dt>Company</dt><dd>{{ lead.company || "None" }}</dd></div>
          <div><dt>Title</dt><dd>{{ lead.title || "None" }}</dd></div>
          <div><dt>Email</dt><dd>{{ lead.email || "None" }}</dd></div>
          <div><dt>Phone</dt><dd>{{ lead.phone || "None" }}</dd></div>
          <div><dt>Location</dt><dd>{{ lead.location || "None" }}</dd></div>
          <div><dt>LinkedIn</dt><dd>{{ lead.linkedinUrl || "None" }}</dd></div>
          <div><dt>SalesNav</dt><dd>{{ lead.salesnavUrl || "None" }}</dd></div>
          <div><dt>Source</dt><dd>{{ lead.source || "None" }}</dd></div>
          <div><dt>Created</dt><dd>{{ lead.createdAt ? (lead.createdAt | date:'short') : "Unknown" }}</dd></div>
          <div><dt>Updated</dt><dd>{{ lead.updatedAt | date:'short' }}</dd></div>
        </dl>

        <section class="detail-section">
          <h3>Notes</h3>
          <p>{{ lead.notes || "No notes." }}</p>
        </section>
      } @else {
        <div class="form-grid">
          <label>Name<input [(ngModel)]="form.fullName" name="leadFullName"></label>
          <label>Company<input [(ngModel)]="form.company" name="leadCompany"></label>
          <label>Title<input [(ngModel)]="form.title" name="leadTitle"></label>
          <label>Email<input [(ngModel)]="form.email" name="leadEmail"></label>
          <label>Phone<input [(ngModel)]="form.phone" name="leadPhone"></label>
          <label>Location<input [(ngModel)]="form.location" name="leadLocation"></label>
          <label>LinkedIn URL<input [(ngModel)]="form.linkedinUrl" name="leadLinkedin"></label>
          <label>SalesNav URL<input [(ngModel)]="form.salesnavUrl" name="leadSalesnav"></label>
          <label>Source<input [(ngModel)]="form.source" name="leadSource"></label>
          <label class="wide">Notes<textarea [(ngModel)]="form.notes" name="leadNotes"></textarea></label>
        </div>
      }

      <section class="detail-section">
        <h3>Related Tasks</h3>
        <div class="mini-list">
          @for (task of lead.tasks || []; track task.id) {
            <div class="mini-row">
              <strong>{{ task.title }}</strong>
              <span>{{ task.status }} · {{ task.dueAt ? (task.dueAt | date:'short') : 'No due date' }}</span>
            </div>
          } @empty {
            <p>No linked tasks.</p>
          }
        </div>
      </section>

      <section class="detail-section">
        <h3>Recent Events</h3>
        <div class="mini-list">
          @for (event of activities; track event.id) {
            <div class="mini-row">
              <strong>{{ event.subject || event.type }}</strong>
              <span>{{ event.channel }} · {{ event.direction }} · {{ event.occurredAt | date:'short' }}</span>
            </div>
          } @empty {
            <p>No related events.</p>
          }
        </div>
      </section>
    </section>
  `
})
export class LeadDetailComponent implements OnChanges {
  private readonly changeDetector = inject(ChangeDetectorRef);

  @Input({ required: true }) lead!: LeadRow;
  @Input() activities: EventRow[] = [];
  @Input() saving = false;
  @Output() saveLead = new EventEmitter<LeadEditForm>();

  editing = false;
  form: LeadEditForm = emptyLeadForm();

  ngOnChanges() {
    this.form = toLeadForm(this.lead);
    this.editing = false;
  }

  edit() {
    this.form = toLeadForm(this.lead);
    this.editing = true;
    this.changeDetector.markForCheck();
  }

  cancel() {
    this.form = toLeadForm(this.lead);
    this.editing = false;
    this.changeDetector.markForCheck();
  }

  save() {
    this.saveLead.emit(this.form);
  }
}

function toLeadForm(lead: LeadRow): LeadEditForm {
  return {
    fullName: lead.fullName ?? "",
    company: lead.company ?? "",
    title: lead.title ?? "",
    email: lead.email ?? "",
    phone: lead.phone ?? "",
    location: lead.location ?? "",
    linkedinUrl: lead.linkedinUrl ?? "",
    salesnavUrl: lead.salesnavUrl ?? "",
    source: lead.source ?? "",
    notes: lead.notes ?? ""
  };
}

function emptyLeadForm(): LeadEditForm {
  return {
    fullName: "",
    company: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedinUrl: "",
    salesnavUrl: "",
    source: "",
    notes: ""
  };
}
