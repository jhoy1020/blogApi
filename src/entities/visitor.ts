import { Length } from "class-validator";
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn
} from "typeorm";
import { Comment } from "./comment";

@Entity()
@Unique(["username", "uuid"])
export class Visitor {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public uuid: string;

  @Column()
  @Length(4, 20)
  public username: string;

  @OneToMany(
    () => Comment,
    comment => comment.visitor
  )
  public comments: Comment[];

  @Column()
  public avatarUrl: string;

  @Column()
  @CreateDateColumn()
  public createdAt: Date;

  @Column()
  @UpdateDateColumn()
  public updatedAt: Date;
}
