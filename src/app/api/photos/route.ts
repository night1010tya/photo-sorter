import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";
import { supabaseAdmin } from "@/libs/supabaseAdmin";
import { NextResponse } from "next/server";


export async function POST(request:Request) {

    const session = await auth();
    if(!session?.user?.id){
        return NextResponse.json(
            {message:"ログインが必要です"},
            {status:401}
        );
    };

    const formData =await request.formData();

    const photos = formData.getAll("photos");

   for (const photo of photos){ 
    if (!(photo instanceof File)) {
        return NextResponse.json(
            {message:"写真がありません"},
            {status:400}
        );
    }

    const extension = photo.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${extension}`;

    const { data, error } = await supabaseAdmin.storage
    .from("photos")
    .upload(fileName, photo);;
  
    if (error) {
      console.error(error);
        return NextResponse.json(
          { message: "写真のアップロードに失敗しました" },
          { status: 500 }
        );
      }
    
      await prisma.photos.create({
        data: {
          user_id: session.user.id,
          url: data.path,
        },
      });
    }

    return NextResponse.json(
      { message: "写真をアップロードしました" },
      { status: 201 }
    )
  }




  
  export async function PATCH(request: Request) {
    const session = await auth();
  
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "ログインが必要です" },
        { status: 401 },
      );
    }
  
    let body: unknown;
  
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "リクエスト形式が正しくありません" },
        { status: 400 },
      );
    }
  
    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { message: "送信データが正しくありません" },
        { status: 400 },
      );
    }
  
    const { photoId } = body as Record<string, unknown>;
  
    if (
      typeof photoId !== "number" ||
      !Number.isSafeInteger(photoId) ||
      photoId <= 0
    ) {
      return NextResponse.json(
        { message: "写真IDが正しくありません" },
        { status: 400 },
      );
    }
  
    const result = await prisma.photos.updateMany({
      where: {
        id: photoId,
        user_id: session.user.id,
      },
      data: {
        sort_status: "SORTED",
      },
    });
  
    if (result.count === 0) {
      return NextResponse.json(
        { message: "写真が見つかりません" },
        { status: 404 },
      );
    }
  
    return NextResponse.json({
      message: "写真を仕分け済みにしました",
    });
  }

  
  export async function DELETE(request: Request) {
    const session = await auth();
  
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "ログインが必要です" },
        { status: 401 },
      );
    }
  
    let body: unknown;
  
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "リクエスト形式が正しくありません" },
        { status: 400 },
      );
    }
  
    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { message: "送信データが正しくありません" },
        { status: 400 },
      );
    }
  
    const { photoIds } = body as Record<string, unknown>;
  
    if (
      !Array.isArray(photoIds) ||
      photoIds.length === 0 ||
      !photoIds.every(
        (id: unknown) =>
          typeof id === "number" &&
          Number.isSafeInteger(id) &&
          id > 0,
      )
    ) {
      return NextResponse.json(
        { message: "写真IDの一覧が正しくありません" },
        { status: 400 },
      );
    }
  
    const uniquePhotoIds = [...new Set<number>(photoIds)];
  
    try {
      const photos = await prisma.photos.findMany({
        where: {
          id: {
            in: uniquePhotoIds,
          },
          user_id: session.user.id,
        },
        select: {
          id: true,
          url: true,
        },
      });

      if (photos.length !== uniquePhotoIds.length) {
        return NextResponse.json(
          { message: "削除対象の写真が見つかりません。画面を更新してください。" },
          { status: 404 },
        );
      }

      const { error } = await supabaseAdmin.storage
        .from("photos")
        .remove(photos.map((photo) => photo.url));
  
      if (error) {
        throw error;
      }

      const result = await prisma.photos.deleteMany({
        where: {
          id: {
            in: uniquePhotoIds,
          },
          user_id: session.user.id,
        },
      });
  
      return NextResponse.json({
        message: "写真を削除しました",
        deletedCount: result.count,
      });
    } catch (error) {
      console.error("写真の削除に失敗しました", error);
  
      return NextResponse.json(
        { message: "写真を削除できませんでした。もう一度お試しください。" },
        { status: 500 },
      );
    }
  }
