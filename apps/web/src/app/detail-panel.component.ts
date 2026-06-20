import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { DetailSelection, EventRow, LeadEditForm, TaskEditForm, XrmRecordInput } from "./models";
import { EventDetailComponent } from "./event-detail.component";
import { LeadDetailComponent } from "./lead-detail.component";
import { TaskDetailComponent } from "./task-detail.component";
import { XrmRecordDetailComponent } from "./xrm-record-detail.component";

@Component({
  selector: "oc-detail-panel",
  standalone: true,
  imports: [CommonModule, EventDetailComponent, LeadDetailComponent, TaskDetailComponent, XrmRecordDetailComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="detail-panel" [class.empty-panel]="!selection">
      @if (selection) {
        <header>
          <div>
            <span>{{ kindLabel }}</span>
            <h2>{{ title }}</h2>
          </div>
          <div class="detail-actions">
            @if (selection.kind === "lead") {
              @if (leadDetail?.editing) {
                <button type="button" (click)="leadDetail?.cancel()">Cancel</button>
                <button type="button" class="primary" [disabled]="saving" (click)="leadDetail?.save()">Save</button>
              } @else {
                <button type="button" (click)="leadDetail?.edit()">Edit</button>
              }
            }

            @if (selection.kind === "task") {
              @if (taskDetail?.editing) {
                <button type="button" (click)="taskDetail?.cancel()">Cancel</button>
                <button type="button" class="primary" [disabled]="saving" (click)="taskDetail?.save()">Save</button>
              } @else {
                <button type="button" (click)="taskDetail?.edit()">Edit</button>
              }
            }

            <button type="button" (click)="close.emit()">Close</button>
          </div>
        </header>

        @if (loading) {
          <div class="detail-state">Loading detail...</div>
        }

        @if (error) {
          <div class="detail-state error">{{ error }}</div>
        }

        @if (saveError) {
          <div class="detail-state error">{{ saveError }}</div>
        }

        @switch (selection.kind) {
          @case ("lead") {
            <oc-lead-detail
              [lead]="selection.item"
              [activities]="leadActivities"
              [saving]="saving"
              (saveLead)="saveLead.emit($event)"
            />
          }
          @case ("task") {
            <oc-task-detail
              [task]="selection.item"
              [saving]="saving"
              (saveTask)="saveTask.emit($event)"
            />
          }
          @case ("event") {
            <oc-event-detail [event]="selection.item" />
          }
          @case ("record") {
            <oc-xrm-record-detail
              [record]="selection.item"
              [saving]="saving"
              (openRecord)="openRecord.emit($event)"
              (saveRecord)="saveRecord.emit($event)"
            />
          }
        }
      } @else {
        <div class="detail-empty">
          <h2>Select an item</h2>
          <p>Click a record, queue item, timeline event, or saved-view row to inspect it here.</p>
        </div>
      }
    </aside>
  `
})
export class DetailPanelComponent {
  @Input() selection: DetailSelection | null = null;
  @Input() leadActivities: EventRow[] = [];
  @Input() loading = false;
  @Input() saving = false;
  @Input() error: string | null = null;
  @Input() saveError: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saveLead = new EventEmitter<LeadEditForm>();
  @Output() saveTask = new EventEmitter<TaskEditForm>();
  @Output() saveRecord = new EventEmitter<XrmRecordInput>();
  @Output() openRecord = new EventEmitter<string>();

  @ViewChild(LeadDetailComponent) leadDetail?: LeadDetailComponent;
  @ViewChild(TaskDetailComponent) taskDetail?: TaskDetailComponent;

  get title() {
    const selection = this.selection;
    if (!selection) {
      return "";
    }
    if (selection.kind === "lead") {
      return selection.item.fullName;
    }
    if (selection.kind === "task") {
      return selection.item.title;
    }
    if (selection.kind === "record") {
      return selection.item.displayName;
    }
    return selection.item.subject || selection.item.type;
  }

  get kindLabel() {
    const selection = this.selection;
    if (!selection) {
      return "";
    }
    if (selection.kind === "record") {
      return selection.item.objectType?.label || "record";
    }
    if (selection.kind === "lead") {
      return "lead";
    }
    if (selection.kind === "task") {
      return "queue item";
    }
    return "timeline event";
  }
}
