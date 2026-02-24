import ordersRoutes from "./modules/orders/orders.routes.js";
import inventoryRoutes from "./modules/inventory/inventory.routes.js";
import productsRoutes from "./modules/products/products.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import accountsRoutes from "./modules/accounts/accounts.routes.js";
import reportsRoutes from "./modules/reports/reports.routes.js";
import { authenticate } from "./middleware/auth.middleware.js";


export default (app) => {
    app.use("/v1/auth", authRoutes);
    app.use("/v1/orders", authenticate, ordersRoutes);
    app.use("/v1/inventory", authenticate, inventoryRoutes);
    app.use("/v1/products", authenticate, productsRoutes);
    app.use("/v1/accounts", authenticate, accountsRoutes);
    app.use("/v1/reports", authenticate, reportsRoutes);
};
