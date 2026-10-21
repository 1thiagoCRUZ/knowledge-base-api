import { MigrationInterface, QueryRunner } from 'typeorm';

export class StudyPlans1791800000000 implements MigrationInterface {
  name = 'StudyPlans1791800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "study_plan" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "title" character varying NOT NULL, "description" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_study_plan" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_study_plan_userId" ON "study_plan" ("userId")`,
    );
    await queryRunner.query(
      `CREATE TABLE "study_topic" ("id" SERIAL NOT NULL, "planId" integer NOT NULL, "title" character varying NOT NULL, "module" character varying(100), "status" character varying(20) NOT NULL DEFAULT 'todo', "priority" character varying(10) NOT NULL DEFAULT 'medium', "estimatedMinutes" integer, "position" integer NOT NULL DEFAULT '0', "notes" text, "completedAt" TIMESTAMP WITH TIME ZONE, "articleId" integer, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_study_topic" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_study_topic_articleId" ON "study_topic" ("articleId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_study_topic_planId_position" ON "study_topic" ("planId", "position")`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_plan" ADD CONSTRAINT "FK_study_plan_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_topic" ADD CONSTRAINT "FK_study_topic_planId" FOREIGN KEY ("planId") REFERENCES "study_plan"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_topic" ADD CONSTRAINT "FK_study_topic_articleId" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "study_topic"`);
    await queryRunner.query(`DROP TABLE "study_plan"`);
  }
}
