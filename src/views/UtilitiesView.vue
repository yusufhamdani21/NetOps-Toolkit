<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-surface-100">Utilities</h2>
      <p class="text-sm text-surface-400 mt-1">JSON Viewer, Base64, JWT Decoder, URL Encoder, Timestamp Converter</p>
    </div>

    <div class="flex flex-wrap gap-2 mb-4">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
        :class="activeTab === tab.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-surface-800 text-surface-300 hover:text-surface-100 hover:bg-surface-700 border border-surface-700'"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="card p-5 animate-fade-in">
      <!-- JSON Viewer -->
      <template v-if="activeTab === 'json'">
        <h3 class="text-base font-semibold text-surface-100 mb-4">JSON Viewer</h3>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label class="label">Input JSON</label>
            <textarea v-model="jsonInput" class="textarea font-mono text-xs h-64" placeholder='{"key": "value"}' />
            <div class="flex gap-2 mt-2">
              <button class="btn-secondary text-xs" @click="formatJson">Format</button>
              <button class="btn-secondary text-xs" @click="minifyJson">Minify</button>
              <button class="btn-secondary text-xs" @click="copyJson">Copy</button>
            </div>
          </div>
          <div>
            <label class="label">Formatted Output</label>
            <pre class="output-block h-64 text-xs">{{ jsonOutput || "Enter JSON to format" }}</pre>
            <p v-if="jsonError" class="text-xs text-danger-400 mt-1">{{ jsonError }}</p>
          </div>
        </div>
      </template>

      <!-- Base64 -->
      <template v-if="activeTab === 'base64'">
        <h3 class="text-base font-semibold text-surface-100 mb-4">Base64 Encoder / Decoder</h3>
        <div class="space-y-4">
          <div>
            <label class="label">Input</label>
            <textarea v-model="base64Input" class="textarea font-mono text-sm h-24" placeholder="Text or Base64 string" />
          </div>
          <div class="flex gap-2">
            <button class="btn-primary text-xs" @click="encodeBase64">Encode</button>
            <button class="btn-primary text-xs" @click="decodeBase64">Decode</button>
            <button class="btn-secondary text-xs" @click="base64Input = ''; base64Output = ''">Clear</button>
          </div>
          <div>
            <label class="label">Output</label>
            <div class="output-block min-h-[60px] text-sm">{{ base64Output || "Result will appear here" }}</div>
          </div>
        </div>
      </template>

      <!-- JWT Decoder -->
      <template v-if="activeTab === 'jwt'">
        <h3 class="text-base font-semibold text-surface-100 mb-4">JWT Decoder</h3>
        <div class="space-y-4">
          <div>
            <label class="label">JWT Token</label>
            <textarea v-model="jwtInput" class="textarea font-mono text-sm h-20" placeholder="eyJhbGciOiJIUzI1NiIs..." />
          </div>
          <div class="flex gap-2">
            <button class="btn-primary text-xs" :disabled="!jwtInput" @click="decodeJwt">Decode</button>
            <button class="btn-secondary text-xs" @click="jwtInput = ''; jwtHeader = ''; jwtPayload = ''">Clear</button>
          </div>
          <div v-if="jwtHeader" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label class="label">Header</label>
              <pre class="output-block text-xs">{{ jwtHeader }}</pre>
            </div>
            <div>
              <label class="label">Payload</label>
              <pre class="output-block text-xs">{{ jwtPayload }}</pre>
            </div>
          </div>
          <p v-if="jwtError" class="text-xs text-danger-400">{{ jwtError }}</p>
        </div>
      </template>

      <!-- URL Encoder/Decoder -->
      <template v-if="activeTab === 'url'">
        <h3 class="text-base font-semibold text-surface-100 mb-4">URL Encoder / Decoder</h3>
        <div class="space-y-4">
          <div>
            <label class="label">Input</label>
            <textarea v-model="urlInput" class="textarea font-mono text-sm h-20" placeholder="https://example.com?q=hello world" />
          </div>
          <div class="flex gap-2">
            <button class="btn-primary text-xs" @click="encodeUrl">Encode</button>
            <button class="btn-primary text-xs" @click="decodeUrl">Decode</button>
            <button class="btn-secondary text-xs" @click="urlInput = ''; urlOutput = ''">Clear</button>
          </div>
          <div>
            <label class="label">Output</label>
            <div class="output-block min-h-[60px] text-sm break-all">{{ urlOutput || "Result will appear here" }}</div>
          </div>
        </div>
      </template>

      <!-- Timestamp Converter -->
      <template v-if="activeTab === 'timestamp'">
        <h3 class="text-base font-semibold text-surface-100 mb-4">Timestamp Converter</h3>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="space-y-4">
            <div>
              <label class="label">Unix Timestamp (seconds)</label>
              <input v-model.number="tsSeconds" type="number" class="input" @input="convertFromSeconds" />
            </div>
            <div>
              <label class="label">Unix Timestamp (milliseconds)</label>
              <input v-model.number="tsMs" type="number" class="input" @input="convertFromMs" />
            </div>
            <button class="btn-secondary text-xs" @click="setNow">Set to Now</button>
          </div>
          <div>
            <label class="label">Human-Readable Date</label>
            <div class="output-block min-h-[60px]">
              <p class="text-sm text-surface-200">{{ tsResult || "Enter a timestamp" }}</p>
              <p v-if="tsResult" class="text-xs text-surface-500 mt-2">Local time: {{ tsResult }}</p>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "@/composables/useToast";

const toast = useToast();

const tabs = [
  { id: "json", label: "JSON Viewer" },
  { id: "base64", label: "Base64" },
  { id: "jwt", label: "JWT Decoder" },
  { id: "url", label: "URL Encoder" },
  { id: "timestamp", label: "Timestamp" },
];

const activeTab = ref("json");

// JSON
const jsonInput = ref("");
const jsonOutput = ref("");
const jsonError = ref("");

function formatJson() {
  try {
    const parsed = JSON.parse(jsonInput.value);
    jsonOutput.value = JSON.stringify(parsed, null, 2);
    jsonError.value = "";
  } catch (e) {
    jsonError.value = "Invalid JSON: " + (e instanceof Error ? e.message : "parse error");
  }
}

function minifyJson() {
  try {
    const parsed = JSON.parse(jsonInput.value);
    jsonOutput.value = JSON.stringify(parsed);
    jsonError.value = "";
  } catch (e) {
    jsonError.value = "Invalid JSON: " + (e instanceof Error ? e.message : "parse error");
  }
}

function copyJson() {
  if (jsonOutput.value) {
    navigator.clipboard.writeText(jsonOutput.value).then(() => toast.success("Copied to clipboard"));
  }
}

// Base64
const base64Input = ref("");
const base64Output = ref("");

function encodeBase64() {
  try {
    base64Output.value = btoa(base64Input.value);
  } catch {
    toast.error("Failed to encode");
  }
}

function decodeBase64() {
  try {
    base64Output.value = atob(base64Input.value);
  } catch {
    toast.error("Invalid Base64 input");
  }
}

// JWT
const jwtInput = ref("");
const jwtHeader = ref("");
const jwtPayload = ref("");
const jwtError = ref("");

function decodeJwt() {
  jwtHeader.value = "";
  jwtPayload.value = "";
  jwtError.value = "";

  try {
    const parts = jwtInput.value.trim().split(".");
    if (parts.length !== 3) {
      jwtError.value = "Invalid JWT format. Expected 3 parts separated by dots.";
      return;
    }
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    jwtHeader.value = JSON.stringify(header, null, 2);
    jwtPayload.value = JSON.stringify(payload, null, 2);
  } catch (e) {
    jwtError.value = "Failed to decode JWT: " + (e instanceof Error ? e.message : "decode error");
  }
}

// URL
const urlInput = ref("");
const urlOutput = ref("");

function encodeUrl() {
  urlOutput.value = encodeURIComponent(urlInput.value);
}

function decodeUrl() {
  try {
    urlOutput.value = decodeURIComponent(urlInput.value);
  } catch {
    toast.error("Invalid URL encoding");
  }
}

// Timestamp
const tsSeconds = ref(Math.floor(Date.now() / 1000));
const tsMs = ref(Date.now());
const tsResult = ref("");

function convertFromSeconds() {
  if (!tsSeconds.value) return;
  tsMs.value = tsSeconds.value * 1000;
  updateTsDisplay();
}

function convertFromMs() {
  if (!tsMs.value) return;
  tsSeconds.value = Math.floor(tsMs.value / 1000);
  updateTsDisplay();
}

function updateTsDisplay() {
  try {
    tsResult.value = new Date(tsMs.value).toLocaleString();
  } catch {
    tsResult.value = "Invalid timestamp";
  }
}

function setNow() {
  tsSeconds.value = Math.floor(Date.now() / 1000);
  tsMs.value = Date.now();
  updateTsDisplay();
}

// Initialize timestamp display
updateTsDisplay();
</script>
