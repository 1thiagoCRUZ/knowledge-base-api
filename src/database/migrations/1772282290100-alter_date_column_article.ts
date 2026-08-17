import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterDateColumnArticle1772282290100 implements MigrationInterface {
    name = 'AlterDateColumnArticle1772282290100'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" ALTER COLUMN "publishedAt" SET DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" ALTER COLUMN "publishedAt" DROP DEFAULT`);
    }

}
