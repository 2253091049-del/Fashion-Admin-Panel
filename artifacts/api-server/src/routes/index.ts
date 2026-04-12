import { Router, type IRouter } from "express";
import healthRouter from "./health";
import salesRouter from "./sales";
import productsRouter from "./products";

const router: IRouter = Router();

router.use(healthRouter);
router.use(salesRouter);
router.use(productsRouter);

export default router;
