import { auth } from "@/auth";
import Button from "@/components/Button";
import { Header } from "@/components/Header";
import { getPhotoSignedUrls } from "@/libs/photoUrl";
import { prisma } from "@/libs/prisma";
import { FolderPlus, Folders, Images, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  const photos = session?.user?.id
    ? await prisma.photos.findMany({
        where: {
          user_id: session.user.id,
        },
        select: {
          id: true,
          url: true,
        },
        orderBy: [{ created_at: "desc" }, { id: "desc" }],
        take: 6,
      })
    : [];

  const signedUrls = await getPhotoSignedUrls(photos.map((photo) => photo.url));

  return (
    <>
      <Header />
      <main className="min-h-screen flex flex-col px-4">
        <div className="mt-7 mb-4 tracking-wider">
          <Link href="/swipe" className="w-full">
            <Button>
              <FolderPlus className="animate-bounce duration-1000 mt-2" />
              仕分けを始める
            </Button>
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Link href="/photos/new" className="w-full">
            <Button variant="secondary">
              <span className="inline-flex items-center justify-center rounded-full bg-[#DE9C90] p-3">
                <Plus size={20} aria-hidden="true" />
              </span>
              写真を追加
            </Button>
          </Link>

          <Link href="/photos" className="w-full">
            <Button variant="secondary">
              <span className="inline-flex items-center justify-center rounded-full bg-[#97C1CB] p-3">
                <Images size={20} aria-hidden="true" />
              </span>
              写真一覧
            </Button>
          </Link>

          <Link href="/albums" className="w-full">
            <Button variant="secondary">
              <span className="inline-flex items-center justify-center rounded-full bg-[#EBD7C6] p-3">
                <Folders size={20} aria-hidden="true" />
              </span>
              アルバム一覧
            </Button>
          </Link>
        </div>

        <p className="mt-7 mb-2 text-lg font-bold text-slate-700">
          最近追加された写真
        </p>
        {!session?.user?.id ? (
          <p className="py-4 text-sm text-gray-500">
            ログインすると、最近追加した写真が表示されます。
          </p>
        ) : photos.length === 0 ? (
          <p className="py-4 text-sm text-gray-500">
            まだ写真がありません。写真を追加してみましょう。
          </p>
        ) : (
          <div className="grid flex-1 grid-cols-3 auto-rows-[minmax(6rem,1fr)] gap-2">
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
                <Link
                  key={photo.id}
                  href={`/photos/${photo.id}`}
                  className="relative block overflow-hidden rounded-lg"
                >
                  <Image
                    src={imageUrl}
                    alt="最近追加した写真"
                    fill
                    unoptimized
                    sizes="33vw"
                    className="object-cover"
                  />
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
