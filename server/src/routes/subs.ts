import {NextFunction, Request,Response, Router } from "express";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import { isEmpty } from "class-validator";
import { AppDataSource } from "../data-source";
import Sub from "../entities/Sub";
import { User } from "../entities/User";
import Post from "../entities/Post";
import multer, { FileFilterCallback } from "multer";
import { makeId } from "../utils/helpers";
import path from "path";
import { unlinkSync } from "fs";

//커뮤니티 상세 리스트 가져오기
const getSub = async (req: Request, res: Response) => {
  const name = req.params.name; //router.get("/:name",  여기 name을 통해 커뮤니티값을 가져온다.
  try {
    const sub = await Sub.findOneByOrFail({ name });


    // 포스트를 생성한 후에 해당 sub에 속하는 포스트 정보들을 넣어주기
    // 커뮤니티 상세 페이지에서 post/create에서 작성돼 있는 post들을 가져와야한다.
    const posts = await Post.find({//모두 찾아야하니까 find
      where: { subName: sub.name },//해당하는 커뮤니티를 찾음
      order: { createdAt: "DESC" },//순서대로
      relations: ["comments", "votes"],//relatuon : 
    });

    sub.posts = posts; //sub Entity의 post정보를 넣음

    //투표 부분
    if (res.locals.user) {
      sub.posts.forEach((p) => p.setUserVote(res.locals.user));
    }

    return res.json(sub);
  } catch (error) {
    return res.status(404).json({ error: "커뮤니티를 찾을 수 없습니다." });
  }
};


//메인페이지에서 상위 커뮤니티 리스트를 보여주기위해 -> typeORM 사용부분이다.
const topSubs = async (req: Request, res: Response) => {
  try {
    // COALESCE : 만약에 "imageUrn" 부분이 없으면 뒤에 'https://www.gravatar.com/avatar?d=mp&f=y' 이걸로 가져온다. -> 기본이미지로 보여준다.
    // PostGres의 "||" 연산자 : string을 합쳐주는 연산자
    //원래는 s."imageUrn"으로 되어있었는데 메인페이지로 가면 이미지 오류가 뜨게된다 -> 이유를 보니 메인페이지의 커뮤니티리스트에 있는 아이콘 이미지가 이미지 Urn만 들어가 있다 -> URL이 들어가야 이미지가 뜸
    //그래서 URL 경로로 만들어줘야한다. '${process.env.APP_URL}/images/' -> http://localhost:4000 이다
    const imageUrlExp = `COALESCE('${process.env.APP_URL}/images/' || s."imageUrn",'https://www.gravatar.com/avatar?d=mp&f=y')`;
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





  //커뮤니티 상세페이지 이미지 업로드를 위한 3개의 핸들러
  const ownSub = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = res.locals.user;
    try {
      const sub = await Sub.findOneOrFail({ where: { name: req.params.name } }); //DB에서 현재 해당하는 sub을 가져온다.
      //user.username 자신의 user정보는 userMiddleware에서 가져오기 때문에 사용 가능하다.
      if (sub.username !== user.username) { //현재 사용자와 커뮤니티의 주인이 같아야 이미지 업로드 가능하므로 조건 부여 -> 프론트엔드에서도 해줬지만 백엔드에서도 해줘야한다.
        return res
          .status(403)
          .json({ error: "이 커뮤니티를 소유하고 있지 않습니다." }); 
      }
      
      res.locals.sub = sub; //user정보 넣어준것 처럼 sub도 저장
      next(); //다음 핸들러이동
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: " 문제가 발생했습니다." });
    }
  };
  //이미지 파일을 로컬에 저장할 것이다. : multer 모듈 설치해야함, multer이미지를 사용
  const upload = multer({
    //storage-> destination 어디에 저장할건지
    //filename : 어떤 식으로 저장 될 건지,  destination: "public/images" -> server폴더에 public안에 업로드한 이미지 파일이 생긴다.
    storage: multer.diskStorage({destination: "public/images",filename: (_, file, callback) =>{
    const name = makeId(10);// 파일 이름을 임의로 만들고 -> utils/helpers 사용
    callback(null, name + path.extname(file.originalname));//path.extname(file.originalname) : 업로드한 이미지의 파일형식(ex- .png)
  },//path는 내장 모듈 따로 설치 x , path.~~ 를 이용해 확장자, 경로 , 이름 등을 추출 가능
  }),
    fileFilter: (_, file: any, callback: FileFilterCallback) => {//filefilter : 원치않는 파일의 형식이면 걸러낸다.
      if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") { //jpg, png 일때만 업로드
        callback(null, true);
      } else {
        callback(new Error("이미지가 아닙니다."));
      }
    },
  });
  
  const uploadSubImage = async (req: Request, res: Response) => {
    const sub: Sub = res.locals.sub; //위에서 저장해준 sub을 가져온다.
    
    try {
      const type = req.body.type;// 클라이언트에서 보내준 type을 가져온다.
      // 파일 유형을 지정치 않았을 시에는 업로든 된 파일 삭제
      if (type !== "image" && type !== "banner") { //엉뚱한 걸로 파일을 한거니까 삭제해줌
        if (!req.file?.path) { //파일 경로까지 없으면
          return res.status(400).json({ error: "유효하지 않은 파일" }); 
        }
        //multer에 의해 캡슐화된 파일 객체에는 파일 경호가 있기 때문에 dirname/pwd가 자동으로 추가됨
        // 파일을 지워주기 : fs에서 모듈 가져오기
        unlinkSync(req.file.path);//이전의 upload 핸들러에서 보내준 파일 -> 현재 이미지가 업로드 된 상태니까 가져올 수 있음
        return res.status(400).json({ error: "잘못된 유형" });
      }

      // [ 현재 이미지가 업로드 되어있는 상태임 ] -> 이제 이거를 데이터베이스에 저장해야된다


      let oldImageUrn: string = "";

      //이전의 이미지를 지워줘야한다.
      if (type === "image") { //아이콘배너일 때
        // 사용중인 Urn 을 저장합니다. (이전 파일을 아래에서 삭제하기 위해서)
        oldImageUrn = sub.imageUrn || "";
        // 새로운 파일 이름을 Urn 으로 넣어줍니다.
        sub.imageUrn = req.file?.filename || "";
      } else if (type === "banner") {
        oldImageUrn = sub.bannerUrn || "";
        sub.bannerUrn = req.file?.filename || "";
      }
      await sub.save(); //데이터베이스에 새로바뀐 이름들을 저장
  
      // 사용하지 않는 이미지 파일 삭제 : 현재 로컬에 이전의 이미지가 남아있으니까 지워줘야한다.
      if (oldImageUrn !== "") {
        //데이터베이스는 파일 이름일 뿐이므로 개체 경로 접두사를 직접 추가해야한다. Linux 및 windows 호환
        const fullFileName = path.resolve(
          process.cwd(),
          "public",
          "images",
          oldImageUrn //Urn : 이미지만 있음 모든 경로를 넣어줘야 파일을 지울 수 있다.
        );
        unlinkSync(fullFileName);
      }
  
      return res.json(sub);//sub정보를 클라이언트에 보내준다.
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
//커뮤니스 상세 리스트 가져오는 핸들러, 아래 이름을 이용해 해당 커뮤니티글 을 가져온다.
router.get("/:name", userMiddleware, getSub);
//커뮤니티 상세페이지의 상단 배너와 아이콘배너의 이미지를 업로드하는 router, 3개의 핸들러가 있다.
router.post(
  "/:name/upload",
  userMiddleware,
  authMiddleware,
  ownSub,
  upload.single("file"),
  uploadSubImage
);
export default router;