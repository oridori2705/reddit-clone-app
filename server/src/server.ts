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


const app = express(); //express는 최상위함수니까 app으로 만듦


//app에 express.json과 morgan('dev') 미들웨어를 넣어주는 것 
//app.use(express.json()) : request해서 json형식의 데이터를 보내올때 express app에서 받은다음에 json데이터를 사용해야하는데 
//그래서 express.json()에 있어야 이걸 해석해서 사용할 수 있음
app.use(express.json()); 
//app.use(morgan('dev')) : morgan은 [dev, short, common, combined] 4가지 모드들이 있는데 개발환경에서는 dev옵션을 사용한다.
app.use(morgan('dev')); //app에 morgan


const port = 3000;

//app.get을 사용해 api 생성 -> app.get의 url로 접속하면 해당 블록의 코드 실행
app.get('/', (_, res) => res.send('run'));
//포트를 지정해주고 app.listen을 실행해주면 express app을 실행해주는 것이다.
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
