import { instanceToPlain } from "class-transformer";
import { BaseEntity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";// BaseEntity는 typeORM의 명령어를 사용할 수 있다.
//위 import값에서 보이듯 모두 typeORM에서 가져온다

export default abstract class Entity extends BaseEntity{
   
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
    
    //현재 커뮤니티 상세페이지에서 이미지가 안들어가는 현상이 나왔다. Sub 엔티티에서 이미지가 없으면 기본이미지가 들어가야하는데 안들어감
    //아래 두줄을 추가해서 이미지가 정상적으로 들어가게해야함
    //엔티티에서 Expose 해준 것을 프론트엔드에서 가져올 수 있게 하는 역할
    toJSON(){
        return instanceToPlain(this);
    }
}