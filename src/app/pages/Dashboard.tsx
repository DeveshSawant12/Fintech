import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Home, TrendingUp, Calculator, FileText, Video, Settings, LogOut, Menu, X, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../auth/AuthContext";

const investmentData = [
  { month: "Jan", value: 100000 },
  { month: "Feb", value: 150000 },
  { month: "Mar", value: 180000 },
  { month: "Apr", value: 220000 },
  { month: "May", value: 280000 },
  { month: "Jun", value: 350000 },
];

const allocationData = [
  { name: "Equity", value: 45, color: "#1A5F3D" },
  { name: "Debt", value: 30, color: "#2D7A4E" },
  { name: "Gold", value: 15, color: "#3FAF7D" },
  { name: "Cash", value: 10, color: "#B8E986" },
];

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' && window.innerWidth >= 768);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const displayName  = user?.name  ?? "User";
  const displayEmail = user?.email ?? "";
  const initials     = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex">
      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || isDesktop) && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-50"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A5F3D] to-[#3FAF7D] flex items-center justify-center">
                    <span className="text-white font-bold text-xl">SF</span>
                  </div>
                  <span className="font-bold text-xl text-gray-900">SmartFinance</span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-2">
                <SidebarLink icon={<Home className="w-5 h-5" />} label="Dashboard" active />
                <SidebarLink icon={<TrendingUp className="w-5 h-5" />} label="Investments" to="/services" />
                <SidebarLink icon={<Calculator className="w-5 h-5" />} label="Calculators" to="/calculator/sip" />
                <SidebarLink icon={<FileText className="w-5 h-5" />} label="Planner" to="/planner" />
                <SidebarLink icon={<Video className="w-5 h-5" />} label="Webinars" to="/webinars" />
              </nav>

              <div className="mt-auto pt-8 border-t border-gray-200 space-y-2">
                <SidebarLink icon={<Settings className="w-5 h-5" />} label="Settings" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {displayName.split(" ")[0]}!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-400">{displayEmail}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1A5F3D] to-[#3FAF7D] flex items-center justify-center text-white font-semibold text-sm">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SummaryCard
              title="Total Portfolio"
              value="₹12,45,000"
              change="+12.5%"
              positive
              icon={<Wallet className="w-6 h-6" />}
            />
            <SummaryCard
              title="Total Investment"
              value="₹9,00,000"
              change="+8.3%"
              positive
              icon={<TrendingUp className="w-6 h-6" />}
            />
            <SummaryCard
              title="Total Returns"
              value="₹3,45,000"
              change="+15.2%"
              positive
              icon={<ArrowUpRight className="w-6 h-6" />}
            />
            <SummaryCard
              title="Monthly SIP"
              value="₹15,000"
              change="Active"
              icon={<Calculator className="w-6 h-6" />}
            />
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Investment Growth Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Investment Growth</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={investmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#1A5F3D"
                    strokeWidth={3}
                    dot={{ fill: "#1A5F3D", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Asset Allocation Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Asset Allocation</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              <ActivityItem
                title="SIP Investment"
                description="Mutual Fund - HDFC Equity Fund"
                amount="₹5,000"
                date="Mar 20, 2026"
                type="credit"
              />
              <ActivityItem
                title="Dividend Received"
                description="Equity - TCS Ltd"
                amount="₹1,200"
                date="Mar 18, 2026"
                type="credit"
              />
              <ActivityItem
                title="SIP Investment"
                description="Mutual Fund - Axis Bluechip Fund"
                amount="₹10,000"
                date="Mar 15, 2026"
                type="credit"
              />
              <ActivityItem
                title="Withdrawal"
                description="Bank Transfer"
                amount="₹20,000"
                date="Mar 12, 2026"
                type="debit"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ icon, label, active, to }: { icon: React.ReactNode; label: string; active?: boolean; to?: string }) {
  const content = (
    <div
      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
        active
          ? "bg-gradient-to-r from-[#1A5F3D] to-[#2D7A4E] text-white"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}

function SummaryCard({
  title,
  value,
  change,
  positive,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  positive?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1A5F3D] to-[#3FAF7D] flex items-center justify-center text-white">
          {icon}
        </div>
        {change && (
          <span
            className={`text-sm font-semibold ${
              positive === false ? "text-red-600" : positive ? "text-green-600" : "text-blue-600"
            }`}
          >
            {change}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </motion.div>
  );
}

function ActivityItem({
  title,
  description,
  amount,
  date,
  type,
}: {
  title: string;
  description: string;
  amount: string;
  date: string;
  type: "credit" | "debit";
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center space-x-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            type === "credit" ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {type === "credit" ? (
            <ArrowDownRight className="w-5 h-5 text-green-600" />
          ) : (
            <ArrowUpRight className="w-5 h-5 text-red-600" />
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{title}</p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={`font-semibold ${
            type === "credit" ? "text-green-600" : "text-red-600"
          }`}
        >
          {type === "credit" ? "+" : "-"}{amount}
        </p>
        <p className="text-sm text-gray-600">{date}</p>
      </div>
    </div>
  );
}