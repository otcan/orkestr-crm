import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TaskEditForm, TaskRow, TaskStatus, TaskType } from "./models";

@Component({
  selector: "oc-task-detail",
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="detail-body">
      @if (!editing) {
        <dl class="detail-grid">
          <div><dt>Title</dt><dd>{{ task.title }}</dd></div>
          <div><dt>Status</dt><dd>{{ task.status }}</dd></div>
          <div><dt>Type</dt><dd>{{ task.type }}</dd></div>
          <div><dt>Priority</dt><dd>{{ task.priority }}</dd></div>
          <div><dt>Due</dt><dd>{{ task.dueAt ? (task.dueAt | date:'short') : "No due date" }}</dd></div>
          <div><dt>Lead</dt><dd>{{ task.lead?.fullName || "Unlinked" }}</dd></div>
          <div><dt>Person</dt><dd>{{ task.person?.fullName || "Unlinked" }}</dd></div>
          <div><dt>Company</dt><dd>{{ task.company?.name || "Unlinked" }}</dd></div>
          <div><dt>Created</dt><dd>{{ task.createdAt ? (task.createdAt | date:'short') : "Unknown" }}</dd></div>
          <div><dt>Updated</dt><dd>{{ task.updatedAt ? (task.updatedAt | date:'short') : "Unknown" }}</dd></div>
        </dl>

        <section class="detail-section">
          <h3>Description</h3>
          <p>{{ task.description || "No description." }}</p>
        </section>
      } @else {
        <div class="form-grid">
          <label>Title<input [(ngModel)]="form.title" name="taskTitle"></label>
          <label>
            Status
            <select [(ngModel)]="form.status" name="taskStatus">
              @for (status of statuses; track status) {
                <option [ngValue]="status">{{ status }}</option>
              }
            </select>
          </label>
          <label>
            Type
            <select [(ngModel)]="form.type" name="taskType">
              @for (type of types; track type) {
                <option [ngValue]="type">{{ type }}</option>
              }
            </select>
          </label>
          <label>Priority<input type="number" [(ngModel)]="form.priority" name="taskPriority"></label>
          <label>Due<input type="datetime-local" [(ngModel)]="form.dueAt" name="taskDueAt"></label>
          <label class="wide">Description<textarea [(ngModel)]="form.description" name="taskDescription"></textarea></label>
        </div>
      }
    </section>
  `
})
export class TaskDetailComponent implements OnChanges {
  private readonly changeDetector = inject(ChangeDetectorRef);

  @Input({ required: true }) task!: TaskRow;
  @Input() saving = false;
  @Output() saveTask = new EventEmitter<TaskEditForm>();

  readonly statuses: TaskStatus[] = ["open", "in_progress", "blocked", "done", "canceled"];
  readonly types: TaskType[] = ["outreach", "follow_up", "research", "data_cleanup", "approval", "manual"];
  editing = false;
  form: TaskEditForm = emptyTaskForm();

  ngOnChanges() {
    this.form = toTaskForm(this.task);
    this.editing = false;
  }

  edit() {
    this.form = toTaskForm(this.task);
    this.editing = true;
    this.changeDetector.markForCheck();
  }

  cancel() {
    this.form = toTaskForm(this.task);
    this.editing = false;
    this.changeDetector.markForCheck();
  }

  save() {
    this.saveTask.emit(this.form);
  }
}

function toTaskForm(task: TaskRow): TaskEditForm {
  return {
    title: task.title ?? "",
    description: task.description ?? "",
    status: task.status,
    type: task.type,
    priority: task.priority ?? 0,
    dueAt: task.dueAt ? task.dueAt.slice(0, 16) : ""
  };
}

function emptyTaskForm(): TaskEditForm {
  return {
    title: "",
    description: "",
    status: "open",
    type: "manual",
    priority: 0,
    dueAt: ""
  };
}
