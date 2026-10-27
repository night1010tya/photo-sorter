import { auth } from "@/auth";
import AuthModal from "@/components/AuthModal";
import { Header } from "@/components/Header";
import { getPhotoSignedUrls } from "@/libs/photoUrl";
import { prisma } from "@/libs/prisma";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function Photos() {
  const session = await auth();
  if (!session?.user?.id) {
    return <AuthModal />;
  }

  const photos = await prisma.photos.findMany({
    where: {
      user_id: session.user.id,
    },
    select: {
      id: true,
      url: true,
    },
    orderBy: [{ created_at: "desc" }, { id: "desc" }],
  });

  const signedUrls = await getPhotoSignedUrls(photos.map((photo) => photo.url));

  return (
    <div>
      <Header />
      <Link
        href="/"
        aria-label="ホームへ戻る"
        className="m-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-600 shadow-sm hover:bg-gray-100"
      >
        <ArrowLeft size={22} />
      </Link>

      <div className="m-2 grid grid-cols-3 gap-2">
        <Link
          href="/photos/new"
          aria-label="写真を追加"
          className="flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:bg-gray-100"
        >
          <span aria-hidden="true" className="text-4xl">
            ＋
          </span>
          <span className="mt-2 text-sm">写真を追加</span>
        </Link>

        {photos.map((photo) => {
          const imageUrl = signedUrls.get(photo.url);

          if (!imageUrl) {
            return (
              <div
                key={photo.id}
                className="flex aspect-square items-center justify-center rounded-lg bg-gray-100 p-2 text-center text-sm text-gray-500"
              >
                写真を読み込めませんでした
              </div>
            );
          }

          return (
            <Link key={photo.id} href={`/photos/${photo.id}`}>
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={imageUrl}
                  alt="写真"
                  fill
                  sizes="33vw"
                  unoptimized
                  className="object-cover"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
