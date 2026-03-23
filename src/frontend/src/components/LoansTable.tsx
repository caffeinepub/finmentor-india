import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, Eye } from "lucide-react";
import { useState } from "react";
import type { Loan } from "../backend";
import LoanDetailsDialog from "./LoanDetailsDialog";

interface LoansTableProps {
  loans: Loan[];
  isLoading: boolean;
  showBorrower?: boolean;
  onSelectBorrower?: (borrower: string) => void;
}

export default function LoansTable({
  loans,
  isLoading,
  showBorrower = true,
  onSelectBorrower,
}: LoansTableProps) {
  const [selectedLoanId, setSelectedLoanId] = useState<bigint | null>(null);

  const formatCurrency = (amount: bigint) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(Number(amount) / 100);
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getProgressPercentage = (loan: Loan) => {
    const total = Number(loan.totalRepaymentAmount.amount);
    const outstanding = Number(loan.outstandingBalance.amount);
    const paid = total - outstanding;
    return total > 0 ? (paid / total) * 100 : 0;
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (loans.length === 0) {
    return (
      <div className="py-12 text-center">
        <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No loans found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Get started by adding your first loan.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {showBorrower && <TableHead>Borrower</TableHead>}
              <TableHead>Principal</TableHead>
              <TableHead>Interest</TableHead>
              <TableHead>Total Due</TableHead>
              <TableHead>Outstanding</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.map((loan) => {
              const progress = getProgressPercentage(loan);
              return (
                <TableRow key={loan.id.toString()}>
                  {showBorrower && (
                    <TableCell className="font-medium">
                      {onSelectBorrower ? (
                        <button
                          type="button"
                          onClick={() => onSelectBorrower(loan.borrower)}
                          className="hover:underline text-primary"
                        >
                          {loan.borrower}
                        </button>
                      ) : (
                        loan.borrower
                      )}
                    </TableCell>
                  )}
                  <TableCell>{formatCurrency(loan.principal.amount)}</TableCell>
                  <TableCell>{loan.interestRate.toString()}%</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(loan.totalRepaymentAmount.amount)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(loan.outstandingBalance.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(loan.dueDate)}</TableCell>
                  <TableCell>
                    <Badge variant={loan.repaid ? "default" : "secondary"}>
                      {loan.repaid ? "Paid" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLoanId(loan.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedLoanId && (
        <LoanDetailsDialog
          loanId={selectedLoanId}
          onClose={() => setSelectedLoanId(null)}
        />
      )}
    </>
  );
}
