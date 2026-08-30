import { prisma } from "@/libs/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "全ての項目を入力してください" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail) {
      return NextResponse.json(
        { message: "全ての項目を入力してください" },
        { status: 400 }
      );
    }

    if (trimmedName.length > 12) {
      return NextResponse.json(
        { message: "名前は12文字以内で入力してください" },
        { status: 400 }
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      return NextResponse.json(
        { message: "正しいメールアドレスを入力してください" },
        { status: 400 }
      );
    }

    if (password.length < 8 || password.length > 24) {
      return NextResponse.json(
        { message: "パスワードは8〜24文字で入力してください" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: trimmedEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "このメールアドレスは既に登録されています" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: trimmedEmail,
        passwordHash,
      },
    });

    return NextResponse.json(
      {
        message: "登録が完了しました",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
};