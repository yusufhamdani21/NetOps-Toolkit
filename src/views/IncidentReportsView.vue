<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-surface-100">Incident Reports</h2>
      <p class="text-sm text-surface-400 mt-1">Create and manage network incident reports</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card p-5">
        <h3 class="text-base font-semibold text-surface-100 mb-4">{{ editingId ? "Edit" : "New" }} Incident Report</h3>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label class="label">Incident Title</label>
            <input v-model="form.title" type="text" class="input" placeholder="Brief description of the incident" required />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Severity</label>
              <select v-model="form.severity" class="select" required>
                <option value="cosmetic">Cosmetic</option>
                <option value="minor">Minor</option>
                <option value="major">Major</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label class="label">Status</label>
              <select v-model="form.status" class="select" required>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <div>
            <label class="label">Timestamp</label>
            <input v-model="form.timestamp" type="datetime-local" class="input" required />
          </div>
          <div>
            <label class="label">Root Cause</label>
            <textarea v-model="form.rootCause" class="textarea" placeholder="What caused the incident?" rows="2" />
          </div>
          <div>
            <label class="label">Impact</label>
            <textarea v-model="form.impact" class="textarea" placeholder="What was affected?" rows="2" />
          </div>
          <div>
            <label class="label">Resolution</label>
            <textarea v-model="form.resolution" class="textarea" placeholder="How was it resolved?" rows="2" />
          </div>
          <div>
            <label class="label">Notes</label>
            <textarea v-model="form.notes" class="textarea" placeholder="Additional notes..." rows="2" />
          </div>
          <div class="flex gap-3 pt-2">
            <button type="submit" class="btn-primary">
              <IconPlus class="w-4 h-4" />
              {{ editingId ? "Update" : "Create" }} Report
            </button>
            <button v-if="editingId" type="button" class="btn-secondary" @click="resetForm">Cancel</button>
          </div>
        </form>
      </div>

      <div class="card p-5">
        <h3 class="text-base font-semibold text-surface-100 mb-4">Saved Incidents ({{ store.reports.length }})</h3>
        <template v-if="store.reports.length === 0">
          <div class="text-center py-8">
            <p class="text-sm text-surface-500">No incident reports yet</p>
          </div>
        </template>
        <template v-else>
          <div class="space-y-3 max-h-[600px] overflow-y-auto">
          <div v-for="report in sortedReports" :key="report.id" class="card p-4 border-l-4" :class="severityBorder(report.severity)">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="badge" :class="severityBadgeClass(report.severity)">{{ report.severity }}</span>
                  <span class="badge" :class="statusBadgeClass(report.status)">{{ report.status }}</span>
                </div>
                <p class="text-sm font-medium text-surface-200">{{ report.title }}</p>
                <p class="text-xs text-surface-500 mt-0.5">{{ formatDate(report.timestamp) }}</p>
              </div>
              <div class="flex gap-1 shrink-0">
                <button class="btn-ghost p-1.5" title="Export PDF" @click="exportPdf(report)">
                  <IconDownload class="w-3.5 h-3.5" />
                </button>
                <button class="btn-ghost p-1.5" title="Delete" @click="deleteReport(report.id)">
                  <IconTrash2 class="w-3.5 h-3.5 text-danger-400" />
                </button>
              </div>
            </div>
            <p v-if="report.rootCause" class="text-xs text-surface-400 mt-2">
              <span class="text-surface-500">Root cause:</span> {{ report.rootCause }}
            </p>
          </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useIncidentReportStore } from "@/stores/incidentReports";
import { exportService } from "@/services/exportService";
import { useToast } from "@/composables/useToast";
import { useLogger } from "@/composables/useLogger";
import type { IncidentReport } from "@/types";
import { IconPlus, IconDownload, IconTrash2 } from "@/utils/icons";

const store = useIncidentReportStore();
const toast = useToast();
const logger = useLogger("IncidentReports");

const editingId = ref<string | null>(null);
const now = new Date();
const localISO = now.getFullYear() + "-" +
  String(now.getMonth() + 1).padStart(2, "0") + "-" +
  String(now.getDate()).padStart(2, "0") + "T" +
  String(now.getHours()).padStart(2, "0") + ":" +
  String(now.getMinutes()).padStart(2, "0");

const form = reactive({
  title: "",
  severity: "minor" as IncidentReport["severity"],
  status: "open" as IncidentReport["status"],
  timestamp: localISO,
  rootCause: "",
  impact: "",
  resolution: "",
  notes: "",
});

const sortedReports = computed(() =>
  [...store.reports].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
);

function resetForm() {
  editingId.value = null;
  form.title = "";
  form.severity = "minor";
  form.status = "open";
  form.timestamp = localISO;
  form.rootCause = "";
  form.impact = "";
  form.resolution = "";
  form.notes = "";
}

function submitForm() {
  const report: IncidentReport = {
    id: editingId.value || crypto.randomUUID(),
    title: form.title,
    severity: form.severity,
    status: form.status,
    timestamp: new Date(form.timestamp).toISOString(),
    rootCause: form.rootCause,
    impact: form.impact,
    resolution: form.resolution,
    notes: form.notes,
  };

  store.save(report);
  logger.info("Incident report saved", report);
  toast.success("Report saved", `Incident "${report.title}" saved`);
  resetForm();
}

function deleteReport(id: string) {
  store.remove(id);
  toast.info("Incident deleted");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

function severityBorder(s: string) {
  switch (s) {
    case "critical": return "border-l-danger-500";
    case "major": return "border-l-warning-500";
    case "minor": return "border-l-primary-500";
    default: return "border-l-surface-500";
  }
}

function severityBadgeClass(s: string) {
  switch (s) {
    case "critical": return "badge-red";
    case "major": return "badge-yellow";
    case "minor": return "badge-blue";
    default: return "badge-gray";
  }
}

function statusBadgeClass(s: string) {
  switch (s) {
    case "open": return "badge-red";
    case "investigating": return "badge-yellow";
    case "resolved": return "badge-green";
    case "closed": return "badge-gray";
    default: return "badge-gray";
  }
}

async function exportPdf(report: IncidentReport) {
  try {
    await exportService.exportToFile(report, `incident-${report.title.replace(/\s+/g, "-")}-${Date.now()}`, "pdf");
    toast.success("Exported as PDF");
  } catch (err) {
    toast.error("Export failed", String(err));
  }
}
</script>
