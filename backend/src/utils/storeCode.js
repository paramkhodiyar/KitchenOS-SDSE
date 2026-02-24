export const generateStoreCode = () => {
    const prefix = "KOS";
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${random}`;
};
