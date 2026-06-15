-- Add slug columns
ALTER TABLE "room" ADD COLUMN "slug" TEXT;
ALTER TABLE "speaker" ADD COLUMN "slug" TEXT;
ALTER TABLE "event_session" ADD COLUMN "slug" TEXT;

-- Generate slugs from existing data
UPDATE "room" SET "slug" = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE("name", ' ', '-'), 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'à', 'a'), 'â', 'a'), 'ô', 'o'), 'ù', 'u'), 'û', 'u'), 'ç', 'c')) WHERE "slug" IS NULL;

UPDATE "speaker" SET "slug" = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE("fullName", ' ', '-'), 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'à', 'a'), 'â', 'a'), 'ô', 'o'), 'ù', 'u'), 'û', 'u'), 'ç', 'c')) WHERE "slug" IS NULL;

UPDATE "event_session" SET "slug" = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE("title", ' ', '-'), 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'à', 'a'), 'â', 'a'), 'ô', 'o'), 'ù', 'u'), 'û', 'u'), 'ç', 'c')) WHERE "slug" IS NULL;

-- Add unique constraints
ALTER TABLE "room" ADD CONSTRAINT "room_slug_key" UNIQUE ("slug");
ALTER TABLE "speaker" ADD CONSTRAINT "speaker_slug_key" UNIQUE ("slug");
ALTER TABLE "event_session" ADD CONSTRAINT "event_session_slug_key" UNIQUE ("slug");
