import { BaseEntity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";// BaseEntity는 typeORM의 명령어를 사용할 수 있다.
//위 import값에서 보이듯 모두 typeORM에서 가져온다

export default abstract class Entity extends BaseEntity{
   
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}