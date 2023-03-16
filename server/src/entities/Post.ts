import { Exclude, Expose } from 'class-transformer';
import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { makeId, slugify } from '../utils/helpers';
import Comment from './Comment';
import BaseEntity from './Entity'; //Entity파일을 상속
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

    @Column({ nullable: true, type: "text" }) //type 지정은 선택사항
    body: string; //post 본문

    @Column()
    subName: string; //post가 속해있는 커뮤니티의 이름

    @Column()
    username: string; //post를 작성한 유저이름

    //name: "username" : 외래키 속성명(post 엔티티의 username을 뜻함) 없으면 propertyName+referencedCloumnName로 됨
    //referencedCloumnName : 참조엔티티의 속성명 원래는 id로 하는데 우리는 username(이건 User엔티티의 username을 뜻함)
    @ManyToOne(() => User, (user) => user.posts) //유저한명이 여러개의 post
    @JoinColumn({ name: "username", referencedColumnName: "username" }) //
    user: User;

    //name: "subname" : 외래키 속성명(Post엔티티의 username을 뜻함) 없으면 propertyName+referencedCloumnName로 됨
    //referencedCloumnName : 참조엔티티의 속성명 원래는 id로 하는데 우리는 username(이건 Sub엔티티의 username을 뜻함)
    @ManyToOne(() => Sub, (sub) => sub.posts)
    @JoinColumn({ name: "subName", referencedColumnName: "name"})
    sub: Sub;

    //Exclude : 제외한다.
    @Exclude()
    //Post 하나에 여러개의 댓글
    @OneToMany(() => Comment, (comment) => comment.post)
    comments: Comment[];

    @Exclude()
    //Post 하나에 여러개의 투표
    @OneToMany(() => Vote, (vote) => vote.post)
    votes: Vote[];

    //r로 시작하는 이유는 따로 없음
    @Expose() get url(): string {
        return `/r/${this.subName}/${this.identifier}/${this.slug}` //post의 url을 생성해서 보내준다.
    }

    @Expose() get commentCount(): number {
        return this.comments?.length; //댓글이 있으면 댓글의 갯수를 보내준다.
    }

    @Expose() get voteScore(): number {
        return this.votes?.reduce((memo, curt) => memo + (curt.value || 0), 0); //투표가 몇명이 올리고 내렷는지의 합 curt.value가 없을 경우 0으로 방어코드
    }

    protected userVote: number; //
    
    setUserVote(user: User) {
        const index = this.votes?.findIndex(v => v.username === user.username);//투표 DB에 지금 현재사용자의 아이디로 된 POST 투표가 있는지 찾는다.
        this.userVote = index > -1 ? this.votes[index].value : 0; //있으면 그 index의 value(좋아요를 했는지 싫어요를 했는지)를 갖고와서 간단하게 userVote에 저장한다. 
        //만약 좋아요버튼을 클릭했을 경우 프론트에서 좋아요 버튼을 활성화(좋아요 했다는 표시) 시켜줘야하기 때문에
    }
    //다른 소스 이용함 ->helpers.ts
    @BeforeInsert()
    makeIdAndSlug() {
        this.identifier = makeId(7); //7자리의 임의의 아이디를 만들어준다.
        this.slug = slugify(this.title); //post의 제목을 이용해 slug를 만들어준다.
    }
}