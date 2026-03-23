import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Nat64 "mo:core/Nat64";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  module LoanAmount {
    public func compare(a : LoanAmount, b : LoanAmount) : Order.Order {
      Nat64.compare(a.amount, b.amount);
    };

    public func add(a : LoanAmount, b : LoanAmount) : LoanAmount {
      {
        amount = a.amount + b.amount;
      };
    };

    public func subtract(a : LoanAmount, b : LoanAmount) : ?LoanAmount {
      if (a.amount >= b.amount) {
        ?{ amount = a.amount - b.amount };
      } else {
        null;
      };
    };
  };

  public type LoanAmount = {
    amount : Nat64;
  };

  public type Loan = {
    id : Nat;
    owner : Principal;
    borrower : Text;
    principal : LoanAmount;
    interestRate : Nat64;
    dateGiven : Time.Time;
    dueDate : Time.Time;
    totalRepaymentAmount : LoanAmount;
    outstandingBalance : LoanAmount;
    repaid : Bool;
    totalRepaidAmount : LoanAmount;
  };

  public type Repayment = {
    loanId : Nat;
    amount : LoanAmount;
    date : Time.Time;
  };

  public type LoanSummary = {
    totalLent : LoanAmount;
    totalRepaid : LoanAmount;
    totalOutstanding : LoanAmount;
  };

  public type LoanUpdate = {
    loanId : Nat;
    repaid : Bool;
    outstandingBalance : LoanAmount;
  };

  public type UserProfile = {
    name : Text;
  };

  let loans = Map.empty<Nat, Loan>();
  let repayments = Map.empty<Nat, [Repayment]>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextLoanId = 1;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  private func isLoanOwner(caller : Principal, loan : Loan) : Bool {
    loan.owner == caller;
  };

  private func canAccessLoan(caller : Principal, loan : Loan) : Bool {
    isLoanOwner(caller, loan) or AccessControl.isAdmin(accessControlState, caller);
  };

  public shared ({ caller }) func addLoan(borrower : Text, principal : LoanAmount, interestRate : Nat64, dueDate : Time.Time) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add loans");
    };

    let loanId = nextLoanId;
    nextLoanId += 1;

    let totalRepaymentAmount = {
      amount = principal.amount + (principal.amount * interestRate / 100);
    };

    let loan = {
      id = loanId;
      owner = caller;
      borrower;
      principal;
      interestRate;
      dateGiven = Time.now();
      dueDate;
      totalRepaymentAmount;
      outstandingBalance = totalRepaymentAmount;
      repaid = false;
      totalRepaidAmount = { amount = 0 : Nat64 };
    };

    loans.add(loanId, loan);
    repayments.add(loanId, []);
    loanId;
  };

  public shared ({ caller }) func recordRepayment(loanId : Nat, repaymentAmount : LoanAmount) : async LoanUpdate {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record repayments");
    };

    switch (loans.get(loanId)) {
      case (null) { Runtime.trap("Loan not found") };
      case (?loan) {
        if (not canAccessLoan(caller, loan)) {
          Runtime.trap("Unauthorized: You can only record repayments for your own loans");
        };

        if (loan.repaid) { Runtime.trap("Loan has already been fully repaid") };

        let newOutstanding = LoanAmount.subtract(loan.outstandingBalance, repaymentAmount);

        switch (newOutstanding) {
          case (null) { Runtime.trap("Repayment amount exceeds outstanding balance") };
          case (?remaining) {
            let newRepayment = {
              loanId;
              amount = repaymentAmount;
              date = Time.now();
            };

            let existingRepayments = switch (repayments.get(loanId)) {
              case (?rep) { rep };
              case (null) { [] };
            };
            repayments.add(loanId, existingRepayments.concat([newRepayment]));

            let updatedLoan = {
              loan with
              outstandingBalance = remaining;
              repaid = remaining.amount == 0;
              totalRepaidAmount = LoanAmount.add(loan.totalRepaidAmount, repaymentAmount);
            };

            loans.add(loanId, updatedLoan);

            {
              loanId;
              repaid = updatedLoan.repaid;
              outstandingBalance = updatedLoan.outstandingBalance;
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func updateTotalRepaid(loanId : Nat, totalRepaidAmount : LoanAmount) : async LoanUpdate {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update total repaid amount");
    };

    switch (loans.get(loanId)) {
      case (null) { Runtime.trap("Loan not found") };
      case (?loan) {
        if (not canAccessLoan(caller, loan)) {
          Runtime.trap("Unauthorized: You can only update your own loans");
        };

        if (totalRepaidAmount.amount > loan.totalRepaymentAmount.amount) {
          Runtime.trap("Total repaid amount cannot exceed total repayment amount");
        };

        let newOutstanding = {
          amount = loan.totalRepaymentAmount.amount - totalRepaidAmount.amount;
        };

        let updatedLoan = {
          loan with
          outstandingBalance = newOutstanding;
          repaid = newOutstanding.amount == 0;
          totalRepaidAmount;
        };

        loans.add(loanId, updatedLoan);

        {
          loanId;
          repaid = updatedLoan.repaid;
          outstandingBalance = updatedLoan.outstandingBalance;
        };
      };
    };
  };

  public query ({ caller }) func getLoan(loanId : Nat) : async ?Loan {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view loans");
    };

    switch (loans.get(loanId)) {
      case (null) { null };
      case (?loan) {
        if (not canAccessLoan(caller, loan)) {
          Runtime.trap("Unauthorized: You can only view your own loans");
        };
        ?loan;
      };
    };
  };

  public query ({ caller }) func getAllLoans() : async [Loan] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view loans");
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    loans.values().toArray().filter(
      func(loan) {
        isAdmin or isLoanOwner(caller, loan);
      }
    );
  };

  public query ({ caller }) func getRepayments(loanId : Nat) : async [Repayment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view repayments");
    };

    switch (loans.get(loanId)) {
      case (null) { Runtime.trap("Loan not found") };
      case (?loan) {
        if (not canAccessLoan(caller, loan)) {
          Runtime.trap("Unauthorized: You can only view repayments for your own loans");
        };

        switch (repayments.get(loanId)) {
          case (null) { [] };
          case (?rep) { rep };
        };
      };
    };
  };

  public query ({ caller }) func getLoanSummary() : async LoanSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view loan summaries");
    };

    var totalLent : LoanAmount = { amount = 0 : Nat64 };
    var totalRepaid : LoanAmount = { amount = 0 : Nat64 };
    var totalOutstanding : LoanAmount = { amount = 0 : Nat64 };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    for (loan in loans.values()) {
      if (isAdmin or isLoanOwner(caller, loan)) {
        totalLent := LoanAmount.add(totalLent, loan.totalRepaymentAmount);
        totalOutstanding := LoanAmount.add(totalOutstanding, loan.outstandingBalance);
        totalRepaid := LoanAmount.add(totalRepaid, loan.totalRepaidAmount);
      };
    };

    {
      totalLent;
      totalRepaid;
      totalOutstanding;
    };
  };

  public query ({ caller }) func getLoansByBorrower(borrower : Text) : async [Loan] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view loans by borrower");
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    loans.values().toArray().filter(
      func(loan) {
        loan.borrower == borrower and (isAdmin or isLoanOwner(caller, loan));
      }
    );
  };
};
