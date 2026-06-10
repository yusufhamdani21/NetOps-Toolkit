import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "dashboard",
    component: () => import("@/views/DashboardView.vue"),
    meta: { title: "Dashboard", icon: "LayoutDashboard" },
  },
  {
    path: "/network",
    name: "network",
    component: () => import("@/views/NetworkDiagnosticsView.vue"),
    meta: { title: "Network Diagnostics", icon: "Network" },
  },
  {
    path: "/ott",
    name: "ott",
    component: () => import("@/views/OttView.vue"),
    meta: { title: "OTT Streaming", icon: "Video" },
  },
  {
    path: "/cdn",
    name: "cdn",
    component: () => import("@/views/CdnView.vue"),
    meta: { title: "CDN Inspector", icon: "Globe" },
  },
  {
    path: "/device-testing",
    name: "device-testing",
    component: () => import("@/views/DeviceTestingView.vue"),
    meta: { title: "Device Testing", icon: "Smartphone" },
  },
  {
    path: "/incident-reports",
    name: "incident-reports",
    component: () => import("@/views/IncidentReportsView.vue"),
    meta: { title: "Incident Reports", icon: "AlertTriangle" },
  },
  {
    path: "/utilities",
    name: "utilities",
    component: () => import("@/views/UtilitiesView.vue"),
    meta: { title: "Utilities", icon: "Wrench" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
