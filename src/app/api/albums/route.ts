import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const session = await auth();
    if(!session?.user?.id){
        return NextResponse.json(
            {message:"ログインが必要です"},
            {status:401}
        );
    };

    const formData =await request.formData();
    const name = formData.get("name")
    if (typeof name !== "string" || name.trim() === "") {
        return NextResponse.json(
          { message: "アルバム名を入力してください" },
          { status: 400 }
        );
      }

    const album = await prisma.albums.create({
        data: {
          user_id: session.user.id,
          name: name.trim(),
        },
      });
      return NextResponse.json(
        {message: "アルバムを作成しました",album,},
        {status: 201}
      );
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
    
      const { albumId } = body as Record<string, unknown>;
    
      if (
        typeof albumId !== "number" ||
        !Number.isSafeInteger(albumId) ||
        albumId <= 0
      ) {
        return NextResponse.json(
          { message: "アルバムIDが正しくありません" },
          { status: 400 },
        );
      }

      const result = await prisma.albums.deleteMany({
        where: {
          id: albumId,
          user_id: session.user.id,
        },
      });
    
      if (result.count === 0) {
        return NextResponse.json(
          { message: "アルバムが見つかりません" },
          { status: 404 },
        );
      }
      
      return NextResponse.json({
        message: "アルバムを削除しました",
      });
    }