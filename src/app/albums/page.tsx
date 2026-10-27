import { auth } from "@/auth";
import AuthModal from "@/components/AuthModal";
import { Header } from "@/components/Header";
import { getPhotoSignedUrls } from "@/libs/photoUrl";
import { prisma } from "@/libs/prisma";
import { ArrowLeft, Images } from "lucide-react";
import Image from "next/image";
import CreateAlbumButton from "./CreateAlbumButton";
import Link from "next/link";

export default async function Albums() {
  const session = await auth();

  if (!session?.user?.id) {
    return <AuthModal />;
  }

  const albums = await prisma.albums.findMany({
    where: {
      user_id: session.user.id,
    },
    include: {
      album_photos: {
        orderBy: [{ created_at: "asc" }, { id: "asc" }],
        take: 1,
        select: {
          photo: {
            select: {
              url: true,
            },
          },
        },
      },

      _count: {
        select: {
          album_photos: true,
        },
      },
    },
    orderBy: [{ created_at: "desc" }, { id: "desc" }],
  });

  const paths: string[] = [];

  for (const album of albums) {
    const coverPhoto = album.album_photos[0]?.photo;

    if (coverPhoto) {
      paths.push(coverPhoto.url);
    }
  }

  const signedUrls = await getPhotoSignedUrls(paths);

  return (
    <>
      <Header />
      <Link
        href="/"
        aria-label="ホームへ戻る"
        className="m-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-600 shadow-sm hover:bg-gray-100"
      >
        <ArrowLeft size={22} />
      </Link>

      <div className="m-2 grid grid-cols-3 gap-2">
        <CreateAlbumButton />

        {albums.map((album) => {
          const coverPhoto = album.album_photos[0]?.photo;
          const imageUrl = coverPhoto
            ? signedUrls.get(coverPhoto.url)
            : undefined;

          return (
            <Link
              key={album.id}
              href={`/albums/${album.id}`}
              className="block space-y-1"
            >
              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-gray-200 hover:bg-gray-300">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={`${album.name}の表紙`}
                    fill
                    sizes="33vw"
                    unoptimized
                    className="object-cover"
                  />
                ) : coverPhoto ? (
                  <p className="p-2 text-center text-sm text-gray-500">
                    写真を読み込めませんでした
                  </p>
                ) : (
                  <Images size={40} className="text-gray-400" />
                )}

                <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-white">
                  <Images size={18} />
                  <span className="text-sm">{album._count.album_photos}</span>
                </div>
              </div>

              <p className="break-words rounded-full bg-[#fadadd]/50 px-2 py-1 text-center text-gray-500">
                {album.name}
              </p>
            </Link>
          );
        })}
      </div>
    </>
  );
}
