import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import Comment from "./Comment";
import BaseEntity from './Entity';
import Post from "./Post";
import { User } from "./User";

@Entity("votes")
export default class Vote extends BaseEntity {
    @Column()
    value: number; //투표 수

    @ManyToOne(() => User) //파라미터가 하나인 이유는(원래 (user)=>user.posts 같이 있음) 이는 명시해줘도 되고 안해도 된다.

    @JoinColumn({ name: "username", referencedColumnName: "username" })
    user: User

    @Column()
    username: string; //투표한 유저

    @Column({ nullable: true })
    postId: number; //만약 post의 투표면 postId가 넣어진다.-> commentId는 null이됨

    @ManyToOne(() => Post)
    post: Post;

    @Column({ nullable: true })
    commentId: number; //만약 comment의 투표면 commentId가 넣어진다. ->postId는 null이됨

    @ManyToOne(() => Comment)
    comment: Comment
}