<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-surface-100">Device Testing</h2>
      <p class="text-sm text-surface-400 mt-1">Create and manage local device test reports</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card p-5">
        <h3 class="text-base font-semibold text-surface-100 mb-4">{{ editingId ? "Edit" : "New" }} Device Test</h3>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label class="label">Device Name</label>
            <input v-model="form.deviceName" type="text" class="input" placeholder="e.g. iPhone 15 Pro" required />
          </div>
          <div>
            <label class="label">OS Version</label>
            <input v-model="form.osVersion" type="text" class="input" placeholder="e.g. iOS 18.1" required />
          </div>
          <div>
            <label class="label">App Version</label>
            <input v-model="form.appVersion" type="text" class="input" placeholder="e.g. 4.2.1" required />
          </div>
          <div>
            <label class="label">Network Type</label>
            <select v-model="form.networkType" class="select" required>
              <option value="">Select network type...</option>
              <option value="WiFi">WiFi</option>
              <option value="5G">5G</option>
              <option value="LTE">LTE</option>
              <option value="4G">4G</option>
              <option value="3G">3G</option>
              <option value="Ethernet">Ethernet</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label class="label">Test Notes</label>
            <textarea v-model="form.testNotes" class="textarea" placeholder="Describe the test scenario..." rows="3" />
          </div>
          <div class="flex gap-3 pt-2">
            <button type="submit" class="btn-primary">
              <IconPlus class="w-4 h-4" />
              {{ editingId ? "Update" : "Save" }} Report
            </button>
            <button v-if="editingId" type="button" class="btn-secondary" @click="resetForm">Cancel</button>
          </div>
        </form>
      </div>

      <div class="card p-5">
        <h3 class="text-base font-semibold text-surface-100 mb-4">Saved Test Reports ({{ store.tests.length }})</h3>
        <div v-if="store.tests.length === 0" class="text-center py-8">
          <p class="text-sm text-surface-500">No test reports saved yet</p>
        </div>
        <div v-else class="space-y-3 max-h-[500px] overflow-y-auto">
          <div v-for="test in store.tests" :key="test.id" class="p-3 rounded-lg bg-surface-850 border border-surface-800">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="text-sm font-medium text-surface-200">{{ test.deviceName }}</p>
                <p class="text-xs text-surface-500 mt-0.5">
                  {{ test.osVersion }} · {{ test.appVersion }} · {{ test.networkType }}
                </p>
                <p class="text-xs text-surface-500 mt-0.5">{{ formatDate(test.timestamp) }}</p>
              </div>
              <div class="flex gap-1 shrink-0">
                <button class="btn-ghost p-1.5" title="Export PDF" @click="exportPdf(test)">
                  <IconDownload class="w-3.5 h-3.5" />
                </button>
                <button class="btn-ghost p-1.5" title="Delete" @click="deleteTest(test.id)">
                  <IconTrash2 class="w-3.5 h-3.5 text-danger-400" />
                </button>
              </div>
            </div>
            <p v-if="test.testNotes" class="text-xs text-surface-400 mt-2 line-clamp-2">{{ test.testNotes }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useDeviceTestStore } from "@/stores/deviceTests";
import { exportService } from "@/services/exportService";
import { useToast } from "@/composables/useToast";
import { useLogger } from "@/composables/useLogger";
import type { DeviceTest } from "@/types";
import { IconPlus, IconDownload, IconTrash2 } from "@/utils/icons";

const store = useDeviceTestStore();
const toast = useToast();
const logger = useLogger("DeviceTesting");

const editingId = ref<string | null>(null);
const form = reactive({
  deviceName: "",
  osVersion: "",
  appVersion: "",
  networkType: "",
  testNotes: "",
});

function resetForm() {
  editingId.value = null;
  form.deviceName = "";
  form.osVersion = "";
  form.appVersion = "";
  form.networkType = "";
  form.testNotes = "";
}

function submitForm() {
  const test: DeviceTest = {
    id: editingId.value || crypto.randomUUID(),
    deviceName: form.deviceName,
    osVersion: form.osVersion,
    appVersion: form.appVersion,
    networkType: form.networkType,
    testNotes: form.testNotes,
    timestamp: new Date().toISOString(),
  };

  store.save(test);
  logger.info("Device test saved", test);
  toast.success("Test saved", `Report for ${test.deviceName} saved`);
  resetForm();
}

function deleteTest(id: string) {
  store.remove(id);
  toast.info("Test deleted");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

async function exportPdf(test: DeviceTest) {
  try {
    await exportService.exportToFile(test, `device-test-${test.deviceName}-${Date.now()}`, "pdf");
    toast.success("Exported as PDF");
  } catch (err) {
    toast.error("Export failed", String(err));
  }
}
</script>
