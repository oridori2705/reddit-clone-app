import { NextFunction, Request, Response } from "express";
import { User } from "../entities/User";


//여기는 user의 인증 처리
export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user: User | undefined = res.locals.user; //받아온 user

    if (!user) throw new Error("Unauthenticated");  //user가 없으면 인증안됨

    return next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "Unauthenticated" });
  }
};
