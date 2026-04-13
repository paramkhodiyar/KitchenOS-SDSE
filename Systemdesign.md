# KitchenOS-SDSE System Design Plan

## 1. SDLC Concepts Used
The development of KitchenOS-SDSE follows an Agile/Iterative Software Development Life Cycle (SDLC). Key phases include:
- **Requirement Analysis**: Identifying core roles (Owner, Cashier, Kitchen) and features (POS, Inventory alerts).
- **Design**: Creating ER, Class, and Sequence diagrams to model database and object relationships before implementation.
- **Implementation**: API-first development in Express.js paired with a responsive Next.js frontend ecosystem.
- **Testing & Deployment**: Verifying component behavior, and iterative delivery via standard deployment platforms.

## 2. Object-Oriented Programming (OOP) Concepts
We incorporate vital OOP paradigms to enforce clean code and modular architecture:
- **Classes and Objects**: Representing distinct business logic structures (e.g., `PaymentStrategy` acts as a class outlining behavior).
- **Encapsulation**: State manipulation is hidden behind precise functions (like `recordOrderIncome`), protecting database integrity.
- **Polymorphism**: The `processPayment` method behaves differently depending on whether it's executing inside a `CashPaymentStrategy` or a `UPIPaymentStrategy`.
- **Abstraction**: Base classes hide complex implementations of external APIs. 

## 3. Design Principles (SOLID)
We strive to follow SOLID principles:
- **Single Responsibility Principle (SRP)**: Services are strictly separated (e.g. `orders.service.js` strictly manages order flow, while `paymentStrategy.js` strictly handles payment processing logic).
- **Open/Closed Principle**: The system is open for extension but closed for modification. If we need to add a new payment method (like "Crypto"), we simply add a new `CryptoPaymentStrategy` class extending `PaymentStrategy`, without touching the core `recordOrderIncome` logic.

## 4. Design Patterns Used

### 4.1. Singleton Pattern
**Where:** Database Connection (`backend/src/config/prisma.js`)
**Why:** Prisma DB client serves as the central artery of our data access. The Singleton Pattern ensures only one shared instance of the database connection exists throughout the application lifecycle.
**Reasoning:** Re-creating database connections constantly within separate requests causes memory leaks and max-connection pool errors. Restricting instantiation to a single object protects application stability. 

### 4.2. Strategy Pattern
**Where:** Payment Processing (`backend/src/utils/paymentStrategy.js`)
**Why:** The Strategy Pattern is used for handling interchangeable payment workflows (CASH, UPI, BANK). 
**Reasoning:** Dynamic switching between distinct algorithmic logic without cluttering the primary transaction flow with massive `if-else` or `switch` statements. This adheres directly to the Open/Closed Principle.
