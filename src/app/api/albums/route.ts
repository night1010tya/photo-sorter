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