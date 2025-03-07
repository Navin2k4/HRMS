import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiSettings,
  FiDollarSign,
  FiLayers,
  FiShield,
  FiDatabase,
  FiTrendingUp,
  FiGlobe,
  FiFileText,
  FiAlertCircle,
  FiTool,
} from "react-icons/fi";

const menuItems = [
  { path: "/superadmin/dashboard", icon: FiHome, label: "Dashboard" },
  { path: "/superadmin/users", icon: FiUsers, label: "User Management" },
  { path: "/superadmin/department", icon: FiLayers, label: "Departments" },
  { path: "/superadmin/billing", icon: FiDollarSign, label: "Billing & Plans" },
  { path: "/superadmin/security", icon: FiShield, label: "Security Settings" },
  {
    path: "/superadmin/database",
    icon: FiDatabase,
    label: "Database Management",
  },
  { path: "/superadmin/analytics", icon: FiTrendingUp, label: "Analytics" },
  { path: "/superadmin/integrations", icon: FiGlobe, label: "Integrations" },
  { path: "/superadmin/audit", icon: FiFileText, label: "Audit Logs" },
  { path: "/superadmin/alerts", icon: FiAlertCircle, label: "System Alerts" },
  { path: "/superadmin/settings", icon: FiSettings, label: "System Settings" },
  { path: "/superadmin/maintenance", icon: FiTool, label: "Maintenance" },
  { path: "/superadmin/organization", icon: FiShield, label: "Organization" },
];

const SuperAdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="bg-white w-64 min-h-screen shadow-lg">
      <div className="p-4 ">
        <h2 className="text-2xl font-bold text-blue-700">Super Admin</h2>
        <p className="text-sm text-gray-500 mt-1">System Administration</p>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 border-r-4 border-indigo-700"
                  : ""
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t mt-auto">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <FiShield className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium">System Status</p>
            <p className="text-xs text-green-600">All Systems Operational</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SuperAdminSidebar;
