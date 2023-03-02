import {NextFunction, Request,Response, Router } from "express";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import { isEmpty } from "class-validator";
import { AppDataSource } from "../data-source";
import Sub from "../entities/Sub";
import { User } from "../entities/User";
import Post from "../entities/Post";


//메인페이지에서 상위 커뮤니티 리스트를 보여주기위해 -> typeORM 사용부분이다.
const topSubs = async (req: Request, res: Response) => {
  try {
    // COALESCE : 만약에 "imageUrn" 부분이 없으면 뒤에 'https://www.gravatar.com/avatar?d=mp&f=y' 이걸로 가져온다. -> 기본이미지로 보여준다.
    const imageUrlExp = `COALESCE('${process.env.APP_URL}/images/' ||s."imageUrn",'https://www.gravatar.com/avatar?d=mp&f=y')`;
    const subs = await AppDataSource.createQueryBuilder()
      .select(// 2. title, name, imageUrl, postcount를 가져온다.
        `s.title, s.name, ${imageUrlExp} as "imageUrl", count(p.id) as "postCount"`
      )
      .from(Sub, "s")//1. Sub테이블에서 가져온다.
      .leftJoin(Post, "p", `s.name = p."subName"`) //Sub의 name과 Post의 subname 같은 것을 join해서 위의 count(p.id)을 표현
      .groupBy('s.title, s.name, "imageUrl"')
      .orderBy(`"postCount"`, "DESC") // postcount 많은 순서대로
      .limit(5)//5개만 가져온다
      .execute();
    return res.json(subs);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};

const createSub = async (req: Request, res: Response, next:NextFunction) => {
    const { name, title, description } = req.body;

    try {
      let errors: any = {};
      if (isEmpty(name)) errors.name = "이름은 비워둘 수 없습니다.";
      if (isEmpty(title)) errors.title = "제목은 비워두 수 없습니다.";
      
      //유저정보가 잇다면
      const sub = await AppDataSource.getRepository(Sub) //sub 저장소에서
        .createQueryBuilder("sub")
        .where("lower(sub.name) = :name", { name: name.toLowerCase() }) //name을 조건으로
        .getOne(); //DB에서 단일한 결과를 가져오려면 .getOne()을 사용하고, 여러 개의 결과를 가지고오려면 .getMany()를 사용
  
      if (sub) errors.name = "서브가 이미 존재합니다.";//getOne은 객체를 사용하는 시점에서 SQL처리
      if (Object.keys(errors).length > 0) { //현재 에러가 생겼으면
        throw errors;
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "문제가 발생했습니다." });
    }
    //위 에러가 나지않으면 아래에서 커뮤니티를 만든다.
    try {
      const user: User = res.locals.user; //커뮤니티를 만든 유저정보를 가져오기위해
  
      const sub = new Sub();
      sub.name = name;
      sub.description = description;
      sub.title = title;
      sub.user = user;
  
      await sub.save(); //DB에 저장하고
      return res.json(sub); //frontend에도 보내준다.
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "문제가 발생했습니다." });
    }

  };



const router = Router();
//router을 통해 user 과 auth미들웨어를 통과한 이후에 createsub를 수행한다.
router.post("/",userMiddleware,authMiddleware,createSub);
//상위 커뮤니티 리스트를 보여주기위한 핸들러
router.get("/sub/topSubs", topSubs);
export default router;