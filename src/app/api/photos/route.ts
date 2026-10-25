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