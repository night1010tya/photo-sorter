import { auth } from "@/auth";
import AuthModal from "@/components/AuthModal";
import { prisma } from "@/libs/prisma";
import SwipeClient from "./SwipeClient";
import { getPhotoSignedUrls } from "@/libs/photoUrl";

export default async function SwipePage() {
  const session = await auth();

  if (!session?.user?.id) {
    return <AuthModal />;
  }

  const albums = await prisma.albums.findMany({
    where: {
      user_id: session.user.id,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: [{ created_at: "desc" }, { id: "desc" }],
  });

  const dbPhotos = await prisma.photos.findMany({
    where: {
      user_id: session.user.id,
      sort_status: "UNSORTED",
    },
    select: {
      id: true,
      url: true,
    },
    orderBy: [{ created_at: "desc" }, { id: "desc" }],
  });

  const signedUrls = await getPhotoSignedUrls(
    dbPhotos.map((photo) => photo.url),
  );

  const photos = dbPhotos.flatMap((photo) => {
    const imageUrl = signedUrls.get(photo.url);
    if (!imageUrl) return [];
    return [{ id: photo.id, imageUrl }];
  });

  return <SwipeClient albums={albums} photos={photos} />;
}
