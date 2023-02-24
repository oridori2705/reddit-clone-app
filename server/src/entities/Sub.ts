import { Expose } from "class-transformer";
import { Column, Entity, Index, JoinColumn, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import BaseEntity from './Entity';
import Post from "./Post";
import { User } from "./User";

@Entity("subs")//Community 엔티티
export default class Sub extends BaseEntity {

    @Index()
    @Column({ unique: true }) //커뮤니티 이름
    name: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true }) //nullable : 없어도 된다라는 뜻
    description: string;

    @Column({ nullable: true }) //커뮤니티 아이콘 이미지 없으면 기본이미지
    imageUrn: string;

    @Column({ nullable: true }) //커뮤니티 배너 이미지 없으면 기본이미지
    bannerUrn: string;

    @Column() //커뮤니티를 생성한 유저이름(joincolumn 속성명)
    username: string;

    @ManyToOne(() => User) //한명의 유저가 여러개의 커뮤니티를 생성가능
    //joinColumn 어떤 관계쪽이 외래키를 가지고 있는지
    //@joinColumn을 설정하면 자동으로 propertyName+referencedCloumnName이라는 열이 생성됨
    //이 데코레이터의 경우 ManyToOne은 선택사항 OntToOne은 필수
    //name: "username" : 외래키 속성명(sub엔티티의 username을 뜻함) 없으면 propertyName+referencedCloumnName로 됨
    //referencedCloumnName : 참조엔티티의 속성명 원래는 id로 하는데 우리는 username(이건 User엔티티의 username을 뜻함)
    @JoinColumn({ name: "username", referencedColumnName: "username" })
    user: User; 

    @OneToMany(() => Post, (post) => post.sub) //posts는 Community안의 포스트들을 의미
    posts: Post[]
    //원래는 데이터만 JSON으로 보낸 다음에 imageURL을 거기서 생성할 수 있지만 여기서 깔끔하게 했다.
    @Expose() //Expose : class-TransFormer을 이용해 사용 sub.imageUrl하면 해당 이미지를 가져올 수 있음 -> 클래스형태라서(JSON이면 안됨)
    get imageUrl(): string {//process.env.APP_URL : 로컬 호스트 4000번 URL을 일단 환경변수로 변경함
        return this.imageUrn ? `${process.env.APP_URL}/images/${this.imageUrn}` : 
            "https://www.gravatar.com/avatar?d=mp&f=y" //gravatar은 그냥 기본 아이콘 이미지
    }

    @Expose() //배너 이미지의 경로
    get bannerUrl(): string {
        return this.bannerUrn ? `${process.env.APP_URL}/images/${this.bannerUrn}` :
            undefined;
    }
}