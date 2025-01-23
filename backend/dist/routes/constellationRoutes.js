"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/constellationRoutes.ts
const express_1 = __importDefault(require("express"));
const constellationController_1 = require("../controllers/constellationController");
const router = express_1.default.Router();
router.get('/', constellationController_1.getConstellation);
exports.default = router;
