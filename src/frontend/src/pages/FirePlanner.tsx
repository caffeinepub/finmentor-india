import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  PieChart,
  Target,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

interface FireInputs {
  currentAge: number;
  targetAge: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  existingCorpus: number;
  annualReturn: number;
  annualInflation: number;
  riskProfile: "Conservative" | "Moderate" | "Aggressive";
}

interface FireResult {
  fireCorpus: number;
  monthlySIP: number;
  yearsToFire: number;
  futureMonthlyExpenses: number;
  allocation: { equity: number; debt: number };
  milestones: { year: number; age: number; corpus: number }[];
}

const allocations = {
  Conservative: { equity: 40, debt: 60 },
  Moderate: { equity: 60, debt: 40 },
  Aggressive: { equity: 80, debt: 20 },
};

function calculate(inputs: FireInputs): FireResult {
  const years = inputs.targetAge - inputs.currentAge;
  const months = years * 12;
  const monthlyReturn = inputs.annualReturn / 100 / 12;
  const futureMonthlyExpenses =
    inputs.monthlyExpenses * (1 + inputs.annualInflation / 100) ** years;
  const annualExpensesAtRetirement = futureMonthlyExpenses * 12;
  const fireCorpus = annualExpensesAtRetirement / 0.04;

  const grownCorpus =
    inputs.existingCorpus * (1 + inputs.annualReturn / 100) ** years;
  const remaining = Math.max(0, fireCorpus - grownCorpus);

  let monthlySIP = 0;
  if (monthlyReturn > 0 && months > 0) {
    const fvFactor = (1 + monthlyReturn) ** months - 1;
    monthlySIP = (remaining * monthlyReturn) / fvFactor;
  } else {
    monthlySIP = remaining / months;
  }

  const milestones: { year: number; age: number; corpus: number }[] = [];
  for (let y = 5; y <= years; y += 5) {
    const m = y * 12;
    const fv =
      inputs.existingCorpus * (1 + inputs.annualReturn / 100) ** y +
      (monthlyReturn > 0
        ? (monthlySIP * ((1 + monthlyReturn) ** m - 1)) / monthlyReturn
        : monthlySIP * m);
    milestones.push({ year: y, age: inputs.currentAge + y, corpus: fv });
  }

  return {
    fireCorpus,
    monthlySIP,
    yearsToFire: years,
    futureMonthlyExpenses,
    allocation: allocations[inputs.riskProfile],
    milestones,
  };
}

export default function FirePlanner() {
  const [inputs, setInputs] = useState<FireInputs>({
    currentAge: 30,
    targetAge: 50,
    monthlyIncome: 100000,
    monthlyExpenses: 60000,
    existingCorpus: 500000,
    annualReturn: 12,
    annualInflation: 6,
    riskProfile: "Moderate",
  });
  const [result, setResult] = useState<FireResult | null>(null);

  const set =
    (key: keyof FireInputs) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setInputs((p) => ({
        ...p,
        [key]: Number.parseFloat(e.target.value) || 0,
      }));

  const handleCalculate = () => setResult(calculate(inputs));

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="text-muted-foreground"
        >
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            FIRE Path Planner
          </h1>
          <p className="text-muted-foreground text-sm">
            Financial Independence, Retire Early
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">
              Your Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-foreground/80 text-sm">
                  Current Age
                </Label>
                <Input
                  type="number"
                  value={inputs.currentAge}
                  onChange={set("currentAge")}
                  className="bg-input border-border text-foreground"
                  data-ocid="fire.current_age.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground/80 text-sm">
                  Target Retirement Age
                </Label>
                <Input
                  type="number"
                  value={inputs.targetAge}
                  onChange={set("targetAge")}
                  className="bg-input border-border text-foreground"
                  data-ocid="fire.target_age.input"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80 text-sm">
                Monthly Income (₹)
              </Label>
              <Input
                type="number"
                value={inputs.monthlyIncome}
                onChange={set("monthlyIncome")}
                className="bg-input border-border text-foreground"
                data-ocid="fire.monthly_income.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80 text-sm">
                Monthly Expenses (₹)
              </Label>
              <Input
                type="number"
                value={inputs.monthlyExpenses}
                onChange={set("monthlyExpenses")}
                className="bg-input border-border text-foreground"
                data-ocid="fire.monthly_expenses.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80 text-sm">
                Existing Corpus/Investments (₹)
              </Label>
              <Input
                type="number"
                value={inputs.existingCorpus}
                onChange={set("existingCorpus")}
                className="bg-input border-border text-foreground"
                data-ocid="fire.existing_corpus.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-foreground/80 text-sm">
                  Expected Return (%)
                </Label>
                <Input
                  type="number"
                  value={inputs.annualReturn}
                  onChange={set("annualReturn")}
                  className="bg-input border-border text-foreground"
                  data-ocid="fire.annual_return.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground/80 text-sm">
                  Inflation (%)
                </Label>
                <Input
                  type="number"
                  value={inputs.annualInflation}
                  onChange={set("annualInflation")}
                  className="bg-input border-border text-foreground"
                  data-ocid="fire.annual_inflation.input"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80 text-sm">Risk Profile</Label>
              <Select
                value={inputs.riskProfile}
                onValueChange={(v) =>
                  setInputs((p) => ({
                    ...p,
                    riskProfile: v as FireInputs["riskProfile"],
                  }))
                }
              >
                <SelectTrigger
                  className="bg-input border-border text-foreground"
                  data-ocid="fire.risk_profile.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="Conservative">Conservative</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleCalculate}
              className="w-full gold-gradient text-primary-foreground font-semibold"
              data-ocid="fire.calculate.button"
            >
              <TrendingUp className="mr-2 h-4 w-4" /> Calculate My FIRE
            </Button>
          </CardContent>
        </Card>

        {result && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "FIRE Corpus Needed",
                  value: fmt(result.fireCorpus),
                  icon: Target,
                  color: "text-primary",
                },
                {
                  label: "Monthly SIP Required",
                  value: fmt(result.monthlySIP),
                  icon: TrendingUp,
                  color: "text-emerald-400",
                },
                {
                  label: "Years to FIRE",
                  value: `${result.yearsToFire} yrs`,
                  icon: Calendar,
                  color: "text-blue-400",
                },
                {
                  label: "Monthly Expense at Retirement",
                  value: fmt(result.futureMonthlyExpenses),
                  icon: PieChart,
                  color: "text-violet-400",
                },
              ].map((item) => (
                <Card key={item.label} className="bg-card border-border">
                  <CardContent className="p-4">
                    <item.icon className={`h-4 w-4 ${item.color} mb-2`} />
                    <p className={`text-xl font-bold ${item.color}`}>
                      {item.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-foreground mb-3">
                  Recommended Asset Allocation ({inputs.riskProfile})
                </p>
                <div className="flex gap-3">
                  <div className="flex-1 bg-chart-1/20 border border-chart-1/30 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-primary">
                      {result.allocation.equity}%
                    </p>
                    <p className="text-xs text-muted-foreground">Equity</p>
                  </div>
                  <div className="flex-1 bg-chart-2/20 border border-chart-2/30 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-chart-2">
                      {result.allocation.debt}%
                    </p>
                    <p className="text-xs text-muted-foreground">Debt</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {result && result.milestones.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">
                Corpus Growth Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-medium">
                        Year
                      </th>
                      <th className="text-left py-2 text-muted-foreground font-medium">
                        Your Age
                      </th>
                      <th className="text-right py-2 text-muted-foreground font-medium">
                        Projected Corpus
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.milestones.map((m, i) => (
                      <tr
                        key={m.year}
                        className="border-b border-border/40"
                        data-ocid={`fire.milestone.item.${i + 1}`}
                      >
                        <td className="py-2.5 text-foreground">
                          Year {m.year}
                        </td>
                        <td className="py-2.5 text-foreground">Age {m.age}</td>
                        <td className="py-2.5 text-right font-semibold text-primary">
                          {fmt(m.corpus)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={result.milestones.map((m) => ({
                    name: `Age ${m.age}`,
                    corpus: Math.round(m.corpus / 100000),
                  }))}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.32 0.06 243)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "oklch(0.65 0.02 243)", fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fill: "oklch(0.65 0.02 243)", fontSize: 12 }}
                    tickFormatter={(v) => `₹${v}L`}
                  />
                  <Tooltip
                    formatter={(v: number) => [`₹${v} Lakhs`, "Corpus"]}
                    contentStyle={{
                      background: "oklch(0.24 0.055 243)",
                      border: "1px solid oklch(0.32 0.06 243)",
                      borderRadius: 8,
                      color: "oklch(0.97 0.005 243)",
                    }}
                  />
                  <Bar
                    dataKey="corpus"
                    fill="oklch(0.78 0.17 75)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
