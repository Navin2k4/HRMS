import { BrowserRouter, Routes, Route } from "react-router-dom";
import HRLayout from "./components/layout/HRLayout";
import Dashboard from "./components/dashboard/DashboardStats";
import HomePage from "./pages/HomePage";
import AdminSignIn from "./pages/auth/AdminSignIn";
import UserSignIn from "./pages/auth/UserSignIn";
import AdminPrivateRoute from "./pages/private/AdminPrivateRoute";
import HrPrivateRoute from "./pages/private/HrPrivateRoute";
import ManagerPrivateRoute from "./pages/private/ManagerPrivateRoute";
import EmployeePrivateRoute from "./pages/private/EmployeePrivateRoute";
import EmployeeList from "./pages/employees/EmployeeList";
import AttendanceManagement from "./pages/attendance/AttendanceManagement";
import PayrollManagement from "./pages/payroll/PayrollManagement";
import RecruitmentManagement from "./pages/recruitment/RecruitmentManagement";
import PerformanceManagement from "./pages/performance/PerformanceManagement";
import TrainingManagement from "./pages/training/TrainingManagement";
import ExpensesManagement from "./pages/expenses/ExpensesManagement";
import ReportsManagement from "./pages/reports/ReportsManagement";
import DocumentsManagement from "./pages/documents/DocumentsManagement";
import ComplianceManagement from "./pages/compliance/ComplianceManagement";
import ExitManagement from "./pages/exit/ExitManagement";
import DepartmentManagement from "./pages/admin/DepartmentManagement";
import OnboardingManagement from "./pages/onboarding/OnboardingManagement";
import EmployeeLayout from "./components/layout/EmployeeLayout";
import EmployeeDashboard from "./pages/employee/Dashboard";
import EmployeeProfile from "./pages/employee/Profile";
import EmployeeAttendance from "./pages/employee/Attendance";
import EmployeeLeave from "./pages/employee/Leave";
import EmployeePayroll from "./pages/employee/Payroll";
import EmployeeTraining from "./pages/employee/Training";
import EmployeeExpenses from "./pages/employee/Expenses";
import EmployeeAnnouncements from "./pages/employee/Announcements";
import EmployeeSupport from "./pages/employee/Support";
import ManagerDashboard from "./pages/manager/Dashboard";
import ManagerLayout from "./components/layout/ManagerLayout";
import ManagerAttendance from "./pages/manager/Attendance";
import ManagerTeams from "./pages/manager/Teams";
import ManagerPerformance from "./pages/manager/Performance";
import ManagerLeave from "./pages/manager/Leave";
import ManagerExpenses from "./pages/manager/Expenses";
import ManagerTraining from "./pages/manager/Training";
import ManagerReports from "./pages/manager/Reports";
import ManagerFeedback from "./pages/manager/Feedback";
import ManagerTasks from "./pages/manager/Tasks";
import SuperAdminLayout from "./components/layout/SuperAdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import BillingManagement from "./pages/admin/BillingManagement";
import SecurityManagement from "./pages/admin/SecurityManagement";
import DatabaseManagement from "./pages/admin/DatabaseManagement";
import Analytics from "./pages/admin/Analytics";
import Integrations from "./pages/admin/Integrations";
import AuditLogs from "./pages/admin/AuditLogs";
import SystemAlerts from "./pages/admin/SystemAlerts";
import SystemSettings from "./pages/admin/SystemSettings";
import Maintenance from "./pages/admin/Maintenance";
import OrganizationManagement from "./pages/admin/OrganizationManagement";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/signin/admin" element={<AdminSignIn />} />
        <Route path="/signin/user" element={<UserSignIn />} />

        {/* HR Private Routes */}
        <Route element={<HrPrivateRoute />}>
          <Route path="/hr" element={<HRLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="employees" element={<EmployeeList />} />
            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="payroll" element={<PayrollManagement />} />
            <Route path="recruitment" element={<RecruitmentManagement />} />
            <Route path="performance" element={<PerformanceManagement />} />
            <Route path="training" element={<TrainingManagement />} />
            <Route path="expenses" element={<ExpensesManagement />} />
            <Route path="reports" element={<ReportsManagement />} />
            <Route path="documents" element={<DocumentsManagement />} />
            <Route path="compliance" element={<ComplianceManagement />} />
            <Route path="exit" element={<ExitManagement />} />
            <Route path="department" element={<DepartmentManagement />} />
            <Route path="onboarding" element={<OnboardingManagement />} />
          </Route>
        </Route>

        {/* Employee Private Routes */}
        <Route element={<EmployeePrivateRoute />}>
          <Route path="/employee" element={<EmployeeLayout />}>
            <Route index element={<EmployeeDashboard />} />
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="profile" element={<EmployeeProfile />} />
            <Route path="attendance" element={<EmployeeAttendance />} />
            <Route path="leave" element={<EmployeeLeave />} />
            <Route path="payroll" element={<EmployeePayroll />} />
            <Route path="training" element={<EmployeeTraining />} />
            <Route path="expenses" element={<EmployeeExpenses />} />
            <Route path="announcements" element={<EmployeeAnnouncements />} />
            <Route path="support" element={<EmployeeSupport />} />
          </Route>
        </Route>

        {/* Manager Private Routes */}
        <Route element={<ManagerPrivateRoute />}>
          <Route path="/manager" element={<ManagerLayout />}>
            <Route index element={<ManagerDashboard />} />
            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="team" element={<ManagerTeams />} />
            <Route path="attendance" element={<ManagerAttendance />} />
            <Route path="leave" element={<ManagerLeave />} />
            <Route path="performance" element={<ManagerPerformance />} />
            <Route path="training" element={<ManagerTraining />} />
            <Route path="expenses" element={<ManagerExpenses />} />
            <Route path="reports" element={<ManagerReports />} />
            <Route path="feedback" element={<ManagerFeedback />} />
            <Route path="tasks" element={<ManagerTasks />} />
          </Route>
        </Route>

        {/* Admin Private Routes */}
        <Route element={<AdminPrivateRoute />}>
          <Route path="/superadmin" element={<SuperAdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="department" element={<DepartmentManagement />} />
            <Route path="organization" element={<OrganizationManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="billing" element={<BillingManagement />} />
            <Route path="security" element={<SecurityManagement />} />
            <Route path="database" element={<DatabaseManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="audit" element={<AuditLogs />} />
            <Route path="alerts" element={<SystemAlerts />} />
            <Route path="settings" element={<SystemSettings />} />
            <Route path="maintenance" element={<Maintenance />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
