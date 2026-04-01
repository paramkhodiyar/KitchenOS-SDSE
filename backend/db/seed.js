import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting seed for Chai Adda...");
    console.log("Cleaning up invalid data...");

    // Child tables must be deleted before Parent tables
    await prisma.transaction.deleteMany({});
    await prisma.orderItem.deleteMany({}); // Delete OrderItems BEFORE Orders
    await prisma.order.deleteMany({});     // Now safe to delete Orders

    await prisma.overrideLog.deleteMany({});
    await prisma.stockLog.deleteMany({});

    // Now delete products and raw materials
    await prisma.product.deleteMany({});
    await prisma.rawMaterial.deleteMany({});

    // Accounts and Users
    await prisma.account.deleteMany({});
    await prisma.user.deleteMany({});

    // Finally Store
    await prisma.store.deleteMany({});

    console.log("Database cleared.");

    // 2. Create the specific store 'Chai Adda'
    const storeCode = "KOS-5096";
    const storeName = "Chai Adda";

    // Default PINs
    const ownerPin = "1111";
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

    // 3. Create Accounts
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

    // 4. Products (Menu) - Updated as per user request
    const productsData = [
        // Beverages
        { name: "Masala Tea (150 ml)", price: 20, category: "Beverages", stock: 200, minStock: 20 },
        { name: "Ginger Tea (150 ml)", price: 20, category: "Beverages", stock: 200, minStock: 20 },
        { name: "Kulhad Tea (150 ml)", price: 30, category: "Beverages", stock: 150, minStock: 20 },
        { name: "Hot Coffee (150 ml)", price: 30, category: "Beverages", stock: 100, minStock: 20 },
        { name: "Black Hot Coffee (300 ml)", price: 50, category: "Beverages", stock: 50, minStock: 10 },
        { name: "Cold Coffee (300 ml)", price: 60, category: "Beverages", stock: 80, minStock: 15 },
        { name: "Cold Coffee with Ice Cream (300 ml)", price: 80, category: "Beverages", stock: 40, minStock: 10 },
        { name: "Hot Chocolate (300 ml)", price: 70, category: "Beverages", stock: 50, minStock: 10 },
        { name: "Cold Chocolate (300 ml)", price: 60, category: "Beverages", stock: 50, minStock: 10 },
        { name: "Hot Bournvita (300 ml)", price: 70, category: "Beverages", stock: 40, minStock: 10 },
        { name: "Cold Bournvita (300 ml)", price: 60, category: "Beverages", stock: 40, minStock: 10 },
        { name: "Plain Milk (300 ml)", price: 30, category: "Beverages", stock: 50, minStock: 10 },
        { name: "Banana Shake (300 ml)", price: 50, category: "Beverages", stock: 40, minStock: 10 },
        { name: "Oreo Shake (300 ml)", price: 70, category: "Beverages", stock: 40, minStock: 10 },
        { name: "Mosambi Juice (300 ml)", price: 60, category: "Beverages", stock: 60, minStock: 10 },
        { name: "Mosambi + Pineapple (300 ml)", price: 70, category: "Beverages", stock: 50, minStock: 10 },
        { name: "Kit-Kat Shake (300 ml)", price: 70, category: "Beverages", stock: 30, minStock: 5 },
        { name: "Peanut Butter Shake (300 ml)", price: 99, category: "Beverages", stock: 20, minStock: 5 },
        { name: "Mango Shake (300 ml) (Seasonal)", price: 70, category: "Beverages", stock: 0, minStock: 0 },
        { name: "Brownie Shake (300 ml)", price: 80, category: "Beverages", stock: 30, minStock: 5 },

        // Burgers & Sandwiches
        { name: "Aloo Tikki Burger", price: 60, category: "Burgers & Sandwiches", stock: 50, minStock: 10 },
        { name: "Paneer Burger", price: 70, category: "Burgers & Sandwiches", stock: 40, minStock: 10 },
        { name: "Veg Burger", price: 65, category: "Burgers & Sandwiches", stock: 45, minStock: 10 },
        { name: "Aloo Tikki Schezwan Burger", price: 70, category: "Burgers & Sandwiches", stock: 40, minStock: 10 },
        { name: "Crispy Paneer Burger", price: 99, category: "Burgers & Sandwiches", stock: 30, minStock: 5 },
        { name: "Aloo Tikki Sandwich", price: 65, category: "Burgers & Sandwiches", stock: 50, minStock: 10 },
        { name: "Paneer Sandwich", price: 70, category: "Burgers & Sandwiches", stock: 40, minStock: 10 },
        { name: "Veg Sandwich", price: 60, category: "Burgers & Sandwiches", stock: 50, minStock: 10 },
        { name: "Aloo Tikki Paneer Sandwich", price: 90, category: "Burgers & Sandwiches", stock: 30, minStock: 5 },

        // Maggi
        { name: "Plain Maggi", price: 40, category: "Maggi", stock: 100, minStock: 20 },
        { name: "Masala Maggi", price: 40, category: "Maggi", stock: 100, minStock: 20 },
        { name: "Veg Maggi", price: 50, category: "Maggi", stock: 80, minStock: 15 },
        { name: "Cheese Maggi", price: 50, category: "Maggi", stock: 80, minStock: 15 },
        { name: "Makhni Masala Maggi", price: 60, category: "Maggi", stock: 60, minStock: 10 },
        { name: "Chatpati Achari Maggi", price: 60, category: "Maggi", stock: 60, minStock: 10 },
        { name: "Cheese Butter Maggi", price: 70, category: "Maggi", stock: 50, minStock: 10 },

        // Wraps
        { name: "Chilli Garlic Wrap", price: 80, category: "Wraps", stock: 40, minStock: 10 },
        { name: "Veg Cheese Wrap", price: 90, category: "Wraps", stock: 40, minStock: 10 },
        { name: "Crispy Paneer Wrap", price: 99, category: "Wraps", stock: 35, minStock: 10 },

        // Fries & Snacks
        { name: "Crinkle Fries", price: 90, category: "Fries & Snacks", stock: 50, minStock: 10 },
        { name: "French Fries", price: 80, category: "Fries & Snacks", stock: 60, minStock: 10 },
        { name: "Peri Peri Fries", price: 90, category: "Fries & Snacks", stock: 50, minStock: 10 },
        { name: "Cheese Fries", price: 99, category: "Fries & Snacks", stock: 40, minStock: 10 },
        { name: "Spring Roll (6 pcs)", price: 80, category: "Fries & Snacks", stock: 40, minStock: 10 },
        { name: "Veggie Fingers (6 pcs)", price: 80, category: "Fries & Snacks", stock: 40, minStock: 10 },
        { name: "Smiley Fries (6 pcs)", price: 80, category: "Fries & Snacks", stock: 40, minStock: 10 },
        { name: "Chilli Garlic Potatoes (15 pcs)", price: 80, category: "Fries & Snacks", stock: 30, minStock: 5 },
        { name: "Pizza Pockets (5 pcs)", price: 90, category: "Fries & Snacks", stock: 30, minStock: 5 },
        { name: "Cheese Nuggets (8 pcs)", price: 90, category: "Fries & Snacks", stock: 30, minStock: 5 },
        { name: "Veg Fried Momo (8 pcs)", price: 80, category: "Fries & Snacks", stock: 50, minStock: 10 },
        { name: "Cheese Corn Momo (8 pcs)", price: 90, category: "Fries & Snacks", stock: 40, minStock: 10 },
        { name: "Veg Kurkure Momo", price: 99, category: "Fries & Snacks", stock: 40, minStock: 10 },
        { name: "Paneer Momo (8 pcs)", price: 99, category: "Fries & Snacks", stock: 40, minStock: 10 },
        { name: "Onion Rings (8 pcs)", price: 99, category: "Fries & Snacks", stock: 30, minStock: 5 },
        { name: "Extra Dip", price: 10, category: "Fries & Snacks", stock: 100, minStock: 20 },

        // Packaged Food & Drink (10 items)
        { name: "Lays Classic Salted", price: 20, category: "Packaged", stock: 50, minStock: 10 },
        { name: "Lays Magic Masala", price: 20, category: "Packaged", stock: 50, minStock: 10 },
        { name: "Kurkure Masala Munch", price: 20, category: "Packaged", stock: 50, minStock: 10 },
        { name: "Doritos Nacho Cheese", price: 30, category: "Packaged", stock: 30, minStock: 5 },
        { name: "Good Day Butter Cookies", price: 20, category: "Packaged", stock: 40, minStock: 10 },
        { name: "Oreo Biscuit Pack", price: 30, category: "Packaged", stock: 40, minStock: 10 },
        { name: "Dark Fantasy Choco Fills", price: 30, category: "Packaged", stock: 40, minStock: 10 },
        { name: "Coca Cola (500ml)", price: 40, category: "Packaged", stock: 40, minStock: 10 },
        { name: "Thums Up (500ml)", price: 40, category: "Packaged", stock: 40, minStock: 10 },
        { name: "Sting Energy Drink", price: 20, category: "Packaged", stock: 60, minStock: 10 },
    ];

    const products = [];
    for (const p of productsData) {
        const product = await prisma.product.create({
            data: { ...p, storeId: store.id },
        });
        products.push(product);
    }
    console.log(`Created ${products.length} products`);

    // 5. Raw Materials - Updated for new menu
    const rawMaterialsData = [
        { name: "Masala Tea Powder", status: "AVAILABLE" },
        { name: "Sugar", status: "AVAILABLE" },
        { name: "Milk", status: "AVAILABLE" },
        { name: "Ginger", status: "LOW" },
        { name: "Coffee Powder", status: "AVAILABLE" },
        { name: "Chocolate Syrup", status: "AVAILABLE" },
        { name: "Ice Cream Brick", status: "AVAILABLE" },
        { name: "Bournvita Powder", status: "AVAILABLE" },
        { name: "Bananas", status: "AVAILABLE" },
        { name: "Oreo Packets (Large)", status: "AVAILABLE" },
        { name: "Mosambi", status: "AVAILABLE" },
        { name: "Pineapple", status: "AVAILABLE" },
        { name: "KitKat Bars", status: "AVAILABLE" },
        { name: "Peanut Butter", status: "AVAILABLE" },
        { name: "Mango Pulp (Frozen)", status: "OUT" },
        { name: "Brownies", status: "AVAILABLE" },
        { name: "Burger Buns", status: "AVAILABLE" },
        { name: "Aloo Tikki (Frozen)", status: "AVAILABLE" },
        { name: "Paneer Block", status: "LOW" },
        { name: "Veg Burger Patty", status: "AVAILABLE" },
        { name: "Schezwan Sauce", status: "AVAILABLE" },
        { name: "Sandwich Bread (Large)", status: "AVAILABLE" },
        { name: "Maggi Noodles Block", status: "AVAILABLE" },
        { name: "Cheese Cubes/Slices", status: "LOW" },
        { name: "Makhni Gravy Base", status: "AVAILABLE" },
        { name: "Achari Paste", status: "AVAILABLE" },
        { name: "Butter", status: "AVAILABLE" },
        { name: "Tortilla Wraps", status: "AVAILABLE" },
        { name: "Garlic Sauce", status: "AVAILABLE" },
        { name: "Frozen French Fries", status: "AVAILABLE" },
        { name: "Crinkle Cut Fries", status: "AVAILABLE" },
        { name: "Peri Peri Masala", status: "AVAILABLE" },
        { name: "Frozen Spring Rolls", status: "AVAILABLE" },
        { name: "Veggie Fingers", status: "AVAILABLE" },
        { name: "Smiley Fries", status: "AVAILABLE" },
        { name: "Potato Shots/Chilli Garlic", status: "AVAILABLE" },
        { name: "Pizza Pockets", status: "AVAILABLE" },
        { name: "Frozen Nuggets", status: "AVAILABLE" },
        { name: "Frozen Momos (Veg)", status: "AVAILABLE" },
        { name: "Frozen Momos (Paneer)", status: "AVAILABLE" },
        { name: "Corn", status: "AVAILABLE" },
        { name: "Onion Rings", status: "AVAILABLE" },
        { name: "Oil (Liters)", status: "AVAILABLE" },
        { name: "Disposable Cups", status: "LOW" },
        { name: "Packaging Boxes", status: "AVAILABLE" },
        { name: "Tissues", status: "AVAILABLE" },
    ];

    for (const r of rawMaterialsData) {
        await prisma.rawMaterial.create({
            data: { ...r, storeId: store.id },
        });
    }
    console.log(`Created ${rawMaterialsData.length} raw materials`);

    // 6. Generate Sales History (Transactions & Orders) for past 7 days
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Random number of orders per day (15 to 40 for a busy chai adda)
        const orderCount = Math.floor(Math.random() * 26) + 15;

        for (let j = 0; j < orderCount; j++) {
            // Random items in order
            const itemSize = Math.floor(Math.random() * 3) + 1; // 1-3 items typically
            const orderItems = [];
            let totalAmount = 0;

            for (let k = 0; k < itemSize; k++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const qty = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
                totalAmount += product.price * qty;
                orderItems.push({
                    productId: product.id,
                    quantity: qty,
                    price: product.price,
                });
            }

            // Create Order
            const orderTime = new Date(date);
            // Chai Adda timings: 7 AM to 10 PM
            orderTime.setHours(7 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 60));

            const isCash = Math.random() > 0.3; // 70% Cash at Chai Adda

            const order = await prisma.order.create({
                data: {
                    storeId: store.id,
                    total: totalAmount,
                    status: "COMPLETED",
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
    console.log("Store: Chai Adda");
    console.log("Code: " + storeCode);
    console.log("PINs: 1111 (Owner), 2222 (Cashier), 3333 (Kitchen)");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
