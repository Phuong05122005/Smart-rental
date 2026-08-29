"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = void 0;
const express_1 = require("express");
const healthCheck = (req, res) => {
    res.status(200).json({
        status: 'ok',
    });
};
exports.healthCheck = healthCheck;
//# sourceMappingURL=health.controller.js.map