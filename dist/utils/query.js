"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePaginationQuery = void 0;
const parsePaginationQuery = (req) => {
    const query = {};
    if (req.query.page)
        query.page = Number(req.query.page);
    if (req.query.limit)
        query.limit = Number(req.query.limit);
    if (req.query.search)
        query.search = String(req.query.search);
    if (req.query.sortBy)
        query.sortBy = String(req.query.sortBy);
    if (req.query.sortOrder) {
        query.sortOrder = req.query.sortOrder;
    }
    return query;
};
exports.parsePaginationQuery = parsePaginationQuery;
