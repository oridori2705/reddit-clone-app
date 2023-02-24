import { Exclude, Expose } from 'class-transformer';
import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { makeId, slugify } from '../utils/helpers';
import Comment from './Comment';
import BaseEntity from './Entity';
import Sub from './Sub';
import { User } from './User';
import Vote from './Vote';

@Entity("posts") //post테이블 생성
export default class Post extends BaseEntity {
    @Index()
    @Column()
    identifier: string;//post를 식별하기위해 임의의 7글자를 함수를 통해 만듦

    @Column()
    title: string;

    @Index()
    @Column()
    slug: string; //post의 제목을 변환해서 만든다.

    @Column({ nullable: true, type: "text" })
    body: string; //post 본문

    @Column()
    subName: string; //post가 속해있는 커뮤니티의 이름

    @Column()
    username: string; //post를 작성한 유저이름

    @ManyToOne(() => User, (user) => user.posts) //유저한명이 여러개의 post
    @JoinColumn({ name: "username", referencedColumnName: "username" }) //
    user: User;

    @ManyToOne(() => Sub, (sub) => sub.posts)
    @JoinColumn({ name: "subName", referencedColumnName: "name"})
    sub: Sub;

    @Exclude()
    @OneToMany(() => Comment, (comment) => comment.post)
    comments: Comment[];

    @Exclude()
    @OneToMany(() => Vote, (vote) => vote.post)
    votes: Vote[];

    @Expose() get url(): string {
        return `/r/${this.subName}/${this.identifier}/${this.slug}`
    }

    @Expose() get commentCount(): number {
        return this.comments?.length;
    }

    @Expose() get voteScore(): number {
        return this.votes?.reduce((memo, curt) => memo + (curt.value || 0), 0);
    }

    protected userVote: number;

    setUserVote(user: User) {
        const index = this.votes?.findIndex(v => v.username === user.username);
        this.userVote = index > -1 ? this.votes[index].value : 0;
    }

    @BeforeInsert()
    makeIdAndSlug() {
        this.identifier = makeId(7);
        this.slug = slugify(this.title);
    }
}