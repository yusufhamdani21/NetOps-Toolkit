export interface DashboardData {
  localIp: string;
  publicIp: string;
  dnsServer: string;
  networkStatus: "online" | "offline" | "degraded";
  currentLatency: number;
  packetLoss: number;
  lastDiagnosticRun: string | null;
  quickHealth: "healthy" | "warning" | "critical";
}

export interface PingResult {
  host: string;
  resolvedIp: string;
  packetsSent: number;
  packetsReceived: number;
  packetLoss: number;
  minLatency: number;
  maxLatency: number;
  avgLatency: number;
  jitter: number;
  rawOutput: string;
  timestamp: string;
}

export interface TracerouteHop {
  hop: number;
  hostname: string;
  ip: string;
  latencies: number[];
  packetLoss: number;
}

export interface TracerouteResult {
  target: string;
  hops: TracerouteHop[];
  totalHops: number;
  timestamp: string;
}

export interface MtrResult {
  target: string;
  hops: MtrHop[];
  timestamp: string;
}

export interface MtrHop {
  hop: number;
  hostname: string;
  ip: string;
  lossPercent: number;
  sent: number;
  last: number;
  avg: number;
  best: number;
  worst: number;
  stdDev: number;
}

export interface DnsResult {
  domain: string;
  recordType: string;
  answers: DnsAnswer[];
  server: string;
  responseTime: number;
  timestamp: string;
}

export interface DnsAnswer {
  name: string;
  type: string;
  ttl: number;
  data: string;
}

export interface ReverseDnsResult {
  ip: string;
  hostname: string | null;
  timestamp: string;
}

export interface WhoisResult {
  query: string;
  data: string;
  timestamp: string;
}

export interface HttpStatusResult {
  url: string;
  statusCode: number;
  statusText: string;
  responseTime: number;
  headers: Record<string, string>;
  body: string;
  timestamp: string;
}

export interface CertCheckResult {
  hostname: string;
  valid: boolean;
  issuer: string;
  subject: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  error: string | null;
  timestamp: string;
}

export interface HlsValidationResult {
  url: string;
  httpStatus: number;
  manifestValid: boolean;
  segmentCount: number;
  responseTime: number;
  errors: string[];
  playlistType: string;
  targetDuration: number;
  version: number;
  timestamp: string;
}

export interface DashValidationResult {
  url: string;
  httpStatus: number;
  manifestValid: boolean;
  segmentCount: number;
  responseTime: number;
  errors: string[];
  profiles: string[];
  minBufferTime: string;
  timestamp: string;
}

export interface StreamResponseTime {
  url: string;
  dnsTime: number;
  connectTime: number;
  tlsTime: number;
  firstByteTime: number;
  totalTime: number;
  timestamp: string;
}

export interface StreamLatency {
  url: string;
  estimatedLatency: number;
  method: string;
  timestamp: string;
}

export interface PlaylistData {
  url: string;
  raw: string;
  parsed: ParsedPlaylist;
  timestamp: string;
}

export interface ParsedPlaylist {
  version: number;
  type: string;
  targetDuration: number;
  mediaSequence: number;
  segments: PlaylistSegment[];
  endList: boolean;
}

export interface PlaylistSegment {
  duration: number;
  uri: string;
  title: string;
}

export interface CdnInspectionResult {
  url: string;
  resolvedIp: string;
  server: string;
  via: string;
  cacheControl: string;
  age: number;
  xCache: string;
  cdnVendor: string | null;
  responseHeaders: Record<string, string>;
  timestamp: string;
}

export interface DeviceTest {
  id: string;
  deviceName: string;
  osVersion: string;
  appVersion: string;
  networkType: string;
  testNotes: string;
  timestamp: string;
}

export interface IncidentReport {
  id: string;
  title: string;
  severity: "critical" | "major" | "minor" | "cosmetic";
  timestamp: string;
  rootCause: string;
  impact: string;
  resolution: string;
  notes: string;
  status: "open" | "investigating" | "resolved" | "closed";
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "debug" | "info" | "warn" | "error";
  module: string;
  message: string;
  data?: unknown;
}

export type UtilityResult = {
  input: string;
  output: string;
  timestamp: string;
};

export type ExportFormat = "txt" | "json" | "pdf";
