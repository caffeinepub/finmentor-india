import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAddLoan } from "../hooks/useQueries";

interface AddLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddLoanDialog({
  open,
  onOpenChange,
}: AddLoanDialogProps) {
  const [borrower, setBorrower] = useState("");
  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const addLoan = useAddLoan();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountInCents = Math.round(Number.parseFloat(amount) * 100);
    const rate = BigInt(Math.round(Number.parseFloat(interestRate)));
    const dueDateTimestamp = BigInt(new Date(dueDate).getTime() * 1_000_000);

    await addLoan.mutateAsync({
      borrower: borrower.trim(),
      principal: { amount: BigInt(amountInCents) },
      interestRate: rate,
      dueDate: dueDateTimestamp,
    });

    setBorrower("");
    setAmount("");
    setInterestRate("");
    setDueDate("");
    onOpenChange(false);
  };

  const calculateTotal = () => {
    if (!amount || !interestRate) return "0.00";
    const principal = Number.parseFloat(amount);
    const rate = Number.parseFloat(interestRate);
    const total = principal + (principal * rate) / 100;
    return total.toFixed(2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Loan</DialogTitle>
            <DialogDescription>Enter the loan details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="borrower">Borrower Name</Label>
              <Input
                id="borrower"
                value={borrower}
                onChange={(e) => setBorrower(e.target.value)}
                placeholder="John Doe"
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="amount">Loan Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000.00"
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="5.00"
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-2"
                required
              />
            </div>

            {amount && interestRate && (
              <div className="rounded-lg bg-muted p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Principal:</span>
                  <span className="font-medium">
                    ${Number.parseFloat(amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">
                    Interest ({interestRate}%):
                  </span>
                  <span className="font-medium">
                    $
                    {(
                      (Number.parseFloat(amount) *
                        Number.parseFloat(interestRate)) /
                      100
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold mt-2 pt-2 border-t border-border">
                  <span>Total Repayment:</span>
                  <span className="text-primary">${calculateTotal()}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addLoan.isPending}>
              {addLoan.isPending ? "Adding..." : "Add Loan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
