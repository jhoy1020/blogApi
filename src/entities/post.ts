import { Length } from "class-validator";
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn
} from "typeorm";
import { Comment } from "./comment";

@Entity()
@Unique(["uuid"])
export class Post {
  @OneToMany(
    () => Comment,
    comment => comment.post
  )
  public comments: Comment[];

  @Column()
  public createdAt: Date;

  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public imageUrl: string;

  @Column()
  public isPublished: boolean;

  @Column()
  public text: string;

  @Column()
  @Length(1, 100)
  public title: string;

  @Column()
  @UpdateDateColumn()
  public updatedAt: Date;

  @Column()
  public uuid: string;
}
