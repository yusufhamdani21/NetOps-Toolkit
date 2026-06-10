import { defineComponent, h } from "vue";

function icon(path: string, viewBox = "0 0 24 24") {
  return defineComponent({
    setup: (_, { attrs }) => () =>
      h("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox, fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", ...attrs }, [
        path.split(" ").map((d) => h("path", { d })),
      ]),
  });
}

export const IconLayoutDashboard = icon("M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10");
export const IconNetwork = icon("M22 12h-4l-3 9L9 3l-3 9H2");
export const IconVideo = icon("M22 8l-10 5V3z M2 8v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8");
export const IconGlobe = icon("M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z");
export const IconSmartphone = icon("M5 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z M9 2v2 M9 18h6");
export const IconAlertTriangle = icon("M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01");
export const IconWrench = icon("M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z");
export const IconTerminal = icon("M4 17l6-6-6-6 M12 19h8");
export const IconSearch = icon("M21 21l-4.35-4.35M11 6a5 5 0 1 0 0 10 5 5 0 0 0 0-10z");
export const IconX = icon("M18 6L6 18 M6 6l12 12");
export const IconRefreshCw = icon("M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15");
export const IconCheckCircle = icon("M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z M9 12l2 2 4-4");
export const IconAlertCircle = icon("M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 8v4 M12 16h.01");
export const IconInfo = icon("M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 16v-4 M12 8h.01");
export const IconMoon = icon("M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z");
export const IconSun = icon("M12 1v2 M12 21v2 M4.22 4.22l1.42 1.42 M18.36 18.36l1.42 1.42 M1 12h2 M21 12h2 M4.22 19.78l1.42-1.42 M18.36 5.64l1.42-1.42 M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14z");
export const IconDownload = icon("M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3");
export const IconPlus = icon("M12 5v14 M5 12h14");
export const IconTrash2 = icon("M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2");
export const IconCopy = icon("M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M8 4V2h8v2");
export const IconActivity = icon("M22 12h-4l-3 9L9 3l-3 9H2");
export const IconWifi = icon("M5 12.55a11 11 0 0 1 14.08 0 M1.42 9a16 16 0 0 1 21.16 0 M8.53 16.11a6 6 0 0 1 6.95 0 M12 20h.01");
export const IconServer = icon("M20 4H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M4 12v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4 M2 18h20");
export const IconClock = icon("M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2");
export const IconArrowUpRight = icon("M7 17l9-9 M7 7h10v10");
export const IconEye = icon("M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z");
export const IconFileText = icon("M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M16 2v6h6 M8 13h8 M8 17h8 M10 9H8");

export type IconComponent = ReturnType<typeof icon>;
