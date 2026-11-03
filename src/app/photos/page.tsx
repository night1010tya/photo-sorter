import { auth } from "@/auth";
import AuthModal from "@/components/AuthModal";
import { Header } from "@/components/Header";
import { getPhotoSignedUrls } from "@/libs/photoUrl";
import { prisma } from "@/libs/prisma";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import PhotosClient from "./photosClient";

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

  const displayPhotos = photos.map((photo) => ({
    id: photo.id,
    imageUrl: signedUrls.get(photo.url) ?? null,
  }));

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

      <PhotosClient photos={displayPhotos} />
    </div>
  );
}
