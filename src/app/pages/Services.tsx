import { useState } from "react";
import { Link } from "react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import {
  TrendingUp,
  Shield,
  Target,
  PieChart,
  Calculator,
  Users,
  Briefcase,
  Award,
  Clock,
  HeadphonesIcon,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { motion } from "motion/react";

const services = [
  {
    icon: <Target className="w-8 h-9" />,
    title: "Investment Planning",
    description:
      "Strategic investment plans designed to meet your financial goals with optimal returns.",
    features: [
      "Personalized investment strategies",
      "Goal-based planning",
      "Regular portfolio reviews",
    ],
    learnMoreUrl:
      "https://www.investor.gov/introduction-investing",
    tag: "Goal Focused",
    accent: "from-emerald-700 to-green-500",
    softBg: "from-emerald-50/80 to-green-100/40",
    glow: "bg-emerald-300/25",
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Risk Management",
    description:
      "Protect your wealth with comprehensive risk assessment and management strategies.",
    features: [
      "Risk profiling",
      "Insurance planning",
      "Emergency fund setup",
    ],
    learnMoreUrl:
      "https://www.investor.gov/introduction-investing/getting-started/asset-allocation",
    tag: "Capital Safety",
    accent: "from-teal-700 to-emerald-500",
    softBg: "from-teal-50/80 to-emerald-100/40",
    glow: "bg-teal-300/25",
  },
  {
    icon: <PieChart className="w-8 h-8" />,
    title: "Portfolio Management",
    description:
      "Diversified portfolio solutions to maximize returns while minimizing risks.",
    features: [
      "Asset allocation",
      "Regular rebalancing",
      "Performance tracking",
      "Diversification strategies",
    ],
    learnMoreUrl:
      "https://www.investor.gov/introduction-investing/investing-basics/glossary/diversification",
    tag: "Balanced Allocation",
    accent: "from-sky-700 to-cyan-500",
    softBg: "from-sky-50/80 to-cyan-100/40",
    glow: "bg-sky-300/25",
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: "Wealth Growth",
    description:
      "Accelerate your wealth creation with proven investment strategies and insights.",
    features: [
      "Growth-focused investments",
      "Compounding strategies",
      "Market insights",
    ],
    learnMoreUrl:
      "https://www.investor.gov/additional-resources/general-resources/publications-research/info-sheets/beginners-guide-asset",
    tag: "Long-Term Growth",
    accent: "from-lime-700 to-green-500",
    softBg: "from-lime-50/80 to-green-100/40",
    glow: "bg-lime-300/25",
  },
  {
    icon: <Calculator className="w-8 h-8" />,
    title: "Tax Planning",
    description:
      "Smart tax-saving strategies to optimize your investments and maximize savings.",
    features: [
      "Tax-saving investments",
      "Capital gains planning",
      "Tax filing support",
    ],
    learnMoreUrl:
      "https://www.irs.gov/newsroom/year-round-tax-planning-pointers-for-taxpayers",
    tag: "Tax Smart",
    accent: "from-amber-700 to-orange-500",
    softBg: "from-amber-50/80 to-orange-100/40",
    glow: "bg-amber-300/25",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Expert Guidance",
    description:
      "Personalized consultation from certified financial advisors and experts.",
    features: [
      "One-on-one consultations",
      "Financial health checkup",
      "Investment recommendations",
      "Ongoing support",
    ],
    learnMoreUrl:
      "https://www.investor.gov/introduction-investing/getting-started/working-investment-professional",
    tag: "Advisor Support",
    accent: "from-violet-700 to-fuchsia-500",
    softBg: "from-violet-50/80 to-fuchsia-100/40",
    glow: "bg-violet-300/25",
  },
  {
    icon: <Briefcase className="w-8 h-8" />,
    title: "Retirement Planning",
    description:
      "Secure your golden years with comprehensive retirement planning solutions.",
    features: [
      "Retirement corpus calculation",
      "Pension planning",
      "Healthcare planning",
    ],
    learnMoreUrl:
      "https://www.ssa.gov/retirement/plan-for-retirement",
    tag: "Future Ready",
    accent: "from-indigo-700 to-blue-500",
    softBg: "from-indigo-50/80 to-blue-100/40",
    glow: "bg-indigo-300/25",
  },
  {
    icon: <Award className="w-8 h-8" />,
    title: "Estate Planning",
    description:
      "Ensure your legacy with proper estate and succession planning.",
    features: [
      "Will drafting",
      "Succession planning",
      "Wealth transfer",
      "Legal documentation",
    ],
    learnMoreUrl:
      "https://www.consumerfinance.gov/consumer-tools/managing-someone-elses-money/",
    tag: "Legacy Protection",
    accent: "from-rose-700 to-pink-500",
    softBg: "from-rose-50/80 to-pink-100/40",
    glow: "bg-rose-300/25",
  },
];

export function Services() {
  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0f2a1d_0%,#1A5F3D_45%,#2D7A4E_75%,#4aa06f_100%)] text-white py-16 md:py-20">
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#B8E986]/15 blur-3xl" />
          <div className="absolute left-[15%] top-[20%] h-[180px] w-[180px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute right-[10%] bottom-[15%] h-[220px] w-[220px] rounded-full bg-[#3FAF7D]/15 blur-3xl" />
        </div>

        <div className="absolute inset-0 opacity-[0.10] [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:42px_42px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs text-white/85 backdrop-blur mb-4">
              Premium Financial Services
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-[-0.03em]">
              Our Services
            </h1>

            <p className="text-lg md:text-xl text-white/85 leading-8">
              Comprehensive financial solutions designed to help
              you achieve your goals and secure your future.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="relative py-24 overflow-hidden bg-[radial-gradient(circle_at_top,rgba(63,175,125,0.10),transparent_30%),linear-gradient(to_bottom,#f8fbf9,#eef5f1_45%,#ffffff_100%)]">
        <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(26,95,61,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(26,95,61,0.05)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-[#B8E986]/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-[#3FAF7D]/10 blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center rounded-full border border-[#d7eadf] bg-white/70 backdrop-blur px-4 py-2 text-sm font-medium text-[#1A5F3D] mb-4">
              Tap Any Card To Explore
            </div>
            <p className="text-gray-600 text-lg">
              Flip the cards to discover details and helpful
              resources.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <ServiceFlipCard
                key={index}
                {...service}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="relative py-24 overflow-hidden bg-white">
        <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-[#B8E986]/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-[#3FAF7D]/10 blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center rounded-full border border-[#d7eadf] bg-[#f6fbf8] px-4 py-2 text-sm font-medium text-[#1A5F3D] mb-5">
              Why People Choose Us
            </div>

            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose SmartFinance?
            </h2>
            <p className="text-xl text-gray-600">
              Your trusted partner for financial success
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Award className="w-8 h-8" />}
              title="Expert Team"
              description="Certified financial advisors with years of experience"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Secure Platform"
              description="Bank-grade security for your data and transactions"
            />
            <FeatureCard
              icon={<Clock className="w-8 h-8" />}
              title="24/7 Support"
              description="Round-the-clock assistance when you need it"
            />
            <FeatureCard
              icon={<HeadphonesIcon className="w-8 h-8" />}
              title="Personalized Service"
              description="Tailored solutions for your unique needs"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden bg-[linear-gradient(135deg,#0c1f17_0%,#123d2a_40%,#1A5F3D_70%,#2D7A4E_100%)] text-white">
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-[45%] h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3FAF7D]/15 blur-[100px]" />
        </div>

        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:40px_40px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block rounded-[28px] border border-white/15 bg-white/10 backdrop-blur-xl px-8 py-8 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Your Financial Journey?
            </h2>
            <p className="text-lg mb-8 text-white/85 max-w-2xl mx-auto leading-8">
              Schedule a free consultation with our experts and
              begin building a smarter financial future today.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/signup"
                className="px-8 py-4 rounded-full bg-[#D8F46B] text-black font-semibold shadow-[0_10px_30px_rgba(184,233,134,0.35)] hover:scale-105 hover:shadow-[0_15px_40px_rgba(184,233,134,0.45)] transition-all"
              >
                Get Started
              </Link>

              <Link
                to="/planner"
                className="px-8 py-4 rounded-full border border-white/20 bg-white/10 text-white font-semibold hover:bg-white hover:text-[#1A5F3D] transition-all"
              >
                Try Planner
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ServiceFlipCard({
  icon,
  title,
  description,
  features,
  learnMoreUrl,
  tag,
  accent,
  softBg,
  glow,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  learnMoreUrl: string;
  tag: string;
  accent: string;
  softBg: string;
  glow: string;
  index: number;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="group [perspective:1200px]"
    >
      <div
        className={`relative h-[340px] w-full cursor-pointer rounded-[30px] transition-transform duration-700 [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
        onClick={() => setFlipped((prev) => !prev)}
      >
        {/* Front */}
        <div
          className={`absolute inset-0 rounded-[30px] border border-white/70 bg-gradient-to-br ${softBg} backdrop-blur-xl shadow-[0_10px_30px_rgba(15,23,42,0.06)] [backface-visibility:hidden] overflow-hidden`}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/70 to-transparent opacity-90" />
          <div
            className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full ${glow} blur-3xl opacity-80`}
          />
          <div className="pointer-events-none absolute inset-0 rounded-[30px] ring-1 ring-inset ring-white/60" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.20] [background-image:linear-gradient(rgba(26,95,61,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(26,95,61,0.07)_1px,transparent_1px)] [background-size:28px_28px]" />

          <div className="relative z-10 flex h-full flex-col justify-between p-7">
            <div className="flex items-start justify-between">
              <div className="inline-flex items-center rounded-full border border-white/70 bg-white/55 px-3 py-1 text-xs font-semibold text-gray-700 backdrop-blur">
                {tag}
              </div>

              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)]`}
              >
                {icon}
              </div>
            </div>

            <div>
              <h3 className="text-4xl font-bold text-gray-900 tracking-[-0.03em] leading-tight">
                {title}
              </h3>
              <p className="mt-4 text-gray-600 leading-7 max-w-md">
                Smart financial support designed around your
                specific needs.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#1A5F3D]">
                Tap to explore
              </p>

              <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-sm font-semibold text-gray-800 backdrop-blur">
                View Details
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 rounded-[30px] border border-white/70 bg-white/72 backdrop-blur-xl shadow-[0_12px_35px_rgba(15,23,42,0.08)] [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/85 to-transparent opacity-95" />
          <div
            className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full ${glow} blur-3xl opacity-80`}
          />
          <div className="pointer-events-none absolute inset-0 rounded-[30px] ring-1 ring-inset ring-white/60" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#1A5F3D]/[0.03] via-transparent to-white/20" />

          <div className="relative z-10 flex h-full flex-col p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="inline-flex items-center rounded-full border border-[#dbeee3] bg-[#f3faf6] px-3 py-1 text-xs font-semibold text-[#1A5F3D] mb-3">
                  {tag}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 tracking-[-0.02em]">
                  {title}
                </h3>

                <p className="text-gray-600 mt-2 leading-6 text-sm">
                  {description}
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFlipped(false);
                }}
                className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef8f2] text-[#1A5F3D] hover:bg-[#1A5F3D] hover:text-white transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 mb-6 mt-2 flex-1">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1A5F3D] mt-2.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700 text-sm leading-6">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <a
              href={learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#eef8f2] px-4 py-3 text-sm font-semibold text-[#1A5F3D] transition-all duration-300 hover:bg-[#1A5F3D] hover:text-white"
            >
              Learn More
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group text-center rounded-[28px] border border-white/60 bg-white/65 backdrop-blur-xl p-8 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(26,95,61,0.10)]">
      <div className="w-16 h-16 bg-gradient-to-br from-[#1A5F3D] to-[#3FAF7D] rounded-2xl flex items-center justify-center text-white mx-auto mb-5 shadow-[0_10px_25px_rgba(26,95,61,0.25)] transition duration-500 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 leading-7">{description}</p>
    </div>
  );
}