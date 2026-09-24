import axios from "axios";
export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

// Centralized API Endpoints Map
export const ENDPOINTS = {
  auth: {
    adminLogin: "/api/v1/auth/admin/login",
    login: "/api/v1/auth/login",
    requestOtp: "/api/v1/auth/otp/request",
    verifyOtp: "/api/v1/auth/otp/verify",
    setPassword: "/api/v1/auth/set-password",
  },
  public: {
    events: "/api/v1/public/events",
    eventCardTemplates: (eventId) =>
      `/api/v1/public/events/${eventId}/card-templates`,
    smsTemplates: "/api/v1/public/sms-templates",
    bundles: "/api/v1/public/bundles",
    placeholders: (eventId) => `/api/v1/public/events/${eventId}/placeholders`,
    paragraphTemplates: "/api/v1/public/paragraph-templates",
    parseInvitees: "/api/v1/public/invitations/parse",
    importCsv: "/api/v1/public/invitations/import-csv",
    upload: "/api/v1/public/uploads",
  },
  batches: {
    create: "/api/v1/batches",
    get: (id) => `/api/v1/batches/${id}`,
    update: (id) => `/api/v1/batches/${id}`,
    initiateCheckout: (id) => `/api/v1/batches/${id}/initiate`,
  },
  scans: {
    scan: "/api/v1/scans",
  },
  me: {
    events: "/api/v1/me/events",
    guests: (batchId) => `/api/v1/me/events/${batchId}/guests`,
    resend: (batchId) => `/api/v1/me/events/${batchId}/resend`,
    schedule: (batchId) => `/api/v1/me/events/${batchId}/schedule`,
    reminders: "/api/v1/me/reminders",
    reminderById: (id) => `/api/v1/me/reminders/${id}`,
  },
  admin: {
    events: "/api/v1/admin/events",
    eventById: (id) => `/api/v1/admin/events/${id}`,
    cardTemplates: "/api/v1/admin/card-templates",
    cardTemplateById: (id) => `/api/v1/admin/card-templates/${id}`,
    smsTemplates: "/api/v1/admin/sms-templates",
    smsTemplateById: (id) => `/api/v1/admin/sms-templates/${id}`,
    bundles: "/api/v1/admin/bundles",
    bundleById: (id) => `/api/v1/admin/bundles/${id}`,
    paragraphTemplates: "/api/v1/admin/paragraph-templates",
    paragraphTemplateById: (id) => `/api/v1/admin/paragraph-templates/${id}`,
    clients: "/api/v1/admin/clients",
    clientById: (id) => `/api/v1/admin/clients/${id}`,
    impersonate: (id) => `/api/v1/admin/clients/${id}/impersonate`,
    invitations: "/api/v1/admin/invitations",
    invitationById: (id) => `/api/v1/admin/invitations/${id}`,
    resendInvitation: (id) => `/api/v1/admin/invitations/${id}/resend`,
    scheduledInvitations: "/api/v1/admin/invitations/scheduled",
    analytics: "/api/v1/admin/analytics/dashboard",
    scanners: "/api/v1/admin/scanners",
    scannerById: (id) => `/api/v1/admin/scanners/${id}`,
    availableEventsForScanner: "/api/v1/admin/scanners/available-events",
    admins: "/api/v1/admin/admins",
    adminById: (id) => `/api/v1/admin/admins/${id}`,
  },
};
export const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("jp_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected server error occurred";
    return Promise.reject(new Error(message));
  },
);
export function assetUrl(path) {
  if (!path) return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
export function toIsoInstant(datetimeLocalValue) {
  if (!datetimeLocalValue) return null;
  const d = new Date(datetimeLocalValue);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

// ============================================================================
// AUTH API
// ============================================================================
export const AuthAPI = {
  adminLogin: async (phone, password) => {
    const res = await client.post(ENDPOINTS.auth.adminLogin, {
      phone,
      password,
    });
    return res.data;
  },
  login: async (phone, password) => {
    const res = await client.post(ENDPOINTS.auth.login, {
      phone,
      password,
    });
    return res.data;
  },
  requestOtp: async (phone) => {
    const res = await client.post(ENDPOINTS.auth.requestOtp, {
      phone,
    });
    return res.data;
  },
  verifyOtp: async (phone, code) => {
    const res = await client.post(ENDPOINTS.auth.verifyOtp, {
      phone,
      code,
    });
    return res.data;
  },
  setPassword: async (newPassword, confirmPassword) => {
    const res = await client.post(ENDPOINTS.auth.setPassword, {
      newPassword,
      confirmPassword,
    });
    return res.data;
  },
};

// ============================================================================
// PUBLIC CATALOG API
// ============================================================================
export const CatalogAPI = {
  listEvents: async () => {
    const res = await client.get(ENDPOINTS.public.events);
    return res.data;
  },
  listCardTemplates: async (eventId) => {
    const res = await client.get(ENDPOINTS.public.eventCardTemplates(eventId));
    return res.data;
  },
  listSmsTemplates: async () => {
    const res = await client.get(ENDPOINTS.public.smsTemplates);
    return res.data;
  },
  listBundles: async () => {
    const res = await client.get(ENDPOINTS.public.bundles);
    return res.data;
  },
  getEventPlaceholders: async (eventId) => {
    const res = await client.get(ENDPOINTS.public.placeholders(eventId));
    return res.data;
  },
  listParagraphTemplates: async (eventId, cardId) => {
    const params = new URLSearchParams();
    if (eventId) params.append("eventId", String(eventId));
    if (cardId) params.append("cardId", String(cardId));
    const query = params.toString();
    const url = query
      ? `${ENDPOINTS.public.paragraphTemplates}?${query}`
      : ENDPOINTS.public.paragraphTemplates;
    const res = await client.get(url);
    return res.data;
  },
  parseInvitees: async (rawText) => {
    const res = await client.post(ENDPOINTS.public.parseInvitees, {
      rawText,
    });
    return res.data;
  },
  importCsvGuests: async (file) => {
    const form = new FormData();
    form.append("file", file);
    const res = await client.post(ENDPOINTS.public.importCsv, form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
  uploadFile: async (file) => {
    const form = new FormData();
    form.append("file", file);
    const res = await client.post(ENDPOINTS.public.upload, form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
};

// ============================================================================
// INVITATION BATCHES API
// ============================================================================
export const InvitationAPI = {
  createBatch: async (payload) => {
    const res = await client.post(ENDPOINTS.batches.create, payload);
    return res.data;
  },
  getBatch: async (id) => {
    const res = await client.get(ENDPOINTS.batches.get(id));
    return res.data;
  },
  checkout: async (batchId, payload) => {
    const res = await client.post(
      ENDPOINTS.batches.initiateCheckout(batchId),
      payload,
    );
    return res.data;
  },
  updateBatch: async (batchId, patch) => {
    const res = await client.patch(ENDPOINTS.batches.update(batchId), patch);
    return res.data;
  },
};

// ============================================================================
// SCANNER & CHECK-IN API
// ============================================================================
export const ScanAPI = {
  scan: async (qrToken, checkInCode) => {
    const res = await client.post(ENDPOINTS.scans.scan, {
      qrToken,
      checkInCode,
    });
    return res.data;
  },
};

// ============================================================================
// CUSTOMER DASHBOARD API
// ============================================================================
export const DashboardAPI = {
  myEvents: async () => {
    const res = await client.get(ENDPOINTS.me.events);
    return res.data;
  },
  myGuests: async (batchId) => {
    const res = await client.get(ENDPOINTS.me.guests(batchId));
    return res.data;
  },
  resendInvitee: async (batchId, inviteeId) => {
    const res = await client.post(ENDPOINTS.me.resend(batchId), {
      inviteeId,
    });
    return res.data;
  },
  cancelBatchSchedule: async (batchId) => {
    const res = await client.delete(ENDPOINTS.me.schedule(batchId));
    return res.data;
  },
  rescheduleBatch: async (batchId, sendAtIso) => {
    const res = await client.put(ENDPOINTS.me.schedule(batchId), {
      sendAt: sendAtIso,
    });
    return res.data;
  },
  myReminders: async () => {
    const res = await client.get(ENDPOINTS.me.reminders);
    return res.data;
  },
  updateSmsReminder: async (id, req) => {
    const res = await client.put(ENDPOINTS.me.reminderById(id), req);
    return res.data;
  },
  cancelReminder: async (id) => {
    const res = await client.delete(ENDPOINTS.me.reminderById(id));
    return res.data;
  },
};

// ============================================================================
// ADMIN API
// ============================================================================
export const AdminAPI = {
  listEvents: async () => {
    const res = await client.get(ENDPOINTS.admin.events);
    return res.data;
  },
  createEvent: async (e) => {
    const res = await client.post(ENDPOINTS.admin.events, e);
    return res.data;
  },
  updateEvent: async (id, e) => {
    const res = await client.put(ENDPOINTS.admin.eventById(id), e);
    return res.data;
  },
  deleteEvent: async (id) => {
    const res = await client.delete(ENDPOINTS.admin.eventById(id));
    return res.data;
  },
  listCardTemplates: async () => {
    const res = await client.get(ENDPOINTS.admin.cardTemplates);
    return res.data;
  },
  createCardTemplate: async (c) => {
    const res = await client.post(ENDPOINTS.admin.cardTemplates, c);
    return res.data;
  },
  updateCardTemplate: async (id, c) => {
    const res = await client.put(ENDPOINTS.admin.cardTemplateById(id), c);
    return res.data;
  },
  deleteCardTemplate: async (id) => {
    const res = await client.delete(ENDPOINTS.admin.cardTemplateById(id));
    return res.data;
  },
  listSmsTemplates: async () => {
    const res = await client.get(ENDPOINTS.admin.smsTemplates);
    return res.data;
  },
  createSmsTemplate: async (s) => {
    const res = await client.post(ENDPOINTS.admin.smsTemplates, s);
    return res.data;
  },
  updateSmsTemplate: async (id, s) => {
    const res = await client.put(ENDPOINTS.admin.smsTemplateById(id), s);
    return res.data;
  },
  deleteSmsTemplate: async (id) => {
    const res = await client.delete(ENDPOINTS.admin.smsTemplateById(id));
    return res.data;
  },
  listBundles: async () => {
    const res = await client.get(ENDPOINTS.admin.bundles);
    return res.data;
  },
  createBundle: async (b) => {
    const res = await client.post(ENDPOINTS.admin.bundles, b);
    return res.data;
  },
  updateBundle: async (id, b) => {
    const res = await client.put(ENDPOINTS.admin.bundleById(id), b);
    return res.data;
  },
  deleteBundle: async (id) => {
    const res = await client.delete(ENDPOINTS.admin.bundleById(id));
    return res.data;
  },
  listParagraphTemplates: async () => {
    const res = await client.get(ENDPOINTS.admin.paragraphTemplates);
    return res.data;
  },
  createParagraphTemplate: async (p) => {
    const res = await client.post(ENDPOINTS.admin.paragraphTemplates, p);
    return res.data;
  },
  updateParagraphTemplate: async (id, p) => {
    const res = await client.put(ENDPOINTS.admin.paragraphTemplateById(id), p);
    return res.data;
  },
  deleteParagraphTemplate: async (id) => {
    const res = await client.delete(ENDPOINTS.admin.paragraphTemplateById(id));
    return res.data;
  },
  listClients: async () => {
    const res = await client.get(ENDPOINTS.admin.clients);
    return res.data;
  },
  getClientDetail: async (clientId) => {
    const res = await client.get(ENDPOINTS.admin.clientById(clientId));
    return res.data;
  },
  impersonate: async (userId) => {
    const res = await client.post(ENDPOINTS.admin.impersonate(userId));
    return res.data;
  },
  listAllInvitations: async () => {
    const res = await client.get(ENDPOINTS.admin.invitations);
    return res.data;
  },
  getInvitationDetail: async (batchId) => {
    const res = await client.get(ENDPOINTS.admin.invitationById(batchId));
    return res.data;
  },
  resendInvitations: async (batchId, inviteeId) => {
    const res = await client.post(ENDPOINTS.admin.resendInvitation(batchId), {
      inviteeId,
    });
    return res.data;
  },
  listScheduledInvitations: async () => {
    const res = await client.get(ENDPOINTS.admin.scheduledInvitations);
    return res.data;
  },
  listAdmins: async () => {
    const res = await client.get(ENDPOINTS.admin.admins);
    return res.data;
  },
  createAdmin: async (req) => {
    const res = await client.post(ENDPOINTS.admin.admins, req);
    return res.data;
  },
  updateAdmin: async (id, req) => {
    const res = await client.put(ENDPOINTS.admin.adminById(id), req);
    return res.data;
  },
  deleteAdmin: async (id) => {
    const res = await client.delete(ENDPOINTS.admin.adminById(id));
    return res.data;
  },
  uploadFile: (file) => CatalogAPI.uploadFile(file),
  getAnalyticsDashboard: async () => {
    const res = await client.get(ENDPOINTS.admin.analytics);
    return res.data;
  },
};

// ============================================================================
// SCANNER ADMIN API
// ============================================================================
export const ScannerAdminAPI = {
  listScanners: async () => {
    const res = await client.get(ENDPOINTS.admin.scanners);
    return res.data;
  },
  getAvailableEvents: async () => {
    const res = await client.get(ENDPOINTS.admin.availableEventsForScanner);
    return res.data;
  },
  createScanner: async (req) => {
    const res = await client.post(ENDPOINTS.admin.scanners, req);
    return res.data;
  },
  updateScanner: async (id, req) => {
    const res = await client.put(ENDPOINTS.admin.scannerById(id), req);
    return res.data;
  },
  deleteScanner: async (id) => {
    const res = await client.delete(ENDPOINTS.admin.scannerById(id));
    return res.data;
  },
};
