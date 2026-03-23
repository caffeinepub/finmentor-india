import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import ScoreRing from "../components/ScoreRing";

const questions = [
  {
    dimension: "Emergency Fund",
    question: "How many months of expenses do you have saved?",
    options: ["0 months", "1–2 months", "3–5 months", "6+ months"],
  },
  {
    dimension: "Insurance",
    question: "Do you have term life & health insurance?",
    options: [
      "None",
      "Health only",
      "Term + Health",
      "Term + Health + Critical Illness",
    ],
  },
  {
    dimension: "Investments",
    question: "How diversified are your investments?",
    options: [
      "FD / Savings only",
      "Mutual Funds",
      "MF + Direct Stocks",
      "MF + Stocks + Real Estate",
    ],
  },
  {
    dimension: "Debt Health",
    question: "What % of your income goes to EMIs?",
    options: [">50%", "30–50%", "10–30%", "<10%"],
  },
  {
    dimension: "Tax Efficiency",
    question: "Do you use tax-saving instruments?",
    options: ["None", "Only 80C", "80C + 80D", "Full optimization"],
  },
  {
    dimension: "Retirement Readiness",
    question: "Do you have a retirement corpus goal?",
    options: [
      "No plan at all",
      "Vague idea",
      "PPF/NPS started",
      "Detailed plan + SIPs",
    ],
  },
];

const scoreMap = [20, 40, 70, 100];

const advice: Record<string, string[]> = {
  "Emergency Fund": [
    "Start by saving 1 month of expenses in a liquid fund immediately.",
    "Build towards 3 months — keep it in a high-interest savings account or liquid MF.",
    "You're close! Top up to 6 months for true financial security.",
    "Excellent! You're well-protected against emergencies.",
  ],
  Insurance: [
    "Get a term plan (1 crore+) and a basic health cover (₹5L+) today — this is urgent.",
    "Add a term life insurance plan. Health alone isn't enough.",
    "Good base. Consider adding critical illness cover for comprehensive protection.",
    "Outstanding! You have comprehensive insurance coverage.",
  ],
  Investments: [
    "Start a ₹500/month SIP in a diversified equity MF — even small steps compound.",
    "Great start. Add a direct equity component via index funds or blue-chip stocks.",
    "Strong portfolio. Explore real estate or REITs to add physical asset exposure.",
    "Excellent diversification across asset classes!",
  ],
  "Debt Health": [
    "Urgent: prioritize debt repayment. Cut discretionary spending and pay off high-interest debt first.",
    "Work towards reducing EMIs below 30%. Avoid new debt until this is achieved.",
    "Manageable. Try to push EMIs below 10% for maximum wealth-building capacity.",
    "Excellent debt health. Your EMIs leave plenty for investing.",
  ],
  "Tax Efficiency": [
    "You're leaving money on the table. Start with ELSS for 80C — save up to ₹46,800/year.",
    "Add 80D for health insurance premiums. Save an additional ₹7,800/year.",
    "Add NPS (80CCD) for extra ₹15,600 savings annually.",
    "You're maximizing your tax efficiency. Well done!",
  ],
  "Retirement Readiness": [
    "Start NOW. Open an NPS account today — even ₹2,000/month makes a difference.",
    "Convert your vague idea into a number. Use the FIRE Planner to set a target.",
    "Good foundation. Increase contributions by 10% every year.",
    "Exemplary retirement planning. Stay the course!",
  ],
};

export default function MoneyHealthScore() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    if (step < questions.length - 1) {
      setAnswers(newAnswers);
      setSelected(null);
      setStep(step + 1);
    } else {
      setAnswers(newAnswers);
      const dimensions = questions.map((q, i) => ({
        label: q.dimension,
        score: scoreMap[newAnswers[i]],
        answerIndex: newAnswers[i],
      }));
      const overall = Math.round(
        dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length,
      );
      localStorage.setItem(
        "money_health_score",
        JSON.stringify({ overall, dimensions }),
      );
      setShowResults(true);
    }
  };

  const handleReset = () => {
    setStep(0);
    setAnswers([]);
    setSelected(null);
    setShowResults(false);
  };

  if (showResults) {
    const savedScore = localStorage.getItem("money_health_score");
    const result = savedScore ? JSON.parse(savedScore) : null;
    if (!result) return null;
    return <Results result={result} onReset={handleReset} />;
  }

  const q = questions[step];
  const progress = (step / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
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
            Money Health Score
          </h1>
          <p className="text-muted-foreground text-sm">
            Question {step + 1} of {questions.length}
          </p>
        </div>
      </div>

      <div className="w-full bg-muted rounded-full h-2">
        <motion.div
          className="h-2 rounded-full gold-gradient"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-card border-border">
            <CardContent className="p-6 md:p-8">
              <Badge className="mb-4 bg-primary/15 text-primary border-primary/30">
                {q.dimension}
              </Badge>
              <h2 className="text-xl font-semibold text-foreground mb-6">
                {q.question}
              </h2>
              <div className="space-y-3">
                {q.options.map((option, i) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelected(i)}
                    data-ocid={`health_score.option.${i + 1}`}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 text-sm font-medium ${
                      selected === i
                        ? "bg-primary/15 border-primary text-primary"
                        : "bg-secondary/30 border-border text-foreground/80 hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    <span
                      className={`inline-flex w-6 h-6 rounded-full text-xs items-center justify-center mr-3 ${
                        selected === i
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={() => {
            setStep(Math.max(0, step - 1));
            setSelected(answers[step - 1] ?? null);
          }}
          disabled={step === 0}
          className="text-muted-foreground"
          data-ocid="health_score.prev.button"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={selected === null}
          className="gold-gradient text-primary-foreground font-semibold"
          data-ocid="health_score.next.button"
        >
          {step === questions.length - 1 ? "See Results" : "Next"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function Results({
  result,
  onReset,
}: {
  result: {
    overall: number;
    dimensions: { label: string; score: number; answerIndex: number }[];
  };
  onReset: () => void;
}) {
  const scoreColor =
    result.overall >= 70
      ? "text-emerald-400"
      : result.overall >= 40
        ? "text-yellow-400"
        : "text-red-400";
  const scoreLabel =
    result.overall >= 70
      ? "Financially Fit"
      : result.overall >= 40
        ? "Needs Attention"
        : "Financially Vulnerable";

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
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
            Your Money Health Score
          </h1>
          <p className="text-muted-foreground text-sm">Saved to your profile</p>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-8 text-center">
          <ScoreRing score={result.overall} size={120} strokeWidth={10} />
          <div className="mt-4">
            <p className={`text-2xl font-bold ${scoreColor}`}>{scoreLabel}</p>
            <p className="text-muted-foreground text-sm mt-1">
              Your overall financial wellness score
            </p>
          </div>
        </CardContent>
      </Card>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        data-ocid="health_score.results.section"
      >
        {result.dimensions.map((d, i) => (
          <motion.div
            key={d.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="bg-card border-border">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <ScoreRing score={d.score} size={56} strokeWidth={6} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">
                      {d.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {advice[d.label]?.[d.answerIndex]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onReset}
          variant="outline"
          className="flex-1 border-border/50"
          data-ocid="health_score.retake.button"
        >
          <RotateCcw className="mr-2 h-4 w-4" /> Retake Quiz
        </Button>
        <Button
          asChild
          className="flex-1 gold-gradient text-primary-foreground font-semibold"
          data-ocid="health_score.fire_planner.button"
        >
          <Link to="/fire-planner">
            Plan Your FIRE <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
