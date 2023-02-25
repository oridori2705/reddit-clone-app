import { Request, Response, Router } from "express";


const register = async (req: Request, res: Response) => {//Request,Response 타입은 express에서 가져옴 
    //req: client의 Register.tsx에서 보내준 email,password,username이 여기로온다. 현재 req에는 header와같은 다른값도 있다.
    //res : 보내온 요청의 결과값을 저장하고 보내준다.
    const { email, username, password } = req.body;
    console.log("email :",email);
};

const router = Router();
router.post("/register", register); // "/register" 경로에 post로 요청이 올 떄 register 핸들러를를 실행한다.

export default router;
