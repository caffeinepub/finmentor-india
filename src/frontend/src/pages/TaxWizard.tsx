import { Badge } from "@/components/ui/badge";
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
import { AlertCircle, ArrowLeft, Calculator, CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

interface TaxInputs {
  basicSalary: number;
  hraReceived: number;
  actualRentPaid: number;
  cityType: "Metro" | "Non-metro";
  lta: number;
  specialAllowance: number;
  otherIncome: number;
  inv80C: number;
  premium80D: number;
  nps80CCD: number;
  homeLoanInterest: number;
}

interface TaxResult {
  grossIncome: number;
  hraExemption: number;
  oldTax: number;
  newTax: number;
  oldTaxableIncome: number;
  newTaxableIncome: number;
  saving: number;
  recommended: "Old" | "New";
  missedDeductions: { name: string; potential: number }[];
}

function calcOldSlab(income: number): number {
  let tax = 0;
  if (income > 1000000) tax += (income - 1000000) * 0.3;
  if (income > 500000) tax += (Math.min(income, 1000000) - 500000) * 0.2;
  if (income > 250000) tax += (Math.min(income, 500000) - 250000) * 0.05;
  return tax * 1.04;
}

function calcNewSlab(income: number): number {
  let tax = 0;
  if (income > 1500000) tax += (income - 1500000) * 0.3;
  if (income > 1200000) tax += (Math.min(income, 1500000) - 1200000) * 0.2;
  if (income > 1000000) tax += (Math.min(income, 1200000) - 1000000) * 0.15;
  if (income > 700000) tax += (Math.min(income, 1000000) - 700000) * 0.1;
  if (income > 300000) tax += (Math.min(income, 700000) - 300000) * 0.05;
  return tax * 1.04;
}

function calculateTax(inputs: TaxInputs): TaxResult {
  const gross =
    inputs.basicSalary +
    inputs.hraReceived +
    inputs.lta +
    inputs.specialAllowance +
    inputs.otherIncome;

  const hraOpt1 = inputs.hraReceived;
  const hraOpt2 = inputs.actualRentPaid - 0.1 * inputs.basicSalary;
  const hraOpt3 =
    inputs.cityType === "Metro"
      ? 0.5 * inputs.basicSalary
      : 0.4 * inputs.basicSalary;
  const hraExemption = Math.max(
    0,
    Math.min(hraOpt1, Math.max(0, hraOpt2), hraOpt3),
  );

  const stdDedOld = 50000;
  const c80 = Math.min(inputs.inv80C, 150000);
  const d80 = Math.min(inputs.premium80D, 25000);
  const nps = Math.min(inputs.nps80CCD, 50000);
  const hl = Math.min(inputs.homeLoanInterest, 200000);
  const oldTaxable = Math.max(
    0,
    gross - stdDedOld - c80 - d80 - nps - hl - hraExemption,
  );
  const oldTax = calcOldSlab(oldTaxable);

  const stdDedNew = 75000;
  const newTaxable = Math.max(0, gross - stdDedNew);
  const newTax = calcNewSlab(newTaxable);

  const recommended = oldTax <= newTax ? "Old" : "New";

  const missedDeductions: { name: string; potential: number }[] = [];
  if (inputs.inv80C < 150000)
    missedDeductions.push({
      name: "80C (ELSS/PPF/LIC)",
      potential: (150000 - inputs.inv80C) * 0.3,
    });
  if (inputs.premium80D < 25000)
    missedDeductions.push({
      name: "80D Health Insurance",
      potential: (25000 - inputs.premium80D) * 0.3,
    });
  if (inputs.nps80CCD < 50000)
    missedDeductions.push({
      name: "80CCD(1B) NPS",
      potential: (50000 - inputs.nps80CCD) * 0.3,
    });
  if (inputs.homeLoanInterest === 0)
    missedDeductions.push({
      name: "Section 24 Home Loan Interest",
      potential: 200000 * 0.3,
    });

  return {
    grossIncome: gross,
    hraExemption,
    oldTax,
    newTax,
    oldTaxableIncome: oldTaxable,
    newTaxableIncome: newTaxable,
    saving: Math.abs(oldTax - newTax),
    recommended,
    missedDeductions,
  };
}

const salaryFields = [
  {
    key: "basicSalary" as const,
    label: "Basic Salary (Annual ₹)",
    ocid: "tax.basic_salary.input",
  },
  {
    key: "hraReceived" as const,
    label: "HRA Received (Annual ₹)",
    ocid: "tax.hra_received.input",
  },
  {
    key: "actualRentPaid" as const,
    label: "Actual Rent Paid (Annual ₹)",
    ocid: "tax.actual_rent.input",
  },
  { key: "lta" as const, label: "LTA (Annual ₹)", ocid: "tax.lta.input" },
  {
    key: "specialAllowance" as const,
    label: "Special Allowance (Annual ₹)",
    ocid: "tax.special_allowance.input",
  },
  {
    key: "otherIncome" as const,
    label: "Other Income (Annual ₹)",
    ocid: "tax.other_income.input",
  },
];

const deductionFields = [
  {
    key: "inv80C" as const,
    label: "80C Investments (max ₹1.5L)",
    ocid: "tax.inv80c.input",
  },
  {
    key: "premium80D" as const,
    label: "80D Health Insurance Premium",
    ocid: "tax.premium80d.input",
  },
  {
    key: "nps80CCD" as const,
    label: "NPS 80CCD(1B) (max ₹50K)",
    ocid: "tax.nps.input",
  },
  {
    key: "homeLoanInterest" as const,
    label: "Home Loan Interest (max ₹2L)",
    ocid: "tax.home_loan.input",
  },
];

const comparisonRows = (inputs: TaxInputs, result: TaxResult) => [
  { label: "Gross Income", old: result.grossIncome, new: result.grossIncome },
  { label: "HRA Exemption", old: result.hraExemption, new: 0 },
  { label: "Standard Deduction", old: 50000, new: 75000 },
  {
    label: "Other Deductions",
    old:
      Math.min(inputs.inv80C, 150000) +
      Math.min(inputs.premium80D, 25000) +
      Math.min(inputs.nps80CCD, 50000) +
      Math.min(inputs.homeLoanInterest, 200000),
    new: 0,
  },
  {
    label: "Taxable Income",
    old: result.oldTaxableIncome,
    new: result.newTaxableIncome,
  },
  { label: "Total Tax (incl. cess)", old: result.oldTax, new: result.newTax },
];

export default function TaxWizard() {
  const [inputs, setInputs] = useState<TaxInputs>({
    basicSalary: 800000,
    hraReceived: 240000,
    actualRentPaid: 180000,
    cityType: "Metro",
    lta: 50000,
    specialAllowance: 300000,
    otherIncome: 0,
    inv80C: 100000,
    premium80D: 15000,
    nps80CCD: 0,
    homeLoanInterest: 0,
  });
  const [result, setResult] = useState<TaxResult | null>(null);

  const set =
    (key: keyof TaxInputs) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setInputs((p) => ({
        ...p,
        [key]: Number.parseFloat(e.target.value) || 0,
      }));

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
          <h1 className="text-2xl font-bold text-foreground">Tax Wizard</h1>
          <p className="text-muted-foreground text-sm">
            FY 2024-25 · Old vs New Regime
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">
              Salary & Income Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {salaryFields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-foreground/80 text-sm">
                  {field.label}
                </Label>
                <Input
                  type="number"
                  value={inputs[field.key]}
                  onChange={set(field.key)}
                  className="bg-input border-border text-foreground"
                  data-ocid={field.ocid}
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className="text-foreground/80 text-sm">City Type</Label>
              <Select
                value={inputs.cityType}
                onValueChange={(v) =>
                  setInputs((p) => ({
                    ...p,
                    cityType: v as TaxInputs["cityType"],
                  }))
                }
              >
                <SelectTrigger
                  className="bg-input border-border text-foreground"
                  data-ocid="tax.city_type.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="Metro">Metro</SelectItem>
                  <SelectItem value="Non-metro">Non-metro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="border-t border-border pt-4 space-y-4">
              <p className="text-sm font-semibold text-foreground">
                Deductions (Old Regime)
              </p>
              {deductionFields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-foreground/80 text-sm">
                    {field.label}
                  </Label>
                  <Input
                    type="number"
                    value={inputs[field.key]}
                    onChange={set(field.key)}
                    className="bg-input border-border text-foreground"
                    data-ocid={field.ocid}
                  />
                </div>
              ))}
            </div>
            <Button
              onClick={() => setResult(calculateTax(inputs))}
              className="w-full gold-gradient text-primary-foreground font-semibold"
              data-ocid="tax.calculate.button"
            >
              <Calculator className="mr-2 h-4 w-4" /> Calculate Tax
            </Button>
          </CardContent>
        </Card>

        {result && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <Card className="bg-card border-border border-primary/30">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <p className="font-semibold text-foreground">
                    Recommended: {result.recommended} Regime
                  </p>
                </div>
                <p className="text-muted-foreground text-sm">
                  You save{" "}
                  <span className="text-primary font-bold">
                    {fmt(result.saving)}
                  </span>{" "}
                  by choosing the {result.recommended} regime.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-base">
                  Side-by-Side Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                        Item
                      </th>
                      <th className="text-right px-4 py-3 text-muted-foreground font-medium">
                        Old
                      </th>
                      <th className="text-right px-4 py-3 text-muted-foreground font-medium">
                        New
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows(inputs, result).map((row) => (
                      <tr key={row.label} className="border-b border-border/40">
                        <td className="px-4 py-2.5 text-foreground">
                          {row.label}
                        </td>
                        <td
                          className={`px-4 py-2.5 text-right font-medium ${row.label === "Total Tax (incl. cess)" && result.recommended === "Old" ? "text-primary" : "text-foreground"}`}
                        >
                          {fmt(row.old)}
                        </td>
                        <td
                          className={`px-4 py-2.5 text-right font-medium ${row.label === "Total Tax (incl. cess)" && result.recommended === "New" ? "text-primary" : "text-foreground"}`}
                        >
                          {fmt(row.new)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {result.missedDeductions.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground text-base flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-400" />
                    Deductions You're Missing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.missedDeductions.map((d, i) => (
                    <div
                      key={d.name}
                      className="flex items-center justify-between py-2 border-b border-border/40 last:border-0"
                      data-ocid={`tax.missed_deduction.item.${i + 1}`}
                    >
                      <p className="text-sm text-foreground">{d.name}</p>
                      <Badge className="bg-yellow-400/15 text-yellow-400 border-yellow-400/30 text-xs">
                        Save ~{fmt(d.potential)}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
