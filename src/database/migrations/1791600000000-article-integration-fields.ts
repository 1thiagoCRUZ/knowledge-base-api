import { MigrationInterface, QueryRunner } from 'typeorm';

/** Campos para artigos criados por integrações (n8n) e agrupamento em séries. */
export class ArticleIntegrationFields1791600000000 implements MigrationInterface {
  name = 'ArticleIntegrationFields1791600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "article" ADD "source" character varying(20) NOT NULL DEFAULT 'manual'`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ADD "externalId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ADD "series" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ADD "seriesPosition" integer`,
    );
    await queryRunner.query(`ALTER TABLE "article" ADD "metadata" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "article" ADD CONSTRAINT "UQ_594bbe2336fa2b6fdf8743f528e" UNIQUE ("source", "externalId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_article_series" ON "article" ("series")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_article_series"`);
    await queryRunner.query(
      `ALTER TABLE "article" DROP CONSTRAINT "UQ_594bbe2336fa2b6fdf8743f528e"`,
    );
    await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "metadata"`);
    await queryRunner.query(
      `ALTER TABLE "article" DROP COLUMN "seriesPosition"`,
    );
    await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "series"`);
    await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "externalId"`);
    await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "source"`);
  }
}
