-- CreateEnum
CREATE TYPE "ReflectionQuestionType" AS ENUM (
  'NUMBER',
  'TEXT',
  'RATING',
  'YES_NO',
  'MULTI_SELECT',
  'COLOR_SELECT'
);

-- CreateEnum
CREATE TYPE "ReflectionGraphType" AS ENUM ('LINE', 'BAR', 'DOTS');

-- CreateTable
CREATE TABLE "user_question_configs" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "questions" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "user_question_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_responses" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "answers" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "daily_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_question_configs_user_id_key" ON "user_question_configs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_responses_user_id_date_key" ON "daily_responses"("user_id", "date");

-- CreateIndex
CREATE INDEX "daily_responses_user_id_date_idx" ON "daily_responses"("user_id", "date");
