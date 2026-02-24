
import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import { generateStoreCode } from "../utils/storeCode.js";

const seedDemo = async () => {
    console.log("Seeding Demo Store...");

    // Create New Store
    const storeName = "Cafe Demo";
    const storeCode = generateStoreCode(); // You can check generateStoreCode if needed, assuming it's imported correctly
    const ownerPin = "1111"; // Easy PINs for demo
    const cashierPin = "2222";
    const kitchenPin = "3333";

    const store = await prisma.store.create({
        data: {
            name: storeName,
            storeCode: storeCode,
            ownerPinHash: await bcrypt.hash(ownerPin, 10),
            cashierPinHash: await bcrypt.hash(cashierPin, 10),
            kitchenPinHash: await bcrypt.hash(kitchenPin, 10),
            isInitialized: true,
        },
    });

    console.log(`Created Store: ${store.name} (${store.storeCode})`);

    // Create Products (Menu)
    const productsData = [
        { name: "Espresso", price: 150, stock: 100, minStock: 20 },
        { name: "Cappuccino", price: 200, stock: 80, minStock: 15 },
        { name: "Latte", price: 220, stock: 90, minStock: 15 },
        { name: "Americano", price: 180, stock: 100, minStock: 20 },
        { name: "Mocha", price: 240, stock: 60, minStock: 10 },
        { name: "Cold Coffee", price: 250, stock: 120, minStock: 30 },
        { name: "Iced Tea", price: 150, stock: 150, minStock: 40 },
        { name: "Hot Chocolate", price: 200, stock: 50, minStock: 10 },
        { name: "Croissant", price: 120, stock: 30, minStock: 5 },
        { name: "Bagel", price: 100, stock: 40, minStock: 5 },
        { name: "Cheese Sandwich", price: 180, stock: 25, minStock: 5 },
        { name: "Chicken Sandwich", price: 220, stock: 20, minStock: 5 },
        { name: "Veg Burger", price: 150, stock: 30, minStock: 5 },
        { name: "Fries", price: 100, stock: 200, minStock: 50 },
        { name: "Cheesecake", price: 250, stock: 15, minStock: 3 },
        { name: "Brownie", price: 120, stock: 40, minStock: 10 },
        { name: "Muffin", price: 100, stock: 35, minStock: 8 },
        { name: "Water Bottle", price: 40, stock: 500, minStock: 100 },
        { name: "Cola", price: 60, stock: 200, minStock: 50 },
        { name: "Cookie", price: 50, stock: 100, minStock: 20 },
    ];

    const products = [];
    for (const p of productsData) {
        const product = await prisma.product.create({
            data: { ...p, storeId: store.id },
        });
        products.push(product);
    }
    console.log(`Created ${products.length} products`);

    // Create Raw Materials (Inventory)
    const rawMaterialsData = [
        { name: "Coffee Beans", status: "AVAILABLE" },
        { name: "Milk", status: "AVAILABLE" },
        { name: "Sugar", status: "AVAILABLE" },
        { name: "Flour", status: "AVAILABLE" },
        { name: "Eggs", status: "AVAILABLE" },
        { name: "Butter", status: "AVAILABLE" },
        { name: "Chicken", status: "AVAILABLE" },
        { name: "Cheese", status: "AVAILABLE" },
        { name: "Vegetables", status: "AVAILABLE" },
        { name: "Tea Leaves", status: "AVAILABLE" },
        { name: "Cocoa Powder", status: "AVAILABLE" },
        { name: "Almond Milk", status: "OUT" }, // This one is OUT
        { name: "Paper Cups", status: "LOW" },
    ];

    for (const r of rawMaterialsData) {
        await prisma.rawMaterial.create({
            data: { ...r, storeId: store.id },
        });
    }
    console.log(`Created ${rawMaterialsData.length} raw materials`);

    // Create Accounts
    const cashAccount = await prisma.account.create({
        data: {
            storeId: store.id,
            name: "Cash Register",
            type: "CASH",
            balance: 0,
        }
    });

    const upiAccount = await prisma.account.create({
        data: {
            storeId: store.id,
            name: "Main UPI",
            type: "UPI",
            balance: 0,
        }
    });

    // Generate Sales History (Transactions & Orders) for past 7 days
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Random number of orders per day (10 to 30)
        const orderCount = Math.floor(Math.random() * 21) + 10;

        for (let j = 0; j < orderCount; j++) {
            // Random items in order
            const itemSize = Math.floor(Math.random() * 4) + 1; // 1-4 items
            const orderItems = [];
            let totalAmount = 0;

            for (let k = 0; k < itemSize; k++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const qty = Math.floor(Math.random() * 2) + 1;
                totalAmount += product.price * qty;
                orderItems.push({
                    productId: product.id,
                    quantity: qty,
                    price: product.price,
                });
            }

            // Create Order
            // Randomize time within the day
            const orderTime = new Date(date);
            orderTime.setHours(9 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60)); // 9 AM - 9 PM

            const isCash = Math.random() > 0.5;

            const order = await prisma.order.create({
                data: {
                    storeId: store.id,
                    total: totalAmount,
                    status: "COMPLETED", // Assuming past orders are completed
                    createdAt: orderTime,
                    items: {
                        create: orderItems,
                    },
                },
            });

            // Create Transaction (Income)
            await prisma.transaction.create({
                data: {
                    storeId: store.id,
                    accountId: isCash ? cashAccount.id : upiAccount.id,
                    amount: totalAmount,
                    type: "INCOME",
                    note: `Order #${order.orderNumber || order.id}`,
                    createdAt: orderTime,
                    orderId: order.id,
                },
            });
        }
        console.log(`Simulated day ${i} days ago: ${orderCount} orders`);
    }

    console.log("\n=== SEED COMPLETE ===");
    console.log("Store Code: " + storeCode);
    console.log("Owner PIN: " + ownerPin);
    console.log("Cashier PIN: " + cashierPin);
    console.log("Kitchen PIN: " + kitchenPin);
};

seedDemo()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
