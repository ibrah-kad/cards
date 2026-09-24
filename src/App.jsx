import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import BuildInvitation from "./pages/BuildInvitation";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import Login from "./pages/Login";
import VerifyOtp from "./pages/VerifyOtp";
import SetPassword from "./pages/SetPassword";
import Dashboard from "./pages/Dashboard";
import EventGuests from "./pages/EventGuests";
import Reminders from "./pages/Reminders";
import Scanner from "./pages/Scanner";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminCardTemplates from "./pages/admin/AdminCardTemplates";
import AdminParagraphTemplates from "./pages/admin/AdminParagraphTemplates";
import AdminSmsTemplates from "./pages/admin/AdminSmsTemplates";
import AdminBundles from "./pages/admin/AdminBundles";
import AdminScheduledInvitations from "./pages/admin/AdminScheduledInvitations";
import AdminClients from "./pages/admin/AdminClients";
import AdminClientDetail from "./pages/admin/AdminClientDetail";
import AdminAllInvitations from "./pages/admin/AdminAllInvitations";
import AdminInvitationDetail from "./pages/admin/AdminInvitationDetail";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminScanners from "./pages/admin/AdminScanners";
import AdminAdmins from "./pages/admin/AdminAdmins";
function SiteLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F3E8] text-[#26201A]">
      <Navbar />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
}
export default function App() {
  return (
    <Routes>
      {/* ---------------- Admin Console ---------------- */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="card-templates" element={<AdminCardTemplates />} />
        <Route path="paragraphs" element={<AdminParagraphTemplates />} />
        <Route path="sms-templates" element={<AdminSmsTemplates />} />
        <Route path="bundles" element={<AdminBundles />} />
        <Route path="scheduled" element={<AdminScheduledInvitations />} />
        <Route path="clients" element={<AdminClients />} />
        <Route path="clients/:clientId" element={<AdminClientDetail />} />
        <Route path="invitations" element={<AdminAllInvitations />} />
        <Route
          path="invitations/:batchId"
          element={<AdminInvitationDetail />}
        />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="scanners" element={<AdminScanners />} />
        <Route path="admins" element={<AdminAdmins />} />
      </Route>

      {/* ---------------- Public Website & Client Portal ---------------- */}
      <Route
        path="/"
        element={
          <SiteLayout>
            <Home />
          </SiteLayout>
        }
      />
      <Route
        path="/events"
        element={
          <SiteLayout>
            <Events />
          </SiteLayout>
        }
      />
      <Route
        path="/events/:eventId"
        element={
          <SiteLayout>
            <EventDetail />
          </SiteLayout>
        }
      />
      <Route
        path="/build/:eventId/:templateId"
        element={
          <SiteLayout>
            <BuildInvitation />
          </SiteLayout>
        }
      />
      <Route
        path="/checkout/:batchId"
        element={
          <SiteLayout>
            <Checkout />
          </SiteLayout>
        }
      />
      <Route
        path="/payment-success/:batchId"
        element={
          <SiteLayout>
            <PaymentSuccess />
          </SiteLayout>
        }
      />
      <Route
        path="/login"
        element={
          <SiteLayout>
            <Login />
          </SiteLayout>
        }
      />
      <Route
        path="/verify-otp"
        element={
          <SiteLayout>
            <VerifyOtp />
          </SiteLayout>
        }
      />
      <Route
        path="/set-password"
        element={
          <SiteLayout>
            <SetPassword />
          </SiteLayout>
        }
      />

      {/* ---------------- Protected Client Portal ---------------- */}
      <Route
        path="/dashboard"
        element={
          <SiteLayout>
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </SiteLayout>
        }
      />
      <Route
        path="/dashboard/events/:batchId"
        element={
          <SiteLayout>
            <ProtectedRoute>
              <EventGuests />
            </ProtectedRoute>
          </SiteLayout>
        }
      />
      <Route
        path="/reminders"
        element={
          <SiteLayout>
            <ProtectedRoute>
              <Reminders />
            </ProtectedRoute>
          </SiteLayout>
        }
      />
      <Route
        path="/scan"
        element={
          <SiteLayout>
            <Scanner />
          </SiteLayout>
        }
      />

      {/* 404 Fallback */}
      <Route
        path="*"
        element={
          <SiteLayout>
            <NotFound />
          </SiteLayout>
        }
      />
    </Routes>
  );
}
