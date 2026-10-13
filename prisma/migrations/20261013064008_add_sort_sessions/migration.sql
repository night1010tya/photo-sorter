-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "SortSessions" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "album_id" INTEGER NOT NULL,
    "session_status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SortSessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SortSessionPhotos" (
    "id" SERIAL NOT NULL,
    "sort_session_id" INTEGER NOT NULL,
    "photo_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SortSessionPhotos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SortSessionPhotos_sort_session_id_photo_id_key" ON "SortSessionPhotos"("sort_session_id", "photo_id");

-- CreateIndex
CREATE UNIQUE INDEX "SortSessionPhotos_sort_session_id_position_key" ON "SortSessionPhotos"("sort_session_id", "position");

-- AddForeignKey
ALTER TABLE "SortSessions" ADD CONSTRAINT "SortSessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SortSessions" ADD CONSTRAINT "SortSessions_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "Albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SortSessionPhotos" ADD CONSTRAINT "SortSessionPhotos_sort_session_id_fkey" FOREIGN KEY ("sort_session_id") REFERENCES "SortSessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SortSessionPhotos" ADD CONSTRAINT "SortSessionPhotos_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "Photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
