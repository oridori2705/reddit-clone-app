//server 폴더에 npx typeorm init 실행
//이 파일은 DB 연결할 때의 설정파일임 

import "reflect-metadata"
import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres", //이름 바꿔줘야함 -> postgres
    password: "password", //비밀번호 바꿔주야함 -> password
    database: "postgres", //데이터베이스 이름 바꿔줘야함 ->postgres
    synchronize: true, //true면 서버를 실행할때마다 테이블 구조나 컬럼을 추가하면 싱크를 계속 맞춘다. 운영환경에서는 false를 해줘야한다.(계속바뀌면안되니까) 개발환경은 true
    logging: false, //로그남기는
    entities: ["src/entities/**/*.ts"], //entities 폴더의 파일을 뜻함 ->src/entities/**/*.ts 모든파일을 가져옴
    migrations: [],
    subscribers: [],
})
