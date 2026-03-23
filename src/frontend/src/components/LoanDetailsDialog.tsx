import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar, DollarSign, Edit, Percent, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  useGetLoan,
  useGetRepayments,
  useRecordRepayment,
  useUpdateTotalRepaid,
} from "../hooks/useQueries";

interface LoanDetailsDialogProps {
  loanId: bigint;
  onClose: () => void;
}

export default function LoanDetailsDialog({
  loanId,
  onClose,
}: LoanDetailsDialogProps) {
  const { data: loan, isLoading: loanLoading } = useGetLoan(loanId);
  const { data: repayments = [], isLoading: repaymentsLoading } =
    useGetRepayments(loanId);
  const recordRepayment = useRecordRepayment();
  const updateTotalRepaid = useUpdateTotalRepaid();
  const [repaymentAmount, setRepaymentAmount] = useState("");
  const [totalRepaidAmount, setTotalRepaidAmount] = useState("");
  const [showRepaymentForm, setShowRepaymentForm] = useState(false);
  const [showTotalRepaidForm, setShowTotalRepaidForm] = useState(false);

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
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRecordRepayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loan) return;

    const amountInCents = Math.round(Number.parseFloat(repaymentAmount) * 100);
    await recordRepayment.mutateAsync({
      loanId: loan.id,
      repaymentAmount: { amount: BigInt(amountInCents) },
    });

    setRepaymentAmount("");
    setShowRepaymentForm(false);
  };

  const handleUpdateTotalRepaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loan) return;

    const amountInCents = Math.round(
      Number.parseFloat(totalRepaidAmount) * 100,
    );
    await updateTotalRepaid.mutateAsync({
      loanId: loan.id,
      totalRepaidAmount: { amount: BigInt(amountInCents) },
    });

    setTotalRepaidAmount("");
    setShowTotalRepaidForm(false);
  };

  if (loanLoading || !loan) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <div className="py-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const progress =
    loan.totalRepaymentAmount.amount > 0
      ? ((Number(loan.totalRepaymentAmount.amount) -
          Number(loan.outstandingBalance.amount)) /
          Number(loan.totalRepaymentAmount.amount)) *
        100
      : 0;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Loan Details</DialogTitle>
              <DialogDescription>Borrower: {loan.borrower}</DialogDescription>
            </div>
            <Badge
              variant={loan.repaid ? "default" : "secondary"}
              className="text-sm"
            >
              {loan.repaid ? "Fully Paid" : "Active"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Principal Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(loan.principal.amount)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Interest Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loan.interestRate.toString()}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Total Repayment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(loan.totalRepaymentAmount.amount)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Outstanding Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(loan.outstandingBalance.amount)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Repayment Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{progress.toFixed(1)}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm pt-1">
                  <span className="text-muted-foreground">Total Repaid</span>
                  <span className="font-medium">
                    {formatCurrency(loan.totalRepaidAmount.amount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date Given</p>
                <p className="font-medium">{formatDate(loan.dateGiven)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-medium">{formatDate(loan.dueDate)}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Repayment Management</h3>
              <div className="flex gap-2">
                {!loan.repaid && (
                  <>
                    <Button
                      onClick={() => {
                        setShowTotalRepaidForm(!showTotalRepaidForm);
                        setShowRepaymentForm(false);
                      }}
                      size="sm"
                      variant="outline"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      {showTotalRepaidForm ? "Cancel" : "Set Total Repaid"}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowRepaymentForm(!showRepaymentForm);
                        setShowTotalRepaidForm(false);
                      }}
                      size="sm"
                    >
                      {showRepaymentForm ? "Cancel" : "Record Repayment"}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {showTotalRepaidForm && (
              <form
                onSubmit={handleUpdateTotalRepaid}
                className="mb-4 rounded-lg border p-4 bg-muted/50"
              >
                <Label htmlFor="totalRepaidAmount">
                  Total Repaid Amount ($)
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="totalRepaidAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={Number(loan.totalRepaymentAmount.amount) / 100}
                    value={totalRepaidAmount}
                    onChange={(e) => setTotalRepaidAmount(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                  <Button type="submit" disabled={updateTotalRepaid.isPending}>
                    {updateTotalRepaid.isPending ? "Updating..." : "Update"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Enter the total amount repaid so far. Maximum:{" "}
                  {formatCurrency(loan.totalRepaymentAmount.amount)}
                </p>
              </form>
            )}

            {showRepaymentForm && (
              <form
                onSubmit={handleRecordRepayment}
                className="mb-4 rounded-lg border p-4 bg-muted/50"
              >
                <Label htmlFor="repaymentAmount">Repayment Amount ($)</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="repaymentAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={Number(loan.outstandingBalance.amount) / 100}
                    value={repaymentAmount}
                    onChange={(e) => setRepaymentAmount(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                  <Button type="submit" disabled={recordRepayment.isPending}>
                    {recordRepayment.isPending ? "Recording..." : "Record"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Maximum: {formatCurrency(loan.outstandingBalance.amount)}
                </p>
              </form>
            )}

            <h4 className="text-md font-semibold mb-3 mt-6">
              Repayment History
            </h4>

            {repaymentsLoading ? (
              <div className="py-8 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : repayments.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>No repayments recorded yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {repayments.map((repayment, index) => (
                  <div
                    key={repayment.date.toString()}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">
                        {formatCurrency(repayment.amount.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(repayment.date)}
                      </p>
                    </div>
                    <Badge variant="outline">
                      Payment #{repayments.length - index}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
