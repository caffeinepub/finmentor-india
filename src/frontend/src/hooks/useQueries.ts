import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  Loan,
  LoanAmount,
  LoanSummary,
  Repayment,
  Time,
  UserProfile,
} from "../backend";
import { useActor } from "./useActor";

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      toast.success("Profile saved successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

export function useGetAllLoans() {
  const { actor, isFetching } = useActor();

  return useQuery<Loan[]>({
    queryKey: ["loans"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLoans();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLoan(loanId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Loan | null>({
    queryKey: ["loan", loanId?.toString()],
    queryFn: async () => {
      if (!actor || !loanId) return null;
      return actor.getLoan(loanId);
    },
    enabled: !!actor && !isFetching && loanId !== null,
  });
}

export function useGetLoanSummary() {
  const { actor, isFetching } = useActor();

  return useQuery<LoanSummary>({
    queryKey: ["loanSummary"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getLoanSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRepayments(loanId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Repayment[]>({
    queryKey: ["repayments", loanId?.toString()],
    queryFn: async () => {
      if (!actor || !loanId) return [];
      return actor.getRepayments(loanId);
    },
    enabled: !!actor && !isFetching && loanId !== null,
  });
}

export function useGetLoansByBorrower(borrower: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Loan[]>({
    queryKey: ["loansByBorrower", borrower],
    queryFn: async () => {
      if (!actor || !borrower) return [];
      return actor.getLoansByBorrower(borrower);
    },
    enabled: !!actor && !isFetching && !!borrower,
  });
}

export function useAddLoan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      borrower: string;
      principal: LoanAmount;
      interestRate: bigint;
      dueDate: Time;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addLoan(
        params.borrower,
        params.principal,
        params.interestRate,
        params.dueDate,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["loanSummary"] });
      toast.success("Loan added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add loan: ${error.message}`);
    },
  });
}

export function useRecordRepayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      loanId: bigint;
      repaymentAmount: LoanAmount;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.recordRepayment(params.loanId, params.repaymentAmount);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({
        queryKey: ["loan", variables.loanId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["repayments", variables.loanId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["loanSummary"] });
      toast.success("Repayment recorded successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to record repayment: ${error.message}`);
    },
  });
}

export function useUpdateTotalRepaid() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      loanId: bigint;
      totalRepaidAmount: LoanAmount;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateTotalRepaid(params.loanId, params.totalRepaidAmount);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({
        queryKey: ["loan", variables.loanId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["repayments", variables.loanId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["loanSummary"] });
      toast.success("Total repaid amount updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update total repaid: ${error.message}`);
    },
  });
}
