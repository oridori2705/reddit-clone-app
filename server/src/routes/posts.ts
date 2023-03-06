//항상 routes의 기능 만들기전에 server.ts에서 여기로 올 수 있게 처리해줘야함
//app.use("/api/post")

import { Request, Response, Router } from "express";//아래 코드에서 오류 뜨면 Request와 Response를 express에서 잘 가져왔는지 확인
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import Post from "../entities/Post";
import Sub from "../entities/Sub";

const createPost = async (req: Request, res: Response) => { 
    const { title, body, sub } = req.body; //클라이언트에서 포스트submit버튼으로 보내준 것들
    if (title.trim() === "") {
      return res.status(400).json({ title: "제목은 비워둘 수 없습니다." });
    }
  
    const user = res.locals.user; //locals에 저장된 user 가져오기 -usermiddleware에서 가져옴
  
    try {
      const subRecord = await Sub.findOneByOrFail({ name: sub }); //sub:현재 커뮤니티 이름을 이용해 Sub DB에서 같은 커뮤니티를 찾아 저장
      const post = new Post(); //post DB를 선언해서 작성한 post의 정보를 넣어준다.
      post.title = title;
      post.body = body;
      post.user = user;
      post.sub = subRecord; //커뮤니티 이름도 저장
  
      await post.save(); //작성한 정보 DB에 저장
  
      return res.json(post);//프론트에도 전달
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "문제가 발생했습니다." });
    }
    //커뮤니티 상세페이지에서 작성된 post의 list를 갖고오려면 커뮤니티(subs) 라우터에서 해당 커뮤니티를 가져오는 getsubs에서 같이 구현해야한다
  };

const router = Router();
//post생성 라우터
router.post("/",userMiddleware,authMiddleware, createPost);

export default router; //이것도 항상 routes의 기능 만들 때 작성