"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOptionValue = exports.generateKeySlug = void 0;
const generateKeySlug = (text) => {
    const base = text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s-]+/g, "_")
        .substring(0, 50);
    return base.replace(/_+/g, "_");
};
exports.generateKeySlug = generateKeySlug;
const generateOptionValue = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, "")
        .replace(/[\s-]+/g, "_");
};
exports.generateOptionValue = generateOptionValue;
