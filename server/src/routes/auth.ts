import { Request, Response, Router } from "express";
import { User } from "../entities/User";
import { validate } from "class-validator";

const mapError = (errors: Object[]) => {
  return errors.reduce((prev: any, err: any) => {
    //Object.entries(err.constraints); : [ "isEmail","이메일 주소가 잘못되었습니다."]
    //prev : 유효성검사에 부합하지 않는 배열들이 더해져서 모든 유효성검사 오류가 들어가게된다.
    //prev {email : "이메일 주소가~", username : "사용자 이름은 ~ ", password: "비밀번호는  ~"}
    prev[err.property] = Object.entries(err.constraints)[0][1];
    return prev;
  }, {});
};


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

export default router;
