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