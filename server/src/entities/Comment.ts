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

    protected userVote: number; //이 데이터로 좋아요버튼이 활성화 되어있는지 싫어요 버튼이 활성화 되어 있는지 확인한다.
    //findIndex : 원하는 요소를 찾으면 인덱스를 반환하고 바로 메소드를 종료함, 없으면 -1반환
    setUserVote(user: User) {
        const index = this.votes?.findIndex(v => v.username === user.username);//Post와 마찬가지로 Vote DB에서 현재 사용자가 투표한 댓글이 있는지 찾는다.
        this.userVote = index > -1 ? this.votes[index].value : 0;  //만약 투표한 데이터가 있으면 해당 value 반환(value는 1아니면 -1)-> 좋아요를 했는지 싫어요를 했는지 프론트에서 체크하기 위해
    }//Post와 다른점은 comments는 여러개이므로 route/votes에서 foreach로 현재 사용자의 데이터를 모든 댓글에 보내서 userVote의 값을 설정하였다.

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