import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LoanUpdate {
    repaid: boolean;
    loanId: bigint;
    outstandingBalance: LoanAmount;
}
export type Time = bigint;
export interface LoanAmount {
    amount: bigint;
}
export interface LoanSummary {
    totalOutstanding: LoanAmount;
    totalLent: LoanAmount;
    totalRepaid: LoanAmount;
}
export interface Loan {
    id: bigint;
    repaid: boolean;
    principal: LoanAmount;
    totalRepaidAmount: LoanAmount;
    owner: Principal;
    dueDate: Time;
    borrower: string;
    dateGiven: Time;
    interestRate: bigint;
    outstandingBalance: LoanAmount;
    totalRepaymentAmount: LoanAmount;
}
export interface Repayment {
    date: Time;
    loanId: bigint;
    amount: LoanAmount;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addLoan(borrower: string, principal: LoanAmount, interestRate: bigint, dueDate: Time): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllLoans(): Promise<Array<Loan>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLoan(loanId: bigint): Promise<Loan | null>;
    getLoanSummary(): Promise<LoanSummary>;
    getLoansByBorrower(borrower: string): Promise<Array<Loan>>;
    getRepayments(loanId: bigint): Promise<Array<Repayment>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    recordRepayment(loanId: bigint, repaymentAmount: LoanAmount): Promise<LoanUpdate>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateTotalRepaid(loanId: bigint, totalRepaidAmount: LoanAmount): Promise<LoanUpdate>;
}
