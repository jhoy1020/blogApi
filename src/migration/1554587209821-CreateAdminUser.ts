import { getRepository, MigrationInterface, QueryRunner } from "typeorm";
import * as uuid from 'uuid';
import { User } from "../entities/user";

export class CreateAdminUser1547919837483 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const user = new User();
    user.username = "admin";
    user.password = "password";
    user.hashPassword();
    user.isAdmin = true;
    user.uuid = uuid();
    const userRepository = getRepository(User);
    await userRepository.save(user);
  }

  public async down(queryRunner: QueryRunner): Promise<any> { /* No Empty Braces. */}
}