"use client";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const validateLogin = () => {
    const newErrors = {
      email: "",
      password: "",
    };

    if (!formData.email.trim()) {
      newErrors.email = "メールアドレスを入力してください";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "正しいメールアドレスを入力してください";
    }

    if (!formData.password) {
      newErrors.password = "パスワードを入力してください";
    }
    setErrors(newErrors);

    return !newErrors.email && !newErrors.password;
  };

  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage("");

    const isValid = validateLogin();

    if (!isValid) {
      return;
    }

    setIsLoggingIn(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setMessage("メールアドレスまたはパスワードが間違っています");
        return;
      }

      alert("ログインしました");
      router.push("/");
    } catch (error) {
      console.error(error);
      setMessage("ログインに失敗しました");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <div className="w-full border-4 border-red-500/25 rounded-lg p-5 shadow-gray-500 bg-yellow-50 shadow-lg">
        <h1 className="font-bold text-gray-500 text-4xl text-center w-fit mx-auto border-b-4 border-red-300 p-1">
          <Link href="/">photo-sorter</Link>
        </h1>
        <div className="text-center p-[35px] shadow-gray-500 flex flex-col gap-1">
          <p className="block text-xl text-center text-gray-500 mb-[15px] font-semibold">
            ログイン
          </p>
          <form onSubmit={handleSubmit}>
            <Input
              label="メールアドレス"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              error={errors.email}
              onChange={handleChange}
              size="medium"
              placeholder="メールアドレス"
            />
            <Input
              label="パスワード"
              id="password"
              name="password"
              type="password"
              value={formData.password}
              error={errors.password}
              onChange={handleChange}
              size="medium"
              placeholder="パスワード"
            />
            <div className="my-4">
              <Button
                type="submit"
                isLoading={isLoggingIn}
                loadingText="ログイン中..."
              >
                ログイン
              </Button>
            </div>
            {message && <p className="mb-3 text-sm text-red-500">{message}</p>}
            <p className="text-xs text-center">
              アカウントをお持ちでない方は
              <Link
                href="/signup"
                className="text-blue-500 border-b hover:text-red-500"
              >
                新規作成
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
