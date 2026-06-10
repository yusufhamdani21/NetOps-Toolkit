import { defineStore } from "pinia";
import { ref } from "vue";
import type { IncidentReport } from "@/types";

export const useIncidentReportStore = defineStore("incidentReports", () => {
  const reports = ref<IncidentReport[]>([]);

  function load() {
    try {
      const stored = localStorage.getItem("netops-incidents");
      if (stored) reports.value = JSON.parse(stored);
    } catch {
      reports.value = [];
    }
  }

  function save(report: IncidentReport) {
    const idx = reports.value.findIndex((r) => r.id === report.id);
    if (idx >= 0) {
      reports.value[idx] = report;
    } else {
      reports.value.push(report);
    }
    persist();
  }

  function remove(id: string) {
    reports.value = reports.value.filter((r) => r.id !== id);
    persist();
  }

  function persist() {
    localStorage.setItem("netops-incidents", JSON.stringify(reports.value));
  }

  load();

  return { reports, save, remove, load };
});
