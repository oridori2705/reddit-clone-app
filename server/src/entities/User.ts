import { IsEmail, Length } from "class-validator";
import { Entity, PrimaryGeneratedColumn, Column, Index, In, OneToMany, BeforeInsert } from "typeorm"
import bcrypt from 'bcryptjs';
import Post from "./Post";
import Vote from "./Vote";
import BaseEntity from './Entity';


//id나 createdAt updateAt은 Entity에 있음
@Entity("users") //-> CREATE TABLE user 을 뜻한다.
export class User extends BaseEntity {

    @Index() //데이터베이스의 인덱스를생성 : 테이블 쿼리 속도를 올려줌, 양이많고 검색이 빈번한 경우
    @IsEmail(undefined, { message: "이메일 주소가 잘못되었습니다." }) //유효성체크 validator의 기능
    @Length(1, 255, { message: "이메일 주소는 비워둘 수 없습니다." }) //유효성체크
    @Column({ unique: true }) //이메일 컬럼을 뜻함 거기에 유니크 속성 -> 하나만 존재해야함
    email: string; //이메일 컬럼을 뜻함

    @Index()
    @Length(3, 32, { message: "사용자 이름은 3자 이상이어야 합니다." })
    @Column({ unique: true })
    username: string

    @Column()
    @Length(6, 255, { message: '비밀번호는 6자리 이상이어야 합니다.' })
    password: string;

    @OneToMany(() => Post, (post) => post.user) //OneToMany 관계
    posts: Post[]

    @OneToMany(() => Vote, (vote) => vote.user)
    votes: Vote[]

    @BeforeInsert() //값을 넣기전에 패스워드는 암호화해서 넣는다.
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 6)
    }

}

