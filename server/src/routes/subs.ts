import {Request,Response, Router } from "express";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";

const createSub = async (req: Request, res: Response, next: () => any) => {
    const { name, title, description } = req.body;

  };



const router = Router();
//router을 통해 user 과 auth미들웨어를 통과한 이후에 createsub를 수행한다.
router.post("/",userMiddleware,authMiddleware,createSub);

export default router;