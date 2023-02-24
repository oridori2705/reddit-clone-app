import { Exclude, Expose } from "class-transformer";
import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { makeId } from "../utils/helpers";
import BaseEntity from './Entity';
import Post from "./Post";
import { User } from "./User";
import Vote from "./Vote";

@Entity("comments")
export default class Comment extends BaseEntity {
    @Index()
    @Column()
    identifier: string;

    @Column()
    body: string;

    @Column()
    username: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "username", referencedColumnName: "username" })
    user: User

    @Column()
    postId: number;

    @ManyToOne(() => Post, (post) => post.comments, { nullable: false })
    post: Post;

    @Exclude()
    @OneToMany(() => Vote, (vote) => vote.comment)
    votes: Vote[]

    protected userVote: number;
    //findIndex : 원하는 요소를 찾으면 인덱스를 반환하고 바로 메소드를 종료함, 없으면 -1반환
    setUserVote(user: User) {
        const index = this.votes?.findIndex(v => v.username === user.username);
        this.userVote = index > -1 ? this.votes[index].value : 0;  //만약 투표한 데이터가 있으면 해당 value 반환(value는 1아니면 -1)
    }

    @Expose() get voteScore(): number { //총 투표한 숫자
        const initialValue = 0; //총 투표한 숫자 초기화 값
        //해당 댓글의 vote의 값을 모두 합친값, previousValue= 누적된합, currentobject=>계속해서 검사하는 value 값 없으면 0
        return this.votes?.reduce((previousValue, currentObject) => 
            previousValue + (currentObject.value || 0), initialValue)
    }

    @BeforeInsert()
    makeId() {
        this.identifier = makeId(8);
    }
}