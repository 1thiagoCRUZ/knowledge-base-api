import { MigrationInterface, QueryRunner } from 'typeorm';

export class Pomodoro1791700000000 implements MigrationInterface {
  name = 'Pomodoro1791700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "pomodoro_settings" ("userId" integer NOT NULL, "focusMinutes" integer NOT NULL DEFAULT '25', "shortBreakMinutes" integer NOT NULL DEFAULT '5', "longBreakMinutes" integer NOT NULL DEFAULT '15', "cyclesUntilLongBreak" integer NOT NULL DEFAULT '4', "autoStartBreaks" boolean NOT NULL DEFAULT false, "autoStartFocus" boolean NOT NULL DEFAULT false, "timezone" character varying(64) NOT NULL DEFAULT 'America/Sao_Paulo', "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_pomodoro_settings" PRIMARY KEY ("userId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pomodoro_session" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "type" character varying(20) NOT NULL, "startedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "endedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "plannedSeconds" integer NOT NULL, "durationSeconds" integer NOT NULL, "completed" boolean NOT NULL, "articleId" integer, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_pomodoro_session" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_pomodoro_session_articleId" ON "pomodoro_session" ("articleId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_pomodoro_session_userId_startedAt" ON "pomodoro_session" ("userId", "startedAt")`,
    );
    await queryRunner.query(
      `ALTER TABLE "pomodoro_settings" ADD CONSTRAINT "FK_pomodoro_settings_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pomodoro_session" ADD CONSTRAINT "FK_pomodoro_session_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pomodoro_session" ADD CONSTRAINT "FK_pomodoro_session_articleId" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "pomodoro_session"`);
    await queryRunner.query(`DROP TABLE "pomodoro_settings"`);
  }
}
