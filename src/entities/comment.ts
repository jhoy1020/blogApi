import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Post } from "./post";
import { Visitor } from "./visitor";

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public uuid: string;

  @Column()
  public text: string;

  @Column()
  public createdAt: Date;

  @Column()
  @UpdateDateColumn()
  public updatedAt: Date;

  @ManyToOne(
    type => Post,
    post => post.comments,
    { onDelete: "CASCADE" }
  )
  public post: Post;

  @ManyToOne(
    type => Visitor,
    visitor => visitor.comments,
    { onDelete: "CASCADE" }
  )
  public visitor: Visitor;
}
