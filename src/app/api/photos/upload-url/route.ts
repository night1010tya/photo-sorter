import { auth } from "@/auth";
import { supabaseAdmin } from "@/libs/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(request:Request) {
    const session = await auth();
    if(!session?.user?.id){
        return NextResponse.json(
           { message: "ログインが必要です"},
           {status: 401}
        )
    }

    try {
        const data = await request.json();
      
        if (
          data === null ||
          typeof data !== "object" ||
          Array.isArray(data)
        ) {
          return NextResponse.json(
            { message: "リクエストが正しくありません" },
            { status: 400 }
          );
        }
      
        const { fileName, contentType } = data;
      
        if (
          typeof fileName !== "string" ||
          typeof contentType !== "string"
        ) {
          return NextResponse.json(
            { message: "ファイル名とファイル形式が必要です" },
            { status: 400 }
          );
        }
        
        if (!contentType.startsWith("image/")) {
            return NextResponse.json(
              { message: "画像ファイルを選択してください" },
              { status: 400 }
            );
          }
          
          const extension = fileName.split(".").pop()?.toLowerCase();

          if (!extension || !/^[a-z0-9]{1,10}$/.test(extension)) {
            return NextResponse.json(
              { message: "ファイルの拡張子を確認してください" },
              { status: 400 }
            );
          }

          const uniqueName = crypto.randomUUID();

          const path = `${session.user.id}/${uniqueName}.${extension}`;
          
          const { data: uploadData, error } = await supabaseAdmin.storage
            .from("photos")
            .createSignedUploadUrl(path);
            
            if (error) {
            console.error("アップロード許可の発行に失敗しました", error);
            return NextResponse.json(
                { message: "アップロード許可を発行できませんでした" },
                { status: 500 }
            );
        }
        return NextResponse.json({
            path: uploadData.path,
            token: uploadData.token,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {message: "アップロードの準備に失敗しました" },
            {status: 500 }
        );
      }
    }