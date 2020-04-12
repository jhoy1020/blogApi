import * as bcrypt from "bcryptjs";
import { IsNotEmpty, Length } from "class-validator";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn
} from "typeorm";

@Entity()
@Unique(["username", "uuid"])
export class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public uuid: string;

  @Column()
  @Length(4, 20)
  public username: string;

  @Column()
  @Length(4, 100)
  public password: string;

  @Column()
  @IsNotEmpty()
  public isAdmin: boolean;

  @Column()
  @CreateDateColumn()
  public createdAt: Date;

  @Column()
  @UpdateDateColumn()
  public updatedAt: Date;

  public hashPassword() {
    this.password = bcrypt.hashSync(this.password, 8);
  }

  public checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }
}
