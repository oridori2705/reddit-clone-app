import { Request, Response, Router } from "express";
import { User } from "../entities/User";
import { isEmpty, validate } from "class-validator";
import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";
import cookie from "cookie";

const mapError = (errors: Object[]) => {
  return errors.reduce((prev: any, err: any) => {
    //Object.entries(err.constraints); : [ "isEmail","이메일 주소가 잘못되었습니다."]
    //prev : 유효성검사에 부합하지 않는 배열들이 더해져서 모든 유효성검사 오류가 들어가게된다.
    //prev {email : "이메일 주소가~", username : "사용자 이름은 ~ ", password: "비밀번호는  ~"}
    prev[err.property] = Object.entries(err.constraints)[0][1];
    return prev;
  }, {});
};

const login = async(req: Request, res: Response) =>{
  const {username,password}= req.body; 

  try{
    let errors: any = {};

    //값이 비워져있다면 에러를 프론트엔드로 보내주기
    if (isEmpty(username))
      errors.username = "사용자 이름은 비워둘 수 없습니다.";
    if (isEmpty(password)) errors.password = "비밀번호는 비워둘 수 없습니다.";
    if (Object.keys(errors).length > 0) { //위에서 검사한 에러가 들어가 있으면 
      return res.status(400).json(errors);
    }

    // 디비에서 유저 찾기
    const user = await User.findOneBy({ username });
    if (!user)
      return res.status(404).json({ username: "사용자 이름이 등록되지 않았습니다." });

    // 유저가 있다면 비밀번호 비교하기, bcrypt로 저장되어있으므로 비교할때도 bcrypt로 한다.
    const passwordMatches = await bcrypt.compare(password, user.password);

    // 비밀번호가 다르다면 에러 보내기
    if (!passwordMatches) {
      return res.status(401).json({ password: "비밀번호가 잘못되었습니다." });
    }

    //필요한 모듈 설치하기 : npm install jsonwebtoken dotenv cookie --save
    //모듈들의 타입지정을 위한 설치 : npm i --save-dev @types/jsonwebtoken @types/cookie
    //jwt 설치하기 :  jsonwebtoken
    //환경변수 파일 설치하기(프론트엔드는 react-create-app으로 자동생성됨) :dotenv
    //쿠키모듈 설치하기 : cookie
    // 비밀번호가 맞다면 토큰 생성,jwt의 sign 메소드로 토큰생성이 가능 ,username을 넣고 + 비밀문장(환경변수로함)을 넣는다.
    //환경변수 파일(.env)는 모듈 설치 후 server.ts에 모듈 import 후 dotenv.config(); 하면 env파일 사용가능하다.
    const token = jwt.sign({ username },process.env.JWT_SECRET!); 
    // process.env.JWT_SECRET! : 이것은 컴파일러에게 "개발자로서 이 변수가 지금은 undefined나 null이 될 수 없다는 것을 컴파일러보다 잘 알고 있습니다." 라고 말하는 것 ->오류 제거

    // 쿠키저장
    // var setCookie = cookie.serialize("foo","var");
    //쿠키 저장을 위해 위에서 credential : true를 했다.
    //원래는 쿠키로 저장 못한다.
    //{httpOnly: true,maxAge: 60 * 60 * 24 * 7,path: "/",} : 이 쿠키옵션이 없으면 application탭의 cookie에는 토큰이 저장안된다, 
    //-> response의 헤더에는 Set-cookie라는 이름으로 토큰이 저장되어있음
    res.set("Set-Cookie",cookie.serialize("token", token,
    {httpOnly: true, //httpOnly 옵션이 설정된 쿠키는 document.cookie로 쿠키 정보를 읽을 수 없기 때문에 쿠키를 보호할 수 있습니다.
      maxAge: 60 * 60 * 24 * 7, //1주일
      path: "/" // 이 경로나 이 경로의 하위 경로에 있는 페이지만 쿠키에 접근할 수 있습니다. 절대 경로이어야 하고, (미 지정시) 기본값은 현재 경로입니다.
    })); //특별한 경우가 아니라면, path 옵션을 path=/ 같이 루트로 설정해 웹사이트의 모든 페이지에서 쿠키에 접근할 수 있도록 합시다.
    
    //user랑 토큰을 요청을 보내온곳에 다시 보내준다.
    console.log(res)
    return res.json({ user, token });
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  }



const register = async (req: Request, res: Response) => {//Request,Response 타입은 express에서 가져옴 
    //req: client의 Register.tsx에서 보내준 email,password,username이 여기로온다. 현재 req에는 header와같은 다른값도 있다.
    //res : 보내온 요청의 결과값을 저장하고 보내준다.
    const { email, username, password } = req.body;
    console.log("email :",email);
    try {
        let errors: any = {};
    
        // 이메일과 유저이름이 이미 저장 사용되고 있는 것인지 확인.
        const emailUser = await User.findOneBy({ email }); //findOneBy : BaseEntity명령어 값을 하나 찾으면 종료
        const usernameUser = await User.findOneBy({ username });
    
        // 이미 있다면 errors 객체에 넣어줌.
        if (emailUser) errors.email = "이미 해당 이메일 주소가 사용되었습니다.";
        if (usernameUser) errors.username = "이미 이 사용자 이름이 사용되었습니다.";
    
        // 에러가 있다면 return으로 에러를 response 보내줌.
        if (Object.keys(errors).length > 0) { //0보다크면 에러가 있다는 것을 의미
          return res.status(400).json(errors);//400 : 클라이언트 에러라는 에러코드 
        }
        
        //유저 정보와 함께 user 인스턴스를 생성
        const user = new User();
        user.email = email;
        user.username = username;
        user.password = password;
    
        // 엔티티에(entities/User.ts) 정해 놓은 조건으로 user 데이터의 유효성 검사를 해줌.
        errors = await validate(user);
        
        //유효성 검사에 부합하지않으면 에러를 반환한다. errors 객체안에 에러 배열이 들어간다.
        if (errors.length > 0) return res.status(400).json(mapError(errors));
    
        // 유저 정보를 user table에 저장. BaseEntity 명령어 save
        await user.save();
        //저장된 유저정보를 요청을 보내준 클라이언트에 보내준다.
        return res.json(user);

      } catch (error) {
        console.error(error);
        return res.status(500).json({ error }); // 500 : 여기는 서버에서난 오류를 뜻함
      }
};

const router = Router();
router.post("/register", register); // "/register" 경로에 post로 요청이 올 떄 register 핸들러를를 실행한다.
router.post("/login",login)
export default router;
