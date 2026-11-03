import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";
import { supabaseAdmin } from "@/libs/supabaseAdmin";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "ログインが必要です", code: "AUTH_REQUIRED" },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        message: "JSONの形式が正しくありません",
        code: "INVALID_JSON",
      },
      { status: 400 },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    return NextResponse.json(
      {
        message: "送信データが正しくありません",
        code: "INVALID_BODY",
      },
      { status: 400 },
    );
  }

  const { path } = body as Record<string, unknown>;

  if (typeof path !== "string") {
    return NextResponse.json(
      {
        message: "保存先が正しくありません",
        code: "INVALID_PATH",
      },
      { status: 400 },
    );
  }

  //保存先の形式と所有者の確認
  const parts = path.split("/");
  const fileName = parts[1];

  if (
    parts.length !== 2 ||
    typeof fileName !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.[a-z0-9]{1,10}$/.test(fileName)
  ) {
    return NextResponse.json(
      {
        message: "保存先の形式が正しくありません",
        code: "INVALID_PATH",
      },
      { status: 400 },
    );
  }

  if (parts[0] !== session.user.id) {
    return NextResponse.json(
      {
        message: "この保存先には登録できません",
        code: "PATH_FORBIDDEN",
      },
      { status: 403 },
    );
  }

  // エラーが起きた段階を記録する
  let stage = "STORAGE_CHECK";

  try {
    //Storageに写真が存在するか確認
    const { error } = await supabaseAdmin.storage
      .from("photos")
      .info(path);

    if (error) {
      console.error(
        "[photos POST][STORAGE_CHECK_FAILED]",
        error,
      );

      return NextResponse.json(
        {
          message: "Storageに写真があることを確認できませんでした",
          code: "STORAGE_CHECK_FAILED",
        },
        { status: 502 },
      );
    }

    stage = "DB_REGISTER";

    //同じ保存先が登録済みか確認
    const existingPhoto = await prisma.photos.findFirst({
      where: {
        user_id: session.user.id,
        url: path,
      },
      select: {
        id: true,
      },
    });

    if (existingPhoto) {
      return NextResponse.json(
        { message: "この写真は登録済みです" },
        { status: 200 },
      );
    }

    //DBに写真情報を登録
    await prisma.photos.create({
      data: {
        user_id: session.user.id,
        url: path,
      },
    });

    return NextResponse.json(
      { message: "写真を登録しました" },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      `[photos POST][${stage}_FAILED]`,
      error,
    );

    return NextResponse.json(
      {
        message:
          stage === "STORAGE_CHECK"
            ? "Storageとの通信中にエラーが発生しました"
            : "写真情報のDB登録に失敗しました",
        code:
          stage === "STORAGE_CHECK"
            ? "STORAGE_CHECK_FAILED"
            : "DB_REGISTER_FAILED",
      },
      { status: 500 },
    );
  }
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
