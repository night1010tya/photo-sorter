import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";
import { supabaseAdmin } from "@/libs/supabaseAdmin";
import { NextResponse } from "next/server";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  { params }: Context,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "ログインが必要です" },
      { status: 401 },
    );
  }

  const { id } = await params;
  const albumId = Number(id);

  if (!Number.isSafeInteger(albumId) || albumId <= 0) {
    return NextResponse.json(
      { message: "アルバムIDが正しくありません" },
      { status: 400 },
    );
  }

  try {
    const album = await prisma.albums.findFirst({
      where: {
        id: albumId,
        user_id: session.user.id,
      },
      select: {
        album_photos: {
          where: {
            photo: {
              user_id: session.user.id,
            },
          },
          orderBy: [
            { created_at: "desc" },
            { id: "desc" },
          ],
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

    if (!album) {
      return NextResponse.json(
        { message: "アルバムが見つかりません" },
        { status: 404 },
      );
    }

    const photos = album.album_photos.map((item) => item.photo);

    if (photos.length === 0) {
      return NextResponse.json(
        { message: "ダウンロードできる写真がありません" },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin.storage
      .from("photos")
      .createSignedUrls(
        photos.map((photo) => photo.url),
        60 * 60,
      );

    if (error || !data) {
      throw new Error("写真のURL取得に失敗しました");
    }

    const signedUrls = new Map<string, string>();

    for (const item of data) {
      if (item.path && item.signedUrl && !item.error) {
        signedUrls.set(item.path, item.signedUrl);
      }
    }

    const downloadPhotos = photos.map((photo) => {
      const imageUrl = signedUrls.get(photo.url);

      if (!imageUrl) {
        throw new Error(`写真 ${photo.id} のURL取得に失敗しました`);
      }

      const extension = photo.url.match(/\.([a-zA-Z0-9]+)$/)?.[1];

      return {
        fileName: extension
          ? `photo-${photo.id}.${extension}`
          : `photo-${photo.id}`,
        imageUrl,
      };
    });

    return NextResponse.json(
      { photos: downloadPhotos },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    console.error("ダウンロードの準備に失敗しました", error);

    return NextResponse.json(
      { message: "ダウンロードを準備できませんでした。" },
      { status: 500 },
    );
  }
}