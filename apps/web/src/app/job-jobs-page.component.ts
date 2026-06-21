import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { allowedJobActions, type JobWorkflowActionKey, type JobWorkflowState } from "@oxrm/shared";
import { FilterBarComponent } from "./filter-bar.component";
import { FilterChange, FilterControl, PageResult } from "./models";

@Component({
  selector: "oc-job-jobs-page",
  standalone: true,
  imports: [CommonModule, FormsModule, FilterBarComponent],
  template: `
    <oc-filter-bar
      [search]="search"
      searchPlaceholder="Role, company, location"
      [controls]="controls"
      [total]="result.total"
      [shown]="result.shown"
      noun="jobs"
      primaryActionLabel="+ Add job"
      (searchChange)="searchChange.emit($event)"
      (filterChange)="filterChange.emit($event)"
      (clear)="clearFilters.emit()"
      (primaryAction)="add.emit()"
    />

    <section class="panel product-list-panel">
      <div class="table-wrap jobs-table-wrap">
        <table class="view-table jobs-table" data-tour-id="jobs-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Company</th>
              <th>Location</th>
              <th>Source</th>
              <th>Added</th>
              <th>Match</th>
              <th>Application</th>
              <th class="action-col">Action</th>
            </tr>
          </thead>
          <tbody>
            @for (row of result.items; track row['id']) {
              <tr class="clickable-row" [class.selected]="selectedId === text(row, 'id')" (click)="open.emit(row)">
                <td>
                  <strong>{{ text(row, 'title') }}</strong>
                  @if (isNew(row)) {
                    <span class="new-badge">New</span>
                  }
                  <small>{{ text(row, 'nextAction', 'Review posting') }}</small>
                </td>
                <td>{{ text(row, 'company') }}</td>
                <td>{{ text(row, 'location') }}</td>
                <td>{{ text(row, 'platform', text(row, 'source', 'Manual')) }}</td>
                <td><time [title]="exactDate(row)">{{ addedLabel(row) }}</time></td>
                <td>
                  <em [class.good]="fitTone(row) === 'good'" [class.warn]="fitTone(row) === 'warn'" [class.muted]="fitTone(row) === 'muted'">
                    {{ fitLabel(row) }}
                  </em>
                </td>
                <td>{{ workflow(row).applicationStage }}</td>
                <td class="action-col" (click)="$event.stopPropagation()">
                  <div class="row-action-cell">
                    <button
                      type="button"
                      class="primary compact"
                      data-tour-id="start-application"
                      (click)="runAction.emit({ row, action: workflow(row).primaryAction.key })"
                    >
                      {{ workflow(row).primaryAction.label }}
                    </button>
                    @if (workflow(row).secondaryActions.length) {
                      <details class="overflow-menu">
                        <summary aria-label="More actions">...</summary>
                        <div>
                          @for (action of workflow(row).secondaryActions; track action.key) {
                            <button type="button" (click)="runAction.emit({ row, action: action.key })">
                              {{ action.label }}
                            </button>
                          }
                        </div>
                      </details>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (!result.items.length) {
        <div class="empty subtle">
          <p>No jobs match these filters.</p>
          <button type="button" (click)="clearFilters.emit()">Clear filters</button>
        </div>
      } @else if (result.pageCount > 1 || result.total > result.pageSize) {
        <footer class="pagination-bar">
          <span>{{ result.shown === result.total ? result.total + ' jobs' : result.shown + ' of ' + result.total + ' jobs' }}</span>
          <div>
            <button type="button" [disabled]="result.page <= 1" (click)="pageChange.emit(result.page - 1)">Previous</button>
            @for (page of pageNumbers(); track page) {
              <button type="button" [class.active]="page === result.page" (click)="pageChange.emit(page)">{{ page }}</button>
            }
            <button type="button" [disabled]="!result.hasNext" (click)="pageChange.emit(result.page + 1)">Next</button>
          </div>
          <label>
            <select [ngModel]="result.pageSize" (ngModelChange)="pageSizeChange.emit(Number($event))" name="jobPageSize">
              <option [ngValue]="25">25 per page</option>
              <option [ngValue]="50">50 per page</option>
              <option [ngValue]="100">100 per page</option>
            </select>
          </label>
        </footer>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobJobsPageComponent {
  @Input() search = "";
  @Input() controls: FilterControl[] = [];
  @Input() result: PageResult<Record<string, unknown>> = {
    items: [],
    total: 0,
    shown: 0,
    page: 1,
    pageSize: 25,
    pageCount: 1,
    start: 0,
    end: 0,
    hasNext: false
  };
  @Input() workflowById: Record<string, JobWorkflowState> = {};
  @Input() selectedId = "";
  @Output() searchChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<FilterChange>();
  @Output() clearFilters = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() add = new EventEmitter<void>();
  @Output() open = new EventEmitter<Record<string, unknown>>();
  @Output() runAction = new EventEmitter<{ row: Record<string, unknown>; action: JobWorkflowActionKey }>();

  readonly Number = Number;

  text(row: Record<string, unknown>, key: string, fallback = "-") {
    const value = row[key];
    return value === undefined || value === null || value === "" ? fallback : String(value);
  }

  fitRate(row: Record<string, unknown>) {
    const value = Number(row["fitRate"] ?? 0);
    return Number.isFinite(value) ? value : 0;
  }

  fitLabel(row: Record<string, unknown>) {
    const value = this.fitRate(row);
    if (value >= 85) return "Strong match";
    if (value >= 65) return "Possible match";
    if (value > 0) return "Weak match";
    return "Not assessed";
  }

  fitTone(row: Record<string, unknown>) {
    const value = this.fitRate(row);
    if (value >= 85) return "good";
    if (value >= 65) return "warn";
    return "muted";
  }

  human(value: unknown) {
    return String(value ?? "-").replace(/[_.-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  addedDate(row: Record<string, unknown>) {
    return String(row["discoveredAt"] || row["publishedAt"] || row["createdAt"] || "");
  }

  addedLabel(row: Record<string, unknown>) {
    const value = this.addedDate(row);
    if (!value) return "Unknown";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const diff = Math.round((today - day) / 86_400_000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  exactDate(row: Record<string, unknown>) {
    const value = this.addedDate(row);
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString([], { dateStyle: "long", timeStyle: "short" });
  }

  isNew(row: Record<string, unknown>) {
    return this.workflow(row).isNew;
  }

  workflow(row: Record<string, unknown>) {
    return this.workflowById[this.text(row, "id", "")] ?? allowedJobActions(row);
  }

  pageNumbers() {
    const count = this.result.pageCount;
    const current = this.result.page;
    const start = Math.max(1, current - 2);
    const end = Math.min(count, start + 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }
}
