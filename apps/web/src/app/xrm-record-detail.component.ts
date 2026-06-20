import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { XrmRecord, XrmRecordInput, XrmRelationshipRow } from "./models";

@Component({
  selector: "oc-xrm-record-detail",
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="detail-body xrm-detail">
      @if (isActionSuggestion()) {
        <section class="detail-section suggestion-hero">
          <div>
            <span class="suggestion-status">{{ fieldValue("status") }}</span>
            <h3>{{ fieldValue("title") }}</h3>
            <p>{{ fieldValue("recommendedAction") }}</p>
          </div>
          <dl class="decision-grid">
            <div>
              <dt>Target</dt>
              <dd>{{ fieldValue("targetRecord") }}</dd>
            </div>
            <div>
              <dt>Record type</dt>
              <dd>{{ fieldValue("targetObjectType") }}</dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd>{{ suggestionConfidence() }}</dd>
            </div>
            <div>
              <dt>Due</dt>
              <dd>{{ fieldValue("dueAt") }}</dd>
            </div>
            <div class="wide">
              <dt>Approval</dt>
              <dd>{{ fieldValue("approvalRequired") }}</dd>
            </div>
          </dl>
        </section>

        <section class="detail-section explanation-card">
          <h3>Why This Is Suggested</h3>
          <p>{{ fieldValue("reason") }}</p>
        </section>

        <section class="detail-section draft-card">
          <h3>Draft / Output</h3>
          <p>{{ fieldValue("draftOutput") }}</p>
        </section>

        <section class="detail-section human-control-card">
          <h3>Human Decision Needed</h3>
          <div class="decision-steps">
            <span>Inspect the linked target record.</span>
            <span>Review the reason and draft output.</span>
            <span>Approve, edit, archive, or create a task. Nothing is sent automatically.</span>
          </div>
        </section>

        <section class="detail-section">
          <h3>Linked Context</h3>
          <div class="relationship-grid">
            @for (relationship of prioritizedRelationships(); track relationship.id) {
              <button type="button" class="relationship-card linked-record" [disabled]="!relationship.recordId" (click)="openRecord.emit(relationship.recordId)">
                <span>{{ relationshipRole(relationship) }}</span>
                <strong>{{ relationship.name }}</strong>
                <small>{{ relationship.type }}</small>
              </button>
            } @empty {
              <div class="empty">No linked context.</div>
            }
          </div>
        </section>

        <details class="detail-section advanced-section">
          <summary>Raw XRM fields</summary>
          <div class="mini-list">
            @for (field of fieldEntries(); track field.key) {
              <div class="mini-row">
                <strong>{{ field.label }}</strong>
                <span>{{ formatValue(field.value) }}</span>
              </div>
            }
          </div>
        </details>
      } @else {
        @if (isDocumentRecord()) {
          <section class="detail-section document-editor-card">
            <header>
              <div>
                <h3>Document Editor</h3>
                <p>Edit the structured local draft and the instructions an agent should use before creating a new version.</p>
              </div>
              <div class="header-actions">
                @if (documentEditing) {
                  <button type="button" (click)="cancelDocumentEdit()">Cancel</button>
                  <button type="button" class="primary" [disabled]="saving" (click)="saveDocumentEdit()">Save</button>
                } @else {
                  <button type="button" (click)="startDocumentEdit()">Edit</button>
                }
              </div>
            </header>

            @if (documentEditing) {
              <div class="document-editor-grid">
                @for (field of documentEditorFields(); track field.key) {
                  <label [class.wide]="field.kind === 'long'">
                    {{ field.label }}
                    @if (field.kind === 'long') {
                      <textarea
                        [ngModel]="documentDraft[field.key] || ''"
                        (ngModelChange)="setDocumentDraftField(field.key, $event)"
                        [name]="'document-editor-' + field.key"
                      ></textarea>
                    } @else {
                      <input
                        [ngModel]="documentDraft[field.key] || ''"
                        (ngModelChange)="setDocumentDraftField(field.key, $event)"
                        [name]="'document-editor-' + field.key"
                      >
                    }
                  </label>
                }
              </div>
            } @else {
              <div class="document-preview-grid">
                <div>
                  <span>Editable source</span>
                  <strong>{{ fieldValue("sourcePath") !== "-" ? fieldValue("sourcePath") : fieldValue("url") }}</strong>
                </div>
                <div>
                  <span>Output path</span>
                  <strong>{{ fieldValue("outputPath") }}</strong>
                </div>
                <div class="wide">
                  <span>Agent instructions</span>
                  <p>{{ fieldValue("editorInstructions") }}</p>
                </div>
                <div class="wide">
                  <span>Draft body</span>
                  <pre>{{ fieldValue("body") }}</pre>
                </div>
              </div>
            }
          </section>
        }

        <section class="detail-section record-dossier">
          <h3>Record Details</h3>
          <div class="dossier-grid">
            <div>
              <span>Object type</span>
              <strong>{{ objectTypeLabel() }}</strong>
            </div>
            <div>
              <span>Template</span>
              <strong>{{ templateLabel() }}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{{ formatValue(record.status) }}</strong>
            </div>
          </div>
        </section>

        <section class="detail-section">
          <h3>Template Summary</h3>
          <div class="summary-grid">
            @for (field of summaryEntries(); track field.key) {
              <div>
                <span>{{ field.label }}</span>
                <strong>{{ formatValue(field.value) }}</strong>
              </div>
            } @empty {
              <div class="empty">No summary fields.</div>
            }
          </div>
        </section>

        @if (hasNextAction()) {
          <section class="detail-section next-action-card">
            <h3>Next Action</h3>
            <p>{{ fieldValue("nextAction") }}</p>
            @if (fieldValue("nextActionAt") !== "-") {
              <small>Due {{ fieldValue("nextActionAt") }}</small>
            }
          </section>
        }

        <section class="detail-section">
          <h3>Record Fields</h3>
          <div class="mini-list">
            @for (field of fieldEntries(); track field.key) {
              <div class="mini-row">
                <strong>{{ field.label }}</strong>
                @if (isUrl(field.value)) {
                  <a [href]="field.value" target="_blank" rel="noreferrer">{{ field.value }}</a>
                } @else {
                  <span>{{ formatValue(field.value) }}</span>
                }
                @if (field.semanticLabel) {
                  <small>{{ field.semanticLabel }}</small>
                }
              </div>
            } @empty {
              <div class="empty">No fields.</div>
            }
          </div>
        </section>

        <section class="detail-section">
          <h3>Relationships</h3>
          <div class="mini-list">
            @for (relationship of nonDocumentRelationships(); track relationship.id) {
              <button type="button" class="mini-row linked-record" [disabled]="!relationship.recordId" (click)="openRecord.emit(relationship.recordId)">
                <strong>{{ relationship.label }}</strong>
                <span>{{ relationship.name }}</span>
                <small>{{ relationship.type }}</small>
              </button>
            } @empty {
              <div class="empty">No linked records.</div>
            }
          </div>
        </section>

        <section class="detail-section">
          <h3>Documents</h3>
          <div class="mini-list">
            @for (document of documents(); track document.id) {
              @if (document.recordId) {
                <button type="button" class="mini-row linked-record" (click)="openRecord.emit(document.recordId)">
                  <strong>{{ document.name }}</strong>
                  <span>{{ document.type }}</span>
                  <small>{{ document.label }}</small>
                </button>
              } @else {
                <div class="mini-row file-row">
                  <strong>{{ document.name }}</strong>
                  <span>{{ document.type }}</span>
                  @if (isUrl(document.filePath)) {
                    <a [href]="document.filePath" target="_blank" rel="noreferrer">{{ document.filePath }}</a>
                  } @else {
                    <small>{{ document.filePath }}</small>
                  }
                </div>
              }
            } @empty {
              <div class="empty">No linked documents.</div>
            }
          </div>
        </section>

        <section class="detail-section">
          <h3>Work Queue</h3>
          <div class="mini-list">
            @for (task of record.tasks ?? []; track task.id) {
              <div class="mini-row">
                <strong>{{ task.title }}</strong>
                <span>{{ task.status }} · {{ task.type }} · priority {{ task.priority }}</span>
                <small>{{ task.dueAt ? (task.dueAt | date:'short') : 'No due date' }}</small>
              </div>
            } @empty {
              <div class="empty">No linked work.</div>
            }
          </div>
        </section>

        <section class="detail-section">
          <h3>{{ activityHeading() }}</h3>
          <div class="mini-list">
            @for (event of record.activities ?? []; track event.id) {
              <div class="mini-row">
                <strong>{{ event.subject || event.type }}</strong>
                <span>{{ event.channel }} · {{ event.direction }} · {{ event.occurredAt | date:'short' }}</span>
                @if (event.body) {
                  <small>{{ event.body }}</small>
                }
              </div>
            } @empty {
              <div class="empty">No timeline events.</div>
            }
          </div>
        </section>

        <details class="detail-section advanced-section">
          <summary>Advanced</summary>
          <div class="mini-list">
            <div class="mini-row">
              <strong>Source</strong>
              <span>{{ record.source || "local" }}</span>
            </div>
            @if (record.externalKey) {
              <div class="mini-row">
                <strong>External key</strong>
                <span>{{ record.externalKey }}</span>
              </div>
            }
            @for (mapping of fieldMappings(); track mapping.id) {
              <div class="mini-row">
                <strong>{{ mapping.semanticField?.label || mapping.fieldKey }}</strong>
                <span>{{ mapping.fieldKey }}</span>
                <small>{{ mapping.semanticField?.key || 'unmapped' }} · confidence {{ mapping.confidence }}</small>
              </div>
            }
          </div>
        </details>
      }
    </div>
  `
})
export class XrmRecordDetailComponent implements OnChanges {
  @Input({ required: true }) record!: XrmRecord;
  @Input() saving = false;
  @Output() openRecord = new EventEmitter<string>();
  @Output() saveRecord = new EventEmitter<XrmRecordInput>();

  documentEditing = false;
  documentDraft: Record<string, string> = {};

  ngOnChanges(changes: SimpleChanges) {
    if (changes["record"]) {
      this.cancelDocumentEdit();
    }
  }

  fieldEntries() {
    const definitions = new Map((this.record.objectType?.fields ?? []).map((field) => [field.key, field]));
    const mappings = new Map((this.record.objectType?.fieldMappings ?? []).map((mapping) => [mapping.fieldKey, mapping.semanticField?.label ?? mapping.semanticField?.key]));
    return Object.entries(this.record.fields ?? {}).map(([key, value]) => ({
      key,
      label: definitions.get(key)?.label ?? this.columnLabel(key),
      value,
      semanticLabel: mappings.get(key),
      displayOrder: definitions.get(key)?.displayOrder ?? 999
    })).sort((a, b) => a.displayOrder - b.displayOrder || a.label.localeCompare(b.label));
  }

  fieldMappings() {
    return [...(this.record.objectType?.fieldMappings ?? [])].sort((a, b) => a.fieldKey.localeCompare(b.fieldKey));
  }

  isActionSuggestion() {
    return this.record.objectType?.slug === "action_suggestion";
  }

  isDocumentRecord() {
    return ["cv_version", "cv_template", "cover_letter", "cover_letter_template", "document"].includes(this.record.objectType?.slug ?? "");
  }

  documentEditorFields() {
    const keys = [
      "title",
      "version",
      "company",
      "derivedFor",
      "focus",
      "summary",
      "notes",
      "sourcePath",
      "outputPath",
      "url",
      "editorInstructions",
      "body"
    ];
    const labels = new Map((this.record.objectType?.fields ?? []).map((field) => [field.key, field.label]));
    const existingKeys = new Set(Object.keys(this.record.fields ?? {}));
    return keys
      .filter((key) => existingKeys.has(key) || ["sourcePath", "outputPath", "editorInstructions", "body"].includes(key))
      .map((key) => ({
        key,
        label: labels.get(key) ?? this.columnLabel(key),
        kind: ["body", "editorInstructions", "summary", "notes", "focus"].includes(key) ? "long" : "short"
      }));
  }

  startDocumentEdit() {
    this.documentDraft = Object.fromEntries(
      this.documentEditorFields().map((field) => [field.key, this.rawFieldValue(field.key)])
    );
    this.documentEditing = true;
  }

  cancelDocumentEdit() {
    this.documentEditing = false;
    this.documentDraft = {};
  }

  setDocumentDraftField(key: string, value: string) {
    this.documentDraft = { ...this.documentDraft, [key]: value };
  }

  saveDocumentEdit() {
    const objectType = this.record.objectType?.slug;
    if (!objectType) {
      return;
    }
    const input: XrmRecordInput = {
      objectType,
      recordId: this.record.id,
      displayName: this.documentDraft["title"] || this.record.displayName,
      fields: {
        ...(this.record.fields ?? {}),
        ...this.documentDraft,
        lastEditedAt: new Date().toISOString()
      },
      status: this.record.status
    };
    if (this.record.externalKey) {
      input.externalKey = this.record.externalKey;
    }
    if (this.record.source) {
      input.source = this.record.source;
    }
    if (this.record.metadata) {
      input.metadata = this.record.metadata;
    }
    this.saveRecord.emit(input);
    this.documentEditing = false;
  }

  suggestionConfidence() {
    const value = this.record.fields?.["confidence"];
    if (value === undefined || value === null || value === "") {
      return "-";
    }
    return `${value}%`;
  }

  relationships() {
    const source = (this.record.sourceRelationships ?? []).map((relationship) => this.describeRelationship(relationship, "source"));
    const target = (this.record.targetRelationships ?? []).map((relationship) => this.describeRelationship(relationship, "target"));
    return [...source, ...target];
  }

  documents() {
    const linkedRecords = this.relationships()
      .filter((relationship) => this.isDocumentRelationship(relationship))
      .map((relationship) => ({ ...relationship, filePath: "" }));
    const files = (this.record.files ?? []).map((file) => ({
      id: file.id,
      recordId: "",
      label: file.path,
      name: file.title,
      type: file.kind,
      typeSlug: file.mimeType || "file",
      filePath: file.path
    }));
    return [...files, ...linkedRecords];
  }

  nonDocumentRelationships() {
    return this.relationships().filter((relationship) => !this.isDocumentRelationship(relationship));
  }

  prioritizedRelationships() {
    const rank = (relationship: ReturnType<XrmRecordDetailComponent["relationships"]>[number]) => {
      const label = relationship.label.toLowerCase();
      const type = relationship.typeSlug.toLowerCase();
      if (type === "job" || type === "application") return 0;
      if (type === "action_blueprint") return 1;
      if (type === "approval_request") return 2;
      if (type === "action_run") return 3;
      if (label.includes("approval")) return 2;
      return 9;
    };
    return [...this.nonDocumentRelationships()].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
  }

  relationshipRole(relationship: ReturnType<XrmRecordDetailComponent["relationships"]>[number]) {
    const type = relationship.typeSlug.toLowerCase();
    if (type === "job" || type === "application") {
      return "Target";
    }
    if (type === "action_blueprint") {
      return "Blueprint";
    }
    if (type === "approval_request") {
      return "Approval";
    }
    if (type === "action_run") {
      return "Run";
    }
    return this.formatValue(relationship.label);
  }

  objectTypeLabel() {
    return this.record.objectType?.label || this.record.objectType?.slug || "Record";
  }

  templateLabel() {
    return this.columnLabel(this.record.objectType?.templateKey || "local");
  }

  summaryEntries() {
    const slug = this.record.objectType?.slug || "";
    const summaryFields = [...(this.record.objectType?.fields ?? [])]
      .filter((field) => field.summaryRank !== undefined && field.summaryRank !== null)
      .sort((a, b) => (a.summaryRank ?? 999) - (b.summaryRank ?? 999))
      .map((field) => field.key);
    const preferred = slug === "application"
      ? ["role", "company", "stage", "fitRate", "responsiblePerson", "cvVersion", "coverLetterVersion", "lastTouchAt"]
      : slug === "job"
        ? ["title", "company", "platform", "fitRate", "applicationStage", "nextActionAt"]
        : slug === "job_fit"
          ? ["title", "fitRate", "recommendedAction", "evaluatedAt", "fitSummary", "riskNotes"]
          : slug === "job_alert"
            ? ["title", "source", "receivedAt", "status"]
            : slug === "cv_version" || slug === "cover_letter"
              ? ["title", "version", "baseTemplate", "derivedFor", "company", "focus", "summary"]
              : slug === "cv_template" || slug === "cover_letter_template"
                ? ["title", "version", "focus", "tone", "notes"]
                : slug === "action_blueprint"
                  ? ["title", "appliesToViewKey", "appliesToObjectType", "automationLevel", "approvalRequired", "riskLevel"]
                  : slug === "action_suggestion"
                    ? ["title", "targetRecord", "status", "priority", "confidence", "approvalRequired", "dueAt"]
                    : slug === "action_run"
                      ? ["title", "blueprint", "mode", "status", "startedAt", "finishedAt"]
                      : slug === "approval_request"
                        ? ["title", "status", "owner", "requestedAt", "requestedAction", "decision"]
                        : summaryFields.length > 0
                          ? summaryFields
                          : Object.keys(this.record.fields ?? {}).slice(0, 6);

    const labels = new Map((this.record.objectType?.fields ?? []).map((field) => [field.key, field.label]));
    return preferred
      .filter((key) => this.record.fields?.[key] !== undefined && this.record.fields?.[key] !== "")
      .map((key) => ({
        key,
        label: labels.get(key) ?? this.columnLabel(key),
        value: this.record.fields[key]
      }));
  }

  hasNextAction() {
    return Boolean(this.record.fields?.["nextAction"] || this.record.fields?.["nextActionAt"]);
  }

  activityHeading() {
    return this.record.objectType?.slug === "application" ? "Communication Ledger" : "Timeline";
  }

  isUrl(value: unknown): value is string {
    return typeof value === "string" && /^https?:\/\//.test(value);
  }

  formatValue(value: unknown) {
    if (value === undefined || value === null || value === "") {
      return "-";
    }
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      return new Date(value).toLocaleString();
    }
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    const text = String(value);
    if (/^https?:\/\//.test(text)) {
      return text;
    }
    if (text.length <= 64 && /^[a-z0-9]+(?:[_-][a-z0-9]+)+$/.test(text)) {
      return text
        .replace(/[_.-]+/g, " ")
        .replace(/\s+/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
    }
    return text;
  }

  fieldValue(key: string) {
    return this.formatValue(this.record.fields?.[key]);
  }

  private rawFieldValue(key: string) {
    const value = this.record.fields?.[key];
    if (value === undefined || value === null) {
      return "";
    }
    return typeof value === "string" ? value : JSON.stringify(value, null, 2);
  }

  private describeRelationship(relationship: XrmRelationshipRow, direction: "source" | "target") {
    const other = direction === "source" ? relationship.targetRecord : relationship.sourceRecord;
    const label =
      direction === "source"
        ? relationship.relationshipType?.label
        : relationship.relationshipType?.inverseLabel || relationship.relationshipType?.label;

    return {
      id: relationship.id,
      recordId: other?.id || "",
      label: label || "linked to",
      name: other?.displayName || "Unknown record",
      type: other?.objectType?.label || other?.objectType?.slug || "record",
      typeSlug: other?.objectType?.slug || ""
    };
  }

  private isDocumentRelationship(relationship: ReturnType<XrmRecordDetailComponent["relationships"]>[number]) {
    const text = `${relationship.label} ${relationship.name} ${relationship.type} ${relationship.typeSlug}`.toLowerCase();
    return text.includes("cv") || text.includes("cover") || text.includes("document");
  }

  private columnLabel(column: string) {
    return column
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/[_.-]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}
