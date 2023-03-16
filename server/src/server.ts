//설치한 모듈
//nodemon : 서버 코드를 변경 할 때마다 서버를 재시작하 일을 자동으로 대신 해줍니다. -> package.json 파일 수정
//ts-node : Node.js 상에서 TypeScript Compiler를 통하지 않고도, 직접 TypeScript를 실행시키는 역할을 합니다. -> package.json 파일 수정
//package.json 수정부분
//"start" : "ts-node src/server.ts" : 타입스크립트로 작성해서 자바스크립트로 바꿔줘야하니까
//"dev" : "nodemon --exec ts-node ./src/server.ts" : nodemon을 이용해 소스코드 바뀌었을 때 자동으로 서버가 껏다 켜질 수 있게

//morgen : nodeJS 에서 사용되는 로그 관리를 위한 미들웨어 입니다
//@types/express @types/node :Express 및 NodeJS에 대한 Type 정의에 도움이 됩니다.

import express from "express";
import morgan from "morgan";
import { AppDataSource } from "./data-source"


import authRoutes from "./routes/auth"// auth로 가기위한 경로 지정

import subRoutes from "./routes/subs"

import cors from "cors";

import dotenv from "dotenv" //dotenv를 설치하고 아래의 명령어만 실행하면 서버파일에서도 env 파일 사용가능
import cookieParser from "cookie-parser";

import postsRoutes from "./routes/posts"//포스트 작성 routes

import votesRoutes from "./routes/votes";//votes.ts 사용할수 잇도록

const app = express(); //express는 최상위함수니까 app으로 만듦

dotenv.config(); //서버에서 .env파일 사용하기 위한 명령어 한줄이면됨

const origin ="http://localhost:3000"; //클라이언트의 포트
app.use(
    cors({
        origin, //여기에 등록을 해주면 클라이언트를 받아올 수 있다.
        credentials : true
    })
);


//app에 express.json과 morgan('dev') 미들웨어를 넣어주는 것 
//app.use(express.json()) : request해서 json형식의 데이터를 보내올때 express app에서 받은다음에 json데이터를 사용해야하는데 
//그래서 express.json()에 있어야 이걸 해석해서 사용할 수 있음
app.use(express.json()); 
//app.use(morgan('dev')) : morgan은 [dev, short, common, combined] 4가지 모드들이 있는데 개발환경에서는 dev옵션을 사용한다.
app.use(morgan('dev')); //app에 morgan

//클라이언트에서 요청을 보낼때 쿠키를 보낸다. 하지만 서버에서 받아도 쿠키를 받을 수 없다.
//분석을 하고 받아야하므로 cookie-parser을 설치하고 넣어준다.
app.use(cookieParser());

//커뮤니티 상세페이지의 배너에 이미지 업로드시 이미지가 안뜨는 오류 해결
//정적파일이 public안에 있고 브라우저로 접근할 때 제공할 수 있게 해준다.
//static파일이 public안에 있다고 알려줌
app.use(express.static("public"));


const port = 4000;

//app.get을 사용해 api 생성 -> app.get의 url로 접속하면 해당 블록의 코드 실행
app.get('/', (_, res) => res.send('run'));
//프론트엔드에서 요청을 하면 엔트리 파일인 server.ts로와서 app.use /api/auth를 찾고, auth파일로 가서 register을 찾는 것이다.
app.use("/api/auth",authRoutes)

app.use("/api/subs",subRoutes)

app.use("/api/posts",postsRoutes)//post작성 routes

app.use("/api/votes",votesRoutes); //votes routes 갈 수 잇도록
//포트를 지정해주고 app.listen을 실행해주면 express app을 실행해주는 것이다.
app.listen(port, async ()=> {
    AppDataSource.initialize().then( () => {
        console.log("Inserting a new user into the database...",port)

    }).catch(error => console.log(error))

})