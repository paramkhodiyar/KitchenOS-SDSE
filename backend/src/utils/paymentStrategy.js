/**
 * PaymentStrategy Base Class representing the interface
 * Uses OOP principles (Abstraction, Polymorphism)
 */
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

/**
 * Concrete Strategy: Cash Payment
 */
export class CashPaymentStrategy extends PaymentStrategy {
    processPayment(amount) {
        // In a real scenario, this might trigger a cash drawer command
        return {
            status: "SUCCESS",
            method: "CASH",
            message: `Processed cash payment of ${amount}`,
            timestamp: new Date()
        };
    }
}

/**
 * Concrete Strategy: UPI Payment
 */
export class UPIPaymentStrategy extends PaymentStrategy {
    processPayment(amount) {
        // In a real scenario, this would integrate with Razorpay/PhonePe API to generate a QR
        return {
            status: "SUCCESS",
            method: "UPI",
            message: `Verified external UPI payment of ${amount}`,
            timestamp: new Date()
        };
    }
}

/**
 * Concrete Strategy: Bank/Card Payment 
 */
export class BankPaymentStrategy extends PaymentStrategy {
    processPayment(amount) {
        // Integration with external card terminals or Stripe
        return {
            status: "SUCCESS",
            method: "BANK",
            message: `Authorized bank transaction of ${amount}`,
            timestamp: new Date()
        };
    }
}

/**
 * Strategy Context / Factory pattern to resolve strategy based on account type
 */
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
            return new CashPaymentStrategy(); // Fallback
    }
};
