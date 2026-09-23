import { Router, type IRouter } from "express";
import healthRouter from "./health";
import gimmiRouter from "./gimmi";

const router: IRouter = Router();

router.use(healthRouter);
router.use(gimmiRouter);

export default router;
