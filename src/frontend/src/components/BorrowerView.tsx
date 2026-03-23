import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users } from "lucide-react";
import { useMemo } from "react";
import type { Loan } from "../backend";

interface BorrowerViewProps {
  loans: Loan[];
  onSelectBorrower: (borrower: string) => void;
}

interface BorrowerSummary {
  name: string;
  totalLoans: number;
  activeLoans: number;
  totalLent: bigint;
  totalOutstanding: bigint;
  totalRepaid: bigint;
}

export default function BorrowerView({
  loans,
  onSelectBorrower,
}: BorrowerViewProps) {
  const borrowerSummaries = useMemo(() => {
    const summaryMap = new Map<string, BorrowerSummary>();

    for (const loan of loans) {
      const existing = summaryMap.get(loan.borrower);
      if (existing) {
        existing.totalLoans += 1;
        existing.activeLoans += loan.repaid ? 0 : 1;
        existing.totalLent += loan.totalRepaymentAmount.amount;
        existing.totalOutstanding += loan.outstandingBalance.amount;
        existing.totalRepaid +=
          loan.totalRepaymentAmount.amount - loan.outstandingBalance.amount;
      } else {
        summaryMap.set(loan.borrower, {
          name: loan.borrower,
          totalLoans: 1,
          activeLoans: loan.repaid ? 0 : 1,
          totalLent: loan.totalRepaymentAmount.amount,
          totalOutstanding: loan.outstandingBalance.amount,
          totalRepaid:
            loan.totalRepaymentAmount.amount - loan.outstandingBalance.amount,
        });
      }
    }

    return Array.from(summaryMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [loans]);

  const formatCurrency = (amount: bigint) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(Number(amount) / 100);
  };

  if (borrowerSummaries.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No borrowers yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Add loans to see borrower summaries.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {borrowerSummaries.map((borrower) => (
        <Card
          key={borrower.name}
          className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
          onClick={() => onSelectBorrower(borrower.name)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{borrower.name}</CardTitle>
                <CardDescription>
                  {borrower.totalLoans} loan
                  {borrower.totalLoans !== 1 ? "s" : ""}
                </CardDescription>
              </div>
              {borrower.activeLoans > 0 && (
                <Badge variant="secondary">{borrower.activeLoans} active</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Lent:</span>
              <span className="font-semibold">
                {formatCurrency(borrower.totalLent)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Repaid:</span>
              <span className="font-semibold text-chart-2">
                {formatCurrency(borrower.totalRepaid)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Outstanding:</span>
              <span className="font-semibold text-chart-3">
                {formatCurrency(borrower.totalOutstanding)}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
