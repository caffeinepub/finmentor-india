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
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

type EventType =
  | "Bonus"
  | "Marriage"
  | "New Baby"
  | "Inheritance"
  | "Home Purchase";

interface ActionStep {
  title: string;
  description: string;
  priority: "Urgent" | "Important" | "Plan";
}

const events: EventType[] = [
  "Bonus",
  "Marriage",
  "New Baby",
  "Inheritance",
  "Home Purchase",
];

const eventIcons: Record<EventType, string> = {
  Bonus: "💰",
  Marriage: "💍",
  "New Baby": "👶",
  Inheritance: "🏛️",
  "Home Purchase": "🏠",
};

const priorityStyles: Record<string, string> = {
  Urgent: "bg-destructive/15 text-red-400 border-red-400/30",
  Important: "bg-yellow-400/15 text-yellow-400 border-yellow-400/30",
  Plan: "bg-emerald-400/15 text-emerald-400 border-emerald-400/30",
};

function bonusAdvice(
  amount: number,
  efMonths: number,
  hasDebt: boolean,
  bracket: string,
): ActionStep[] {
  const steps: ActionStep[] = [];
  if (efMonths < 6) {
    const monthly = amount / 12;
    steps.push({
      title: "Top up Emergency Fund",
      description: `Put ${fmt(monthly * Math.max(0, 6 - efMonths))} from your bonus into a liquid fund to reach 6 months of expenses covered.`,
      priority: "Urgent",
    });
  }
  if (hasDebt)
    steps.push({
      title: "Clear High-Interest Debt",
      description:
        "Use 30–40% of your bonus to pay off any credit card or personal loan debt. The guaranteed return is your interest rate.",
      priority: "Urgent",
    });
  steps.push({
    title: "Tax-Saving Investment",
    description: `If in ${bracket} bracket, invest up to ₹1.5L in ELSS (lock-in 3 years) or PPF for 80C benefits.`,
    priority: "Important",
  });
  steps.push({
    title: "Step-Up SIP",
    description:
      "Increase your monthly SIP amount by 10–15% using the bonus as a buffer while you adjust cash flow.",
    priority: "Important",
  });
  steps.push({
    title: "Invest the Remainder",
    description: `Invest remaining ${fmt(amount * 0.3)} in a diversified equity MF or index fund for long-term growth.`,
    priority: "Plan",
  });
  return steps;
}

function marriageAdvice(
  combinedIncome: number,
  savings: number,
  children: boolean,
  ownsHome: boolean,
): ActionStep[] {
  return [
    {
      title: "Build a Joint Emergency Fund",
      description: `Target ${fmt(combinedIncome * 6)} (6 months of combined expenses). Keep in a joint FD or liquid MF.`,
      priority: "Urgent",
    },
    {
      title: "Update Health Insurance",
      description:
        "Switch to a family floater plan. Combined cover of ₹10–15L is recommended for a couple.",
      priority: "Urgent",
    },
    {
      title: "Review & Increase Term Insurance",
      description:
        "Each partner should have term cover = 10–12× annual income. Update nominees on all policies.",
      priority: "Important",
    },
    {
      title: "Optimize Tax Strategy Together",
      description:
        "Split HRA claims, NPS contributions, and SIPs across both incomes for maximum 80C/80D efficiency.",
      priority: "Important",
    },
    ...(children
      ? [
          {
            title: "Start Child Education Fund",
            description:
              "Begin a ₹5,000/month SIP in an equity MF earmarked for education — starting early is the biggest advantage.",
            priority: "Plan" as const,
          },
        ]
      : []),
    ...(!ownsHome
      ? [
          {
            title: "Plan Your First Home",
            description: `With ${fmt(savings)} saved, target a 20% down payment. Avoid EMI exceeding 40% of combined income.`,
            priority: "Plan" as const,
          },
        ]
      : []),
  ];
}

function babyAdvice(
  income: number,
  hasHealth: boolean,
  hasTerm: boolean,
): ActionStep[] {
  return [
    ...(!hasHealth
      ? [
          {
            title: "Upgrade Health Insurance — Urgent",
            description:
              "Add newborn cover to your family floater immediately. Maternity + newborn care can cost ₹1–3L.",
            priority: "Urgent" as const,
          },
        ]
      : []),
    ...(!hasTerm
      ? [
          {
            title: "Get Term Life Insurance NOW",
            description: `You have a dependent. Get a ${fmt(income * 120)} term plan immediately — it's the most important financial step.`,
            priority: "Urgent" as const,
          },
        ]
      : []),
    {
      title: "Start Child Education SIP",
      description:
        "Start a ₹3,000–₹5,000/month SIP in Sukanya Samriddhi (girl child) or ELSS. 18 years of compounding is transformative.",
      priority: "Important",
    },
    {
      title: "Build Childcare Emergency Buffer",
      description:
        "Keep an extra ₹50,000–₹1L liquid for unexpected childcare or medical expenses beyond your emergency fund.",
      priority: "Important",
    },
    {
      title: "Review Will & Nominations",
      description:
        "Update nominees on all bank accounts, insurance policies, and MFs. Consider creating a will.",
      priority: "Plan",
    },
  ];
}

function inheritanceAdvice(
  amount: number,
  risk: string,
  hasDebt: boolean,
): ActionStep[] {
  return [
    {
      title: "Don't Rush — Park in Liquid Fund",
      description: `Park ${fmt(amount)} in a liquid mutual fund for 3–6 months while you plan. Avoid impulsive decisions.`,
      priority: "Urgent",
    },
    ...(hasDebt
      ? [
          {
            title: "Clear All High-Cost Debt",
            description:
              "Pay off credit cards, personal loans, and high-interest EMIs first. This is a guaranteed return equal to your interest rate.",
            priority: "Urgent" as const,
          },
        ]
      : []),
    {
      title: "Max Out Emergency Fund",
      description:
        "Ensure you have 6 months of expenses in a liquid fund before investing.",
      priority: "Important",
    },
    {
      title: `Invest Based on ${risk} Risk Profile`,
      description:
        risk === "Low"
          ? "Allocate 60% to debt MFs/FDs and 40% to large-cap equity index funds."
          : risk === "Medium"
            ? "Allocate 60% to diversified equity MFs and 40% to debt/FD for stability."
            : "Invest 80% in equity (ELSS, small-cap, mid-cap) for maximum long-term growth.",
      priority: "Important",
    },
    {
      title: "Consult a SEBI-Registered Advisor",
      description: `For an inheritance of ${fmt(amount)}, a one-time financial plan (₹5,000–₹15,000) is a worthwhile investment.`,
      priority: "Plan",
    },
  ];
}

function homeAdvice(
  price: number,
  savings: number,
  income: number,
  existingEMI: number,
): ActionStep[] {
  const downPayment = price * 0.2;
  const affordableEMI = income * 0.4 - existingEMI;
  const affordable = affordableEMI > 0;
  return [
    {
      title: "Save 20% Down Payment",
      description: `Target ${fmt(downPayment)} as down payment. You have ${fmt(savings)}. ${savings >= downPayment ? "You're ready!" : `Need ${fmt(downPayment - savings)} more.`}`,
      priority: "Urgent",
    },
    {
      title: affordable ? "EMI is Affordable" : "EMI May Strain Finances",
      description: affordable
        ? `Your affordable EMI is ${fmt(affordableEMI)}/month. Stick to loan amounts that keep EMI below this.`
        : "Your EMI+existing debt already exceeds 40% of income. Consider a lower-priced property or wait to save more.",
      priority: affordable ? "Important" : "Urgent",
    },
    {
      title: "Home Loan Insurance",
      description:
        "Take a reducing term plan equal to your loan amount. This protects your family if something happens to you.",
      priority: "Important",
    },
    {
      title: "Maximize Section 24 + 80EEA",
      description:
        "Claim home loan interest (max ₹2L under Sec 24) plus ₹1.5L under 80EEA if it's your first home. Total deduction: ₹3.5L.",
      priority: "Important",
    },
    {
      title: "Keep Emergency Fund Intact",
      description:
        "Don't drain your emergency fund for down payment. Aim for 6 months of EMI + expenses reserved separately.",
      priority: "Plan",
    },
  ];
}

function EventForm({
  event,
  onSubmit,
}: { event: EventType; onSubmit: (steps: ActionStep[]) => void }) {
  const [vals, setVals] = useState<Record<string, string | number>>({
    amount: 500000,
    efMonths: 3,
    hasDebt: "no",
    taxBracket: "30%",
    combinedIncome: 150000,
    savings: 500000,
    children: "no",
    ownsHome: "no",
    income: 100000,
    hasHealth: "yes",
    hasTerm: "no",
    risk: "Medium",
    targetPrice: 5000000,
    existingEMI: 0,
  });

  const set = (k: string, v: string | number) =>
    setVals((p) => ({ ...p, [k]: v }));

  const handleGenerate = () => {
    let steps: ActionStep[] = [];
    if (event === "Bonus")
      steps = bonusAdvice(
        +vals.amount,
        +vals.efMonths,
        vals.hasDebt === "yes",
        String(vals.taxBracket),
      );
    else if (event === "Marriage")
      steps = marriageAdvice(
        +vals.combinedIncome,
        +vals.savings,
        vals.children === "yes",
        vals.ownsHome === "yes",
      );
    else if (event === "New Baby")
      steps = babyAdvice(
        +vals.income,
        vals.hasHealth === "yes",
        vals.hasTerm === "yes",
      );
    else if (event === "Inheritance")
      steps = inheritanceAdvice(
        +vals.amount,
        String(vals.risk),
        vals.hasDebt === "yes",
      );
    else if (event === "Home Purchase")
      steps = homeAdvice(
        +vals.targetPrice,
        +vals.savings,
        +vals.income,
        +vals.existingEMI,
      );
    onSubmit(steps);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">
          {eventIcons[event]} {event} — Tell Us More
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {event === "Bonus" && (
          <>
            <Field
              label="Bonus Amount (₹)"
              value={+vals.amount}
              onChange={(v) => set("amount", v)}
              ocid="life.bonus_amount.input"
            />
            <Field
              label="Emergency Fund (months of expenses)"
              value={+vals.efMonths}
              onChange={(v) => set("efMonths", v)}
              ocid="life.ef_months.input"
            />
            <SelectField
              label="Do you have debt?"
              value={String(vals.hasDebt)}
              onChange={(v) => set("hasDebt", v)}
              options={["yes", "no"]}
              ocid="life.has_debt.select"
            />
            <SelectField
              label="Tax Bracket"
              value={String(vals.taxBracket)}
              onChange={(v) => set("taxBracket", v)}
              options={["20%", "30%"]}
              ocid="life.tax_bracket.select"
            />
          </>
        )}
        {event === "Marriage" && (
          <>
            <Field
              label="Combined Monthly Income (₹)"
              value={+vals.combinedIncome}
              onChange={(v) => set("combinedIncome", v)}
              ocid="life.combined_income.input"
            />
            <Field
              label="Existing Savings (₹)"
              value={+vals.savings}
              onChange={(v) => set("savings", v)}
              ocid="life.savings.input"
            />
            <SelectField
              label="Planning children?"
              value={String(vals.children)}
              onChange={(v) => set("children", v)}
              options={["yes", "no"]}
              ocid="life.children.select"
            />
            <SelectField
              label="Own home or rent?"
              value={String(vals.ownsHome)}
              onChange={(v) => set("ownsHome", v)}
              options={["yes", "no"]}
              ocid="life.owns_home.select"
            />
          </>
        )}
        {event === "New Baby" && (
          <>
            <Field
              label="Monthly Income (₹)"
              value={+vals.income}
              onChange={(v) => set("income", v)}
              ocid="life.income.input"
            />
            <Field
              label="Existing Savings (₹)"
              value={+vals.savings}
              onChange={(v) => set("savings", v)}
              ocid="life.savings.input"
            />
            <SelectField
              label="Have health insurance?"
              value={String(vals.hasHealth)}
              onChange={(v) => set("hasHealth", v)}
              options={["yes", "no"]}
              ocid="life.has_health.select"
            />
            <SelectField
              label="Have term insurance?"
              value={String(vals.hasTerm)}
              onChange={(v) => set("hasTerm", v)}
              options={["yes", "no"]}
              ocid="life.has_term.select"
            />
          </>
        )}
        {event === "Inheritance" && (
          <>
            <Field
              label="Inheritance Amount (₹)"
              value={+vals.amount}
              onChange={(v) => set("amount", v)}
              ocid="life.inheritance_amount.input"
            />
            <SelectField
              label="Risk Appetite"
              value={String(vals.risk)}
              onChange={(v) => set("risk", v)}
              options={["Low", "Medium", "High"]}
              ocid="life.risk.select"
            />
            <SelectField
              label="Do you have existing debt?"
              value={String(vals.hasDebt)}
              onChange={(v) => set("hasDebt", v)}
              options={["yes", "no"]}
              ocid="life.has_debt.select"
            />
          </>
        )}
        {event === "Home Purchase" && (
          <>
            <Field
              label="Target Property Price (₹)"
              value={+vals.targetPrice}
              onChange={(v) => set("targetPrice", v)}
              ocid="life.target_price.input"
            />
            <Field
              label="Current Savings (₹)"
              value={+vals.savings}
              onChange={(v) => set("savings", v)}
              ocid="life.savings.input"
            />
            <Field
              label="Monthly Income (₹)"
              value={+vals.income}
              onChange={(v) => set("income", v)}
              ocid="life.income.input"
            />
            <Field
              label="Existing Monthly EMIs (₹)"
              value={+vals.existingEMI}
              onChange={(v) => set("existingEMI", v)}
              ocid="life.existing_emi.input"
            />
          </>
        )}
        <Button
          onClick={handleGenerate}
          className="w-full gold-gradient text-primary-foreground font-semibold"
          data-ocid="life.generate_plan.button"
        >
          <Sparkles className="mr-2 h-4 w-4" /> Generate Action Plan
        </Button>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  ocid,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  ocid: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-foreground/80 text-sm">{label}</Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number.parseFloat(e.target.value) || 0)}
        className="bg-input border-border text-foreground"
        data-ocid={ocid}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  ocid,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  ocid: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-foreground/80 text-sm">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className="bg-input border-border text-foreground"
          data-ocid={ocid}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function LifeEventAdvisor() {
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [steps, setSteps] = useState<ActionStep[] | null>(null);

  const handleReset = () => {
    setSelectedEvent(null);
    setSteps(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
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
            Life Event Advisor
          </h1>
          <p className="text-muted-foreground text-sm">
            Personalized advice for life's big money moments
          </p>
        </div>
      </div>

      {!selectedEvent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-foreground/80 mb-4">
            What life event are you planning for?
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {events.map((event, i) => (
              <button
                key={event}
                type="button"
                onClick={() => setSelectedEvent(event)}
                data-ocid={`life.event.${i + 1}`}
                className="navy-card rounded-xl p-4 text-left hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 group"
              >
                <div className="text-2xl mb-2">{eventIcons[event]}</div>
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {event}
                </p>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {selectedEvent && !steps && (
        <AnimatePresence mode="wait">
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <Badge className="bg-primary/15 text-primary border-primary/30">
                {eventIcons[selectedEvent]} {selectedEvent}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEvent(null)}
                className="text-muted-foreground"
                data-ocid="life.back.button"
              >
                <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Change Event
              </Button>
            </div>
            <EventForm event={selectedEvent} onSubmit={setSteps} />
          </motion.div>
        </AnimatePresence>
      )}

      {steps && (
        <AnimatePresence mode="wait">
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                Your Action Plan — {eventIcons[selectedEvent!]} {selectedEvent}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-muted-foreground"
                data-ocid="life.reset.button"
              >
                <RotateCcw className="mr-1 h-3.5 w-3.5" /> Start Over
              </Button>
            </div>
            <div className="space-y-3" data-ocid="life.action_plan.section">
              {steps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  data-ocid={`life.action_step.item.${i + 1}`}
                >
                  <Card className="bg-card border-border">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full gold-gradient text-primary-foreground text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <p className="font-semibold text-foreground text-sm">
                              {step.title}
                            </p>
                            <Badge
                              className={`text-xs border ${priorityStyles[step.priority]}`}
                            >
                              {step.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <Button
              className="w-full gold-gradient text-primary-foreground font-semibold"
              asChild
              data-ocid="life.fire_planner.button"
            >
              <Link to="/fire-planner">
                Now Plan Your FIRE <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
