import { NextFunction,Request,Response } from "express";
import { User } from "../entities/User";
import jwt from "jsonwebtoken";

//여기는 유저정보를 가져오는 곳
export default async(req:Request, res:Response, next : NextFunction)=>{
    try {
        //먼전 sub를 생성할 수 있는 유저인지 체크를 위해 유저정보 가져오기(요청에서 보내주는 토큰을 이용)
        const token =req.cookies.token; //토큰 받아주기
        if(!token) return next(); //없으면 넘겨버리기

        const {username} : any =jwt.verify(token, process.env.JWT_SECRET!);//token에서 username을 추출한다.

        const user = await User.findOneBy({username});//username을 이용해 해당 유저가 실제 있는 유저인지 확인한다.

        if(!user) throw new Error("Unauthenticated"); //없으면 인증 안됨

        //유저 정보를 res.local.user에 넣어주기 -> 그러면 언제든지 user정보를 res를 이용해서 user정보를 받을 수 있음
        res.locals.user=user;
        console.log(user);
        return next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({error: "Unauthenticated"}); //프론트로 에러 보내줌
    }
    
}