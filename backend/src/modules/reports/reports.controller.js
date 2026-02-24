import reportsService from "./reports.service.js";

const parseDates = (req) => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    lastWeek.setHours(0, 0, 0, 0);

    const from = req.query.from
        ? new Date(req.query.from)
        : lastWeek; 

    const to = req.query.to
        ? new Date(req.query.to)
        : new Date();

    return { from, to };
};

export const getRevenueReport = async (req, res, next) => {
    try {
        const { from, to } = parseDates(req);
        const data = await reportsService.getRevenueReport({
            storeId: req.context.storeId,
            from,
            to,
        });
        res.json(data);
    } catch (err) {
        next(err);
    }
};

export const getOrderReport = async (req, res, next) => {
    try {
        const { from, to } = parseDates(req);
        const data = await reportsService.getOrderReport({
            storeId: req.context.storeId,
            from,
            to,
        });
        res.json(data);
    } catch (err) {
        next(err);
    }
};

export const getStockReport = async (req, res, next) => {
    try {
        const data = await reportsService.getStockReport({
            storeId: req.context.storeId,
        });
        res.json(data);
    } catch (err) {
        next(err);
    }
};
