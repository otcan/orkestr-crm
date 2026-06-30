import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { FilterBarComponent } from "./filter-bar.component";

@Component({
  selector: "oc-job-xrm-list-page",
  standalone: true,
  imports: [CommonModule, FilterBarComponent],
  template: `
    <oc-filter-bar
      [search]="search"
      [searchPlaceholder]="searchPlaceholder"
      [controls]="[]"
      [total]="rows.length"
      [shown]="visibleRows().length"
      [noun]="noun"
      [primaryActionLabel]="primaryActionLabel"
      (searchChange)="searchChange.emit($event)"
      (clear)="searchChange.emit('')"
      (primaryAction)="add.emit()"
    />

    <section class="panel product-list-panel">
      <div class="table-wrap">
        <table class="view-table">
          <thead>
            <tr>
              @for (column of columns; track column) {
                <th>
                  <button type="button" class="table-sort-button" (click)="toggleSort(column)">
                    {{ label(column) }}
                    @if (sortKey === column) {
                      <span>{{ sortDirection === 'asc' ? 'ASC' : 'DESC' }}</span>
                    }
                  </button>
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of visibleRows(); track rowId(row)) {
              <tr class="clickable-row" [class.selected]="selectedId === rowId(row)" (click)="open.emit(row)">
                @for (column of columns; track column) {
                  <td>
                    @if (isUrl(row[column])) {
                      <a [href]="cellText(row, column)" target="_blank" rel="noreferrer" (click)="$event.stopPropagation()">
                        {{ compactUrl(row[column]) }}
                      </a>
                    } @else if (isDate(column, row[column])) {
                      <time [title]="cellText(row, column)">{{ dateLabel(row[column]) }}</time>
                    } @else {
                      {{ cellText(row, column) }}
                    }
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (!visibleRows().length) {
        <div class="empty subtle">{{ emptyText }}</div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobXrmListPageComponent {
  @Input() title = "";
  @Input() search = "";
  @Input() searchPlaceholder = "Search";
  @Input() rows: Array<Record<string, unknown>> = [];
  @Input() columns: string[] = [];
  @Input() selectedId = "";
  @Input() noun = "records";
  @Input() primaryActionLabel = "+ Add";
  @Input() emptyText = "No records yet.";
  @Output() searchChange = new EventEmitter<string>();
  @Output() add = new EventEmitter<void>();
  @Output() open = new EventEmitter<Record<string, unknown>>();

  sortKey = "";
  sortDirection: "asc" | "desc" = "asc";

  visibleRows() {
    const query = this.search.trim().toLowerCase();
    const filtered = query
      ? this.rows.filter((row) => JSON.stringify(row).toLowerCase().includes(query))
      : this.rows;
    const key = this.sortKey || this.columns[0] || "";
    if (!key) return filtered;
    return [...filtered].sort((left, right) => {
      const comparison = this.compare(left[key], right[key]);
      return this.sortDirection === "desc" ? -comparison : comparison;
    });
  }

  toggleSort(column: string) {
    if (this.sortKey === column) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
      return;
    }
    this.sortKey = column;
    this.sortDirection = "asc";
  }

  rowId(row: Record<string, unknown>) {
    return String(row["id"] ?? row["_id"] ?? row["externalKey"] ?? JSON.stringify(row));
  }

  label(column: string) {
    return column.replace(/[_.-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  cellText(row: Record<string, unknown>, column: string) {
    const value = row[column];
    if (value === undefined || value === null || value === "") return "-";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  }

  isUrl(value: unknown) {
    return typeof value === "string" && /^https?:\/\//i.test(value);
  }

  compactUrl(value: unknown) {
    if (typeof value !== "string") return "-";
    return value.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  }

  isDate(column: string, value: unknown) {
    return typeof value === "string" && /(At|Date|received|created|updated|submitted|evaluated)$/i.test(column) && !Number.isNaN(new Date(value).getTime());
  }

  dateLabel(value: unknown) {
    if (typeof value !== "string") return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString([], { dateStyle: "medium" });
  }

  private compare(left: unknown, right: unknown) {
    const leftNumber = Number(left);
    const rightNumber = Number(right);
    if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
      return leftNumber - rightNumber;
    }
    const leftDate = typeof left === "string" ? new Date(left).getTime() : Number.NaN;
    const rightDate = typeof right === "string" ? new Date(right).getTime() : Number.NaN;
    if (!Number.isNaN(leftDate) && !Number.isNaN(rightDate)) {
      return leftDate - rightDate;
    }
    return String(left ?? "").localeCompare(String(right ?? ""));
  }
}
