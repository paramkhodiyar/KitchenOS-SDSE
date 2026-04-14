// The Strategy Pattern is used for handling interchangeable payment workflows (CASH, UPI, BANK).
// This approach allows the system to switch between different algorithms easily without complicating the main workflow with large and messy `if-else` or `switch` statements. It keeps the core logic clean and organized, and also makes it easier to add new behaviors in the future without modifying existing code, which follows the Open/Closed Principle.

export class PaymentStrategy {
    constructor() {
        if (this.constructor === PaymentStrategy) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    processPayment(amount) {
        throw new Error("Method 'processPayment()' must be implemented.");
    }
}


export class CashPaymentStrategy extends PaymentStrategy {
    processPayment(amount) {
        return {
            status: "SUCCESS",
            method: "CASH",
            message: `Processed cash payment of ${amount}`,
            timestamp: new Date()
        };
    }
}


export class UPIPaymentStrategy extends PaymentStrategy {
    processPayment(amount) {
        return {
            status: "SUCCESS",
            method: "UPI",
            message: `Verified external UPI payment of ${amount}`,
            timestamp: new Date()
        };
    }
}


export class BankPaymentStrategy extends PaymentStrategy {
    processPayment(amount) {
        return {
            status: "SUCCESS",
            method: "BANK",
            message: `Authorized bank transaction of ${amount}`,
            timestamp: new Date()
        };
    }
}


export const getPaymentStrategy = (accountType) => {
    switch (accountType) {
        case "CASH":
            return new CashPaymentStrategy();
        case "UPI":
            return new UPIPaymentStrategy();
        case "BANK":
        case "WALLET":
            return new BankPaymentStrategy();
        default:
            return new CashPaymentStrategy(); 
    }
};
