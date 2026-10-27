import { auth } from "@/auth";
import AuthModal from "@/components/AuthModal";
import { Header } from "@/components/Header";
import { getPhotoSignedUrls } from "@/libs/photoUrl";
import { prisma } from "@/libs/prisma";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import AlbumActions from "./AlbumActions";
import AlbumNameEditor from "./AlbumNameEditor";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AlbumDetail({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return <AuthModal />;
  }

  const { id } = await params;
  const albumId = Number(id);

  if (!Number.isSafeInteger(albumId) || albumId <= 0) {
    notFound();
  }

  const album = await prisma.albums.findFirst({
    where: {
      id: albumId,
      user_id: session.user.id,
    },
    include: {
      album_photos: {
        orderBy: {
          created_at: "desc",
        },
        select: {
          photo: {
            select: {
              id: true,
              url: true,
            },
          },
        },
      },
    },
  });
  if (!album) notFound();

  const photos = album.album_photos.map((item) => item.photo);

  const signedUrls = await getPhotoSignedUrls(photos.map((photo) => photo.url));

  const displayPhoto = photos.map((photo) => ({
    id: photo.id,
    imageUrl: signedUrls.get(photo.url) ?? null,
  }));

  return (
    <div>
      <Header />
      <div className="flex">
        <Link
          href="/albums"
          aria-label="アルバム一覧に戻る"
          className="m-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-600 shadow-sm hover:bg-gray-100"
        >
          <ArrowLeft size={22} />
        </Link>

        <div className="px-4 pt-6">
          <p className="text-xs tracking-widest text-pink-400">ALBUM</p>
          <AlbumNameEditor albumId={album.id} albumName={album.name} />
          <p className="mt-2 text-sm text-slate-400">全{photos.length}枚</p>
        </div>
      </div>

      <div>
        <AlbumActions
          albumId={album.id}
          albumName={album.name}
          photos={displayPhoto}
        />
      </div>
    </div>
  );
}
