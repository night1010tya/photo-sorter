import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const session = await auth();

    if(!session?.user?.id) {
        return NextResponse.json(
            { message: "ログインが必要です"},
            {status: 401}
        )
    }

    let body: unknown;

    try {
        body= await request.json()
    } catch {
        return NextResponse.json(
            {message: "リクエスト形式が正しくありません"},
            {status: 400}
        )
    }

    if (typeof body !== "object" || body === null) {
        return NextResponse.json(
            {message: "送信データが正しくありません"},
            {status: 400}
        )
    }

    const { photoId, albumId } = body as Record<string, unknown>;

    if (
      typeof photoId !== "number" ||
      !Number.isSafeInteger(photoId) ||
      photoId <= 0 ||
      typeof albumId !== "number" ||
      !Number.isSafeInteger(albumId) ||
      albumId <= 0
    ) {
      return NextResponse.json(
        { message: "写真IDまたはアルバムIDが正しくありません" },
        { status: 400 },
      );
    }

    const [photo, album] = await Promise.all([
        prisma.photos.findFirst({
          where: {
            id: photoId,
            user_id: session.user.id,
          },
        }),
        prisma.albums.findFirst({
          where: {
            id: albumId,
            user_id: session.user.id,
          },
        }),
      ]);
    
      if (!photo || !album) {
        return NextResponse.json(
          { message: "写真またはアルバムが見つかりません" },
          { status: 404 },
        );
      }
    
      const albumPhoto = await prisma.$transaction(async (tx) => {
        const result = await tx.albumPhotos.upsert({
          where: {
            album_id_photo_id: {
              album_id: albumId,
              photo_id: photoId,
            },
          },
          update: {},
          create: {
            album_id: albumId,
            photo_id: photoId,
          },
        });
      
        await tx.photos.update({
          where: {
            id: photoId,
          },
          data: {
            sort_status: "SORTED",
          },
        });
      
        return result;
      });
    
      return NextResponse.json(
        {
          message: "アルバムに写真を追加しました",
          albumPhoto,
        },
        { status: 201 },
      );

}