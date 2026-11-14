"use client";

import Button from "@/components/Button";
import Input from "@/components/Input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateSignup = () => {
    const newErrors = {
      name: "",
      email: "",
      password: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "名前を入力してください";
    } else if (formData.name.trim().length > 12) {
      newErrors.name = "名前は12文字以内で入力してください";
    }

    if (!formData.email.trim()) {
      newErrors.email = "メールアドレスを入力してください";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "正しいメールアドレスを入力してください";
    }

    if (!formData.password) {
      newErrors.password = "パスワードを入力してください";
    } else if (formData.password.length < 8 || formData.password.length > 24) {
      newErrors.password = "パスワードは8〜24文字で入力してください";
    }

    setErrors(newErrors);

    return !newErrors.name && !newErrors.email && !newErrors.password;
  };

  const router = useRouter();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage("");

    const isValid = validateSignup();

    if (!isValid) {
      return;
    }

    setIsSigningUp(true);
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }
      alert(data.message);
      router.push("/login");
    } catch (error) {
      console.error(error);
      setMessage("登録に失敗しました");
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-5">
      <div className="w-full border-4 border-red-500/25 rounded-lg p-5 shadow-gray-500 bg-yellow-50 shadow-lg">
        <h1 className="font-bold text-gray-500 text-4xl text-center w-fit mx-auto border-b-4 border-red-300 p-1">
          <Link href="/">photo-sorter</Link>
        </h1>
        <div className="text-center p-[35px] shadow-gray-500 flex flex-col gap-1">
          <p className="block text-xl text-center text-gray-500 mb-[15px] font-semibold">
            新規登録
          </p>
          <form onSubmit={handleSubmit}>
            <div>
              <Input
                label="名前"
                placeholder="名前"
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                size="medium"
                error={errors.name}
              />
            </div>

            <div>
              <Input
                label="メールアドレス"
                placeholder="メールアドレス"
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                size="medium"
                error={errors.email}
              />
            </div>

            <div>
              <Input
                label="パスワード"
                placeholder="パスワード"
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                size="medium"
                error={errors.password}
              />
            </div>

            <Button
              type="submit"
              isLoading={isSigningUp}
              loadingText="登録中..."
            >
              新規登録
            </Button>

            {message && <p className="mb-3 text-sm text-red-500">{message}</p>}
          </form>
          {/* <p className="text-sm">または以下で登録</p>
            <Button>Googleで登録</Button> */}
          <p className="text-xs text-center pt-5">
            既にアカウントをお持ちの方は
            <Link
              href="/login"
              className="text-blue-500 border-b hover:text-red-500"
            >
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
