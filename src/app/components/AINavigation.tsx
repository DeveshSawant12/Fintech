// AINavigation.tsx
// Now all AI features are in the unified chat. Links open the chat page.
import { Link } from "react-router";
import { MessageSquare, Activity, Target, Umbrella, TrendingUp, Zap, Calculator, Sparkles, CreditCard } from "lucide-react";
import { motion } from "motion/react";

const aiFeatures = [
  { icon: MessageSquare, title: "AI Chat",      desc: "Talk to your advisor",      color: "from-green-500 to-green-600" },
  { icon: Activity,      title: "Health Score", desc: "Financial health check",    color: "from-blue-500 to-blue-600" },
  { icon: Target,        title: "Goals",         desc: "Track your goals",         color: "from-purple-500 to-purple-600" },
  { icon: Umbrella,      title: "Retirement",   desc: "Plan your retirement",      color: "from-orange-500 to-orange-600" },
  { icon: TrendingUp,    title: "Investments",  desc: "Portfolio analysis",        color: "from-emerald-500 to-emerald-600" },
  { icon: CreditCard,    title: "Loans",        desc: "Debt strategy",             color: "from-red-500 to-red-600" },
  { icon: Calculator,    title: "Tax",          desc: "Save on taxes",             color: "from-violet-500 to-violet-600" },
  { icon: Zap,           title: "What-If",      desc: "Test scenarios",            color: "from-yellow-500 to-yellow-600" },
  { icon: TrendingUp,    title: "Forecast",     desc: "Wealth projection",         color: "from-indigo-500 to-indigo-600" },
];

export function AINavigationSection() {
  return (
    <div className="bg-gradient-to-br from-[#1A5F3D] to-[#3FAF7D] rounded-3xl p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-8 h-8 text-white" />
        <div>
          <h2 className="text-2xl font-bold text-white">AI Wealth Assistant</h2>
          <p className="text-white/80 text-sm">All features in one chat — ask anything</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {aiFeatures.map((feature, i) => (
          <Link key={i} to="/ai/chat">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/20 transition-all cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <feature.icon className="text-white" size={24} />
              </div>
              <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-xs text-white/70">{feature.desc}</p>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
