//항상 routes의 기능 만들기전에 server.ts에서 여기로 올 수 있게 처리해줘야함
//app.use("/api/post")

import { Request, Response, Router } from "express";//아래 코드에서 오류 뜨면 Request와 Response를 express에서 잘 가져왔는지 확인
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import Post from "../entities/Post";
import Sub from "../entities/Sub";
import Comment from "../entities/Comment";


const createPostComment = async (req: Request, res: Response) => {
  const {identifier,slug}=req.params; //경로를 통해 값을 가져옴
  const body= req.body.body //body에 댓글내용 있음 요청 줄 때 body로 지정해줘서 body.body가 됨

  try {
    const post = await Post.findOneByOrFail({identifier,slug}); //post안에 comment넣을거니까 무슨 post인지 찾아준다.  
    const comment= new Comment()//댓글 DB를 갖고와서 댓글 내용과 관련된 유저와 post정보를 저장
    comment.body = body;
    comment.user = res.locals.user;
    comment.post = post;

    //투표 부분
    if (res.locals.user) {
      post.setUserVote(res.locals.user);
    }

    await comment.save();//DB에 저장
    return res.json(comment);// 클라이언트에 저장된 comment정보 보내기
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: "게시물을 찾을 수 없습니다." });
  }

}

//현재 클릭한 post가져오는 라우터
const getPost = async (req: Request, res: Response) => {
  //indentifier는 Post엔티티에서 무작위로 만들어주는 데이터이다. (helper.ts의 함수를 이용한다.)
  //slug또한 글의 title을 helper.ts에서 유효성검사 후 데이터로 넣어준다.
  const { identifier, slug } = req.params; //indentifier 폴더이름과 slug이름을 가져온다.
  try {
    const post = await Post.findOneOrFail({
      where: { identifier, slug },//identifier과 slug를 이용해서 post정보를 찾는다.
      relations: ["sub", "votes"], //join 을해서 관련된 sub정보와 votes정보를 가져오는것
    });

    //Post 엔티티에 있는 setUserVote에 현재 유저를 할당
    if (res.locals.user) {
      post.setUserVote(res.locals.user);
    }

    return res.send(post);
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: "게시물을 찾을 수 없습니다." });
  }
};


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

  //댓글 리스트 가져오기
  const getPostComments = async (req: Request, res: Response) => {
    
    const { identifier, slug } = req.params; //파라미터를 이용해 주소값 가져오기
    try {
      const post = await Post.findOneByOrFail({ identifier, slug }); //관련된 Post정보를 가져온다.
      const comments = await Comment.find({//댓글을 모두 찾아야하므로 find 후 다른 곳들과 달리 {} 중괄호
        where: { postId: post.id }, 
        order: { createdAt: "DESC" }, //내림차순
        relations: ["votes"], // votes 테이블과 join
      });

      //투표 부분
      if (res.locals.user) {
        comments.forEach((c) => c.setUserVote(res.locals.user));
      }
      return res.json(comments);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "문제가 발생했습니다." });
    }
  };

const router = Router();
//post생성 라우터
router.post("/",userMiddleware,authMiddleware, createPost);
//현재 클릭한 post정보를 가져오는 라우터
router.get("/:identifier/:slug", userMiddleware, getPost);
//댓글작성한 내용 DB에 저장하기
router.post("/:identifier/:slug/comments", userMiddleware, createPostComment);
//작성한 댓글들 리스트 가져오기
router.get("/:identifier/:slug/comments", userMiddleware,getPostComments);
export default router; //이것도 항상 routes의 기능 만들 때 작성