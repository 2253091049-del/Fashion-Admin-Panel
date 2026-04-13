import { Router, type IRouter } from "express";
import healthRouter from "./health";
import salesRouter from "./sales";
import productsRouter from "./products";
import backupRouter from "./backup";

const router: IRouter = Router();

router.use(healthRouter);
router.use(salesRouter);
router.use(productsRouter);
router.use(backupRouter);

export default router;
