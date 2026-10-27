import { auth } from "@/auth";
import AddPhotoToAlbum from "@/components/AddPhotoToAlbum";
import AuthModal from "@/components/AuthModal";
import { Header } from "@/components/Header";
import { prisma } from "@/libs/prisma";
import { supabaseAdmin } from "@/libs/supabaseAdmin";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    albumId?: string | string[];
  }>;
};

export default async function PhotoDetail({ params, searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return <AuthModal />;
  }

  const { id } = await params;
  const photoId = Number(id);
  if (!Number.isSafeInteger(photoId) || photoId <= 0) notFound();

  let backHref = "/photos";

  const query = await searchParams;
  const fromAlbumId =
    typeof query.albumId === "string" ? Number(query.albumId) : null;
  if (
    fromAlbumId !== null &&
    Number.isSafeInteger(fromAlbumId) &&
    fromAlbumId > 0
  ) {
    const albumPhoto = await prisma.albumPhotos.findFirst({
      where: {
        album_id: fromAlbumId,
        photo_id: photoId,
        album: { user_id: session.user.id },
      },
    });
    if (albumPhoto) {
      backHref = `/albums/${fromAlbumId}`;
    }
  }

  const photo = await prisma.photos.findFirst({
    where: {
      id: photoId,
      user_id: session.user.id,
    },
  });

  const albums = await prisma.albums.findMany({
    where: {
      user_id: session.user.id,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  if (!photo) {
    notFound();
  }

  const { data, error } = await supabaseAdmin.storage
    .from("photos")
    .createSignedUrl(photo.url, 60 * 10);

  if (error || !data) {
    throw new Error("写真のURL所得に失敗しました");
  }

  return (
    <>
      <Header />
      <main className="text-center mx-auto max-w-3xl p-4">
        <Link
          href={backHref}
          aria-label={
            backHref === "/photos" ? "写真一覧へ戻る" : "アルバムへ戻る"
          }
          className="block w-fit rounded-full bg-gray-400 px-4 py-2 mb-2 text-white hover:bg-gray-800"
        >
          <ArrowLeft />
        </Link>
        <div className="border  p-3 overflow-y-auto border border-gray-200 rounded-xl bg-white p-6 shadow-md">
          <div className="relative h-[70vh] w-full">
            <Image
              src={data.signedUrl}
              alt="写真"
              fill
              sizes="100vw"
              className="object-contain"
              unoptimized
            />
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex">
              <CalendarDays />
              <p>
                撮影日時：
                {photo.taken_at
                  ? photo.taken_at.toLocaleDateString("ja-JP")
                  : "未設定"}
              </p>
            </div>
            <div className="flex">
              <MapPin />
              <p>撮影場所：{photo.location ?? "未設定"}</p>
            </div>

            <AddPhotoToAlbum albums={albums} photoId={photo.id} />
          </div>
        </div>
      </main>
    </>
  );
}
