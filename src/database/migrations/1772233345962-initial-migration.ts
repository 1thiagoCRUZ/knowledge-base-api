import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1772233345962 implements MigrationInterface {
    name = 'InitialMigration1772233345962'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "category" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "macro" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "name" character varying NOT NULL, "contentBody" character varying NOT NULL, "articleId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_0d67d86d83fe69a5a0d948dedfc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "suggestion" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "articleId" integer NOT NULL, "content" character varying NOT NULL, "status" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_aa072a020434ddd7104de98eebb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tag" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "slug" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "like" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "articleId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "UQ_73848fcc5fb55cef88049ec4803" UNIQUE ("userId", "articleId"), CONSTRAINT "PK_eff3e46d24d416b52a7e0ae4159" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "article" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "categoryId" integer NOT NULL, "title" character varying NOT NULL, "slug" character varying NOT NULL, "content" character varying NOT NULL, "views" integer NOT NULL, "isPublished" boolean NOT NULL, "publishedAt" TIMESTAMP NOT NULL, "likesCount" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_40808690eb7b915046558c0f81b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "isAdmin" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "macro" ADD CONSTRAINT "FK_02034ddb8f8ea5722cd2a1ac9bd" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "macro" ADD CONSTRAINT "FK_09ff5091578061805a4d81a3689" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "suggestion" ADD CONSTRAINT "FK_bc709ea906afb2315940db65096" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "suggestion" ADD CONSTRAINT "FK_5713c94ff22139758bce0481ac4" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "like" ADD CONSTRAINT "FK_e8fb739f08d47955a39850fac23" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "like" ADD CONSTRAINT "FK_a95ce350aee91167d8a1cefeb97" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "article" ADD CONSTRAINT "FK_636f17dadfea1ffb4a412296a28" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "article" ADD CONSTRAINT "FK_12824e4598ee46a0992d99ba553" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" DROP CONSTRAINT "FK_12824e4598ee46a0992d99ba553"`);
        await queryRunner.query(`ALTER TABLE "article" DROP CONSTRAINT "FK_636f17dadfea1ffb4a412296a28"`);
        await queryRunner.query(`ALTER TABLE "like" DROP CONSTRAINT "FK_a95ce350aee91167d8a1cefeb97"`);
        await queryRunner.query(`ALTER TABLE "like" DROP CONSTRAINT "FK_e8fb739f08d47955a39850fac23"`);
        await queryRunner.query(`ALTER TABLE "suggestion" DROP CONSTRAINT "FK_5713c94ff22139758bce0481ac4"`);
        await queryRunner.query(`ALTER TABLE "suggestion" DROP CONSTRAINT "FK_bc709ea906afb2315940db65096"`);
        await queryRunner.query(`ALTER TABLE "macro" DROP CONSTRAINT "FK_09ff5091578061805a4d81a3689"`);
        await queryRunner.query(`ALTER TABLE "macro" DROP CONSTRAINT "FK_02034ddb8f8ea5722cd2a1ac9bd"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "article"`);
        await queryRunner.query(`DROP TABLE "like"`);
        await queryRunner.query(`DROP TABLE "tag"`);
        await queryRunner.query(`DROP TABLE "suggestion"`);
        await queryRunner.query(`DROP TABLE "macro"`);
        await queryRunner.query(`DROP TABLE "category"`);
    }

}
