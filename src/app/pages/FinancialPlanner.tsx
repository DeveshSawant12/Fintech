import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ChevronRight, ChevronLeft, Download, Target, PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

const steps = ["Personal Info", "Financial Goals", "Risk Profile", "Current Investments", "Results"];

export function FinancialPlanner() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Personal Info
    name: "",
    age: "",
    monthlyIncome: "",
    // Financial Goals
    goalType: "",
    goalAmount: "",
    yearsToGoal: "",
    // Risk Profile
    riskAppetite: "",
    investmentExperience: "",
    // Current Investments
    currentSavings: "",
    monthlyExpenses: "",
  });

  const updateFormData = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const allocationData = [
    { name: "Equity Funds", value: 45, color: "#1A5F3D" },
    { name: "Debt Funds", value: 30, color: "#2D7A4E" },
    { name: "Gold", value: 15, color: "#3FAF7D" },
    { name: "Emergency Fund", value: 10, color: "#B8E986" },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-br from-[#1A5F3D] to-[#2D7A4E] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
              <Target className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Financial Planning</h1>
              <p className="text-xl text-white/90 mt-2">
                Create your personalized financial roadmap
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    index <= currentStep
                      ? "bg-gradient-to-r from-[#1A5F3D] to-[#2D7A4E] text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 sm:w-24 h-1 mx-2 transition-all ${
                      index < currentStep ? "bg-[#1A5F3D]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900">{steps[currentStep]}</p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            {/* Step 0: Personal Info */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A5F3D] focus:border-transparent outline-none"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => updateFormData("age", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A5F3D] focus:border-transparent outline-none"
                    placeholder="Enter your age"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Income (₹)</label>
                  <input
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={(e) => updateFormData("monthlyIncome", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A5F3D] focus:border-transparent outline-none"
                    placeholder="Enter your monthly income"
                  />
                </div>
              </div>
            )}

            {/* Step 1: Financial Goals */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Goals</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Goal</label>
                  <select
                    value={formData.goalType}
                    onChange={(e) => updateFormData("goalType", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A5F3D] focus:border-transparent outline-none"
                  >
                    <option value="">Select a goal</option>
                    <option value="retirement">Retirement Planning</option>
                    <option value="home">Home Purchase</option>
                    <option value="education">Child's Education</option>
                    <option value="wealth">Wealth Creation</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.goalAmount}
                    onChange={(e) => updateFormData("goalAmount", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A5F3D] focus:border-transparent outline-none"
                    placeholder="Enter target amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Horizon (Years)</label>
                  <input
                    type="number"
                    value={formData.yearsToGoal}
                    onChange={(e) => updateFormData("yearsToGoal", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A5F3D] focus:border-transparent outline-none"
                    placeholder="Years to achieve goal"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Risk Profile */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Risk Profile</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">Risk Appetite</label>
                  <div className="space-y-3">
                    <RiskOption
                      value="conservative"
                      label="Conservative"
                      description="Low risk, stable returns"
                      selected={formData.riskAppetite === "conservative"}
                      onClick={() => updateFormData("riskAppetite", "conservative")}
                    />
                    <RiskOption
                      value="moderate"
                      label="Moderate"
                      description="Balanced risk and returns"
                      selected={formData.riskAppetite === "moderate"}
                      onClick={() => updateFormData("riskAppetite", "moderate")}
                    />
                    <RiskOption
                      value="aggressive"
                      label="Aggressive"
                      description="High risk, high returns"
                      selected={formData.riskAppetite === "aggressive"}
                      onClick={() => updateFormData("riskAppetite", "aggressive")}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Investment Experience</label>
                  <select
                    value={formData.investmentExperience}
                    onChange={(e) => updateFormData("investmentExperience", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A5F3D] focus:border-transparent outline-none"
                  >
                    <option value="">Select experience level</option>
                    <option value="beginner">Beginner (0-2 years)</option>
                    <option value="intermediate">Intermediate (3-5 years)</option>
                    <option value="experienced">Experienced (5+ years)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: Current Investments */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Financial Status</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Savings (₹)</label>
                  <input
                    type="number"
                    value={formData.currentSavings}
                    onChange={(e) => updateFormData("currentSavings", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A5F3D] focus:border-transparent outline-none"
                    placeholder="Total savings and investments"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Expenses (₹)</label>
                  <input
                    type="number"
                    value={formData.monthlyExpenses}
                    onChange={(e) => updateFormData("monthlyExpenses", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A5F3D] focus:border-transparent outline-none"
                    placeholder="Average monthly expenses"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Results */}
            {currentStep === 4 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Financial Plan</h2>
                  <p className="text-gray-600">Based on your inputs, here's your personalized recommendation</p>
                </div>

                {/* Monthly Investment Recommendation */}
                <div className="p-6 bg-gradient-to-r from-[#1A5F3D] to-[#2D7A4E] rounded-2xl text-white">
                  <h3 className="text-xl font-bold mb-2">Recommended Monthly Investment</h3>
                  <p className="text-4xl font-bold">₹18,500</p>
                  <p className="text-white/80 mt-2">To achieve your goal of ₹{formData.goalAmount || "1,00,00,000"} in {formData.yearsToGoal || "20"} years</p>
                </div>

                {/* Asset Allocation */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Recommended Asset Allocation</h3>
                  <div className="grid md:grid-cols-2 gap-8">
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
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="space-y-3">
                      {allocationData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: item.color }} />
                            <span className="font-medium text-gray-900">{item.name}</span>
                          </div>
                          <span className="font-bold text-gray-900">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Key Recommendations */}
                <div className="bg-blue-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Key Recommendations</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="w-2 h-2 rounded-full bg-[#1A5F3D] mt-2 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">Start with a diversified portfolio across equity and debt instruments</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 rounded-full bg-[#1A5F3D] mt-2 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">Maintain an emergency fund of 6 months' expenses</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 rounded-full bg-[#1A5F3D] mt-2 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">Review and rebalance your portfolio annually</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 rounded-full bg-[#1A5F3D] mt-2 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">Consider tax-saving investments under Section 80C</span>
                    </li>
                  </ul>
                </div>

                {/* Download Button */}
                <button className="w-full py-4 bg-gradient-to-r from-[#1A5F3D] to-[#2D7A4E] text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center">
                  <Download className="w-5 h-5 mr-2" />
                  Download Financial Plan PDF
                </button>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-8 border-t border-gray-200">
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Previous
                </button>
              )}
              
              {currentStep < steps.length - 1 && (
                <button
                  onClick={nextStep}
                  className="ml-auto px-6 py-3 bg-gradient-to-r from-[#1A5F3D] to-[#2D7A4E] text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center"
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-1" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function RiskOption({
  value,
  label,
  description,
  selected,
  onClick,
}: {
  value: string;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
        selected
          ? "border-[#1A5F3D] bg-[#1A5F3D]/5"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-center">
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
            selected ? "border-[#1A5F3D]" : "border-gray-300"
          }`}
        >
          {selected && <div className="w-3 h-3 rounded-full bg-[#1A5F3D]" />}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}
