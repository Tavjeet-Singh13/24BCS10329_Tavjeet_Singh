// Student Java Task: ATM Withdrawal System

// Objective
// Create a console-based ATM withdrawal program that validates account balances, handles invalid user input, and ensures resources (like database or console connections) are always safely closed.
// Task Specifications

// 1. Custom Exception: InsufficientFundsException
// Create a custom checked exception class named InsufficientFundsException.
// It should extend java.lang.Exception.
// It should accept and store the missing amount or a custom error message.
// Add a method getMissingAmount() (or pass a detailed message to super()) so the caller knows how much more money was needed.

// 2. Class: BankAccount
// Create a BankAccount class with:
// Private field double balance (initialize with a starting balance, e.g., $500.00).
// Method void withdraw(double amount) throws InsufficientFundsException:
// If amount <= 0, throw an IllegalArgumentException with the message "Withdrawal amount must be greater than zero."
// If amount > balance, throw your custom InsufficientFundsException.
// Otherwise, deduct amount from balance and print the new balance.

// 3. Class: ATMMain (try-catch-finally implementation)
// In the main method:
// Create a Scanner for user input.
// Wrap the user prompt and withdraw() call in a try block.
// Implement multiple catch blocks:
// Catch InsufficientFundsException and display the specific error.
// Catch IllegalArgumentException (for negative/zero amounts).
// Catch InputMismatchException (if the user types text instead of a number).
// Implement a finally block that prints a session termination message and safely closes the Scanner.

import java.util.*;
import java.io.*;

class InsufficientFundsException extends Exception {
    private double missingAmount;
    public InsufficientFundsException(double missingAmount) {
        super("Insufficient funds. Required: " + missingAmount);
        this.missingAmount = missingAmount;
    }
    public double getMissingAmount() {
        return missingAmount;
    }
}

class BankAccount {
    private double balance;
    public BankAccount(double startingBalance) {
        this.balance = startingBalance;
    }
    public void withdraw(double amount) throws InsufficientFundsException {
        if (amount <= 0) {
            throw new IllegalArgumentException("Withdrawal amount must be greater than zero.");
        }
        if (amount > balance) {
            throw new InsufficientFundsException(amount - balance);
        }
        balance = balance - amount;
        System.out.println("Withdrawal processed. Remaining balance: " + balance);
    }
}

class ATMMain {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        BankAccount account = new BankAccount(500.00);

        try {
            System.out.print("Enter amount to withdraw: ");
            double amount = scanner.nextDouble();
            account.withdraw(amount);

        } catch (InsufficientFundsException e) {
            System.out.println(e.getMessage());

        } catch (IllegalArgumentException e) {
            System.out.println(e.getMessage());

        } catch (InputMismatchException e) {
            System.out.println("Invalid input.");

        } finally {
            System.out.println("Thank you for using the ATM.");
            scanner.close();
        }
    }
}
