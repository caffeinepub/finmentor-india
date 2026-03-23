import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Calculator,
  Heart,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import ScoreRing from "../components/ScoreRing";

const tools = [
  {
    path: "/health-score",
    label: "Money Health Score",
    icon: Heart,
    description:
      "5-minute quiz to score your financial wellness across 6 dimensions",
    badge: "Most Popular",
    color: "text-rose-400",
    bg: "bg-rose-400/10 border-rose-400/20",
  },
  {
    path: "/fire-planner",
    label: "FIRE Path Planner",
    icon: TrendingUp,
    description:
      "Build a month-by-month roadmap to financial independence & early retirement",
    badge: "New",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/20",
  },
  {
    path: "/tax-wizard",
    label: "Tax Wizard",
    icon: Calculator,
    description:
      "Old vs new regime comparison — find every deduction you're missing",
    badge: "FY 2024-25",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
  },
  {
    path: "/life-event",
    label: "Life Event Advisor",
    icon: Sparkles,
    description:
      "AI-guided action plans for bonus, marriage, baby, inheritance & more",
    badge: "AI-Powered",
    color: "text-violet-400",
    bg: "bg-violet-400/10 border-violet-400/20",
  },
];

const stats = [
  { label: "Indians without a financial plan", value: "95%", icon: Target },
  {
    label: "Cost of a financial advisor/year",
    value: "₹25,000+",
    icon: Shield,
  },
  { label: "Our cost to you", value: "₹0", icon: Heart },
];

export default function Dashboard() {
  const savedScore = localStorage.getItem("money_health_score");
  const healthScore = savedScore ? JSON.parse(savedScore) : null;

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden p-8 md:p-12"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.07 243) 0%, oklch(0.18 0.05 243) 60%, oklch(0.22 0.07 260) 100%)",
          border: "1px solid oklch(0.32 0.06 243)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20"
            style={{ background: "oklch(0.78 0.17 75)" }}
          />
        </div>
        <div className="relative z-10 max-w-2xl">
          <Badge className="mb-4 bg-primary/15 text-primary border-primary/30 text-xs font-semibold px-3 py-1">
            🇮🇳 Made for India
          </Badge>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Your AI Finance <span className="text-primary">Mentor</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Financial planning used to cost ₹25,000+ a year and was only for the
            rich. Not anymore. Get a complete financial roadmap — for free, in
            minutes.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              className="gold-gradient text-primary-foreground font-semibold shadow-gold"
              data-ocid="dashboard.primary_button"
            >
              <Link to="/health-score">
                Get Your Money Score <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-border/50 text-foreground/80 hover:text-foreground"
              data-ocid="dashboard.secondary_button"
            >
              <Link to="/fire-planner">Plan Your FIRE</Link>
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.4 }}
          >
            <Card className="bg-card border-border text-center py-5">
              <CardContent className="p-4">
                <p className="text-3xl font-bold text-primary mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* Health Score if available */}
      {healthScore && (
        <motion.section
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="navy-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-foreground text-lg">
                Your Money Health Score
              </h2>
              <p className="text-muted-foreground text-sm">
                Last assessed result
              </p>
            </div>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10"
              data-ocid="dashboard.health_score.button"
            >
              <Link to="/health-score">Retake</Link>
            </Button>
          </div>
          <div className="flex items-center gap-6">
            <ScoreRing score={healthScore.overall} size={80} strokeWidth={8} />
            <div className="grid grid-cols-3 gap-3 flex-1">
              {healthScore.dimensions.map(
                (d: { label: string; score: number }) => (
                  <div key={d.label} className="text-center">
                    <ScoreRing score={d.score} size={44} strokeWidth={5} />
                    <p className="text-xs text-muted-foreground mt-1 leading-tight">
                      {d.label}
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>
        </motion.section>
      )}

      {/* Tools */}
      <section>
        <h2 className="text-xl font-bold text-foreground mb-5">
          Financial Planning Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.4 }}
              >
                <Link to={tool.path} data-ocid={`dashboard.tool.${i + 1}`}>
                  <Card className="bg-card border-border hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-gold group cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`w-11 h-11 rounded-xl border flex items-center justify-center ${tool.bg}`}
                        >
                          <Icon className={`h-5 w-5 ${tool.color}`} />
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-secondary/50"
                        >
                          {tool.badge}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {tool.label}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tool.description}
                      </p>
                      <div className="mt-4 flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Get started <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
