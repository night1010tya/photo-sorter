"use client";

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
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      newErrors.email = "正しいメールアドレスを入力してください";
    }

    if (!formData.password) {
      newErrors.password = "パスワードを入力してください";
    } else if (
      formData.password.length < 8 ||
      formData.password.length > 24
    ) {
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
  };

  return (
    <div>
      <p className="block text-lg text-center text-[#2e8b57] mt-[15px] ">新規登録</p>
    <div className="bg-[#e6e6fa] text-center p-[35px] border-1 border-gray-500/75 rounded-lg shadow-gray-500">

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

        <button className="block w-full p-1 mb-3 bg-[#2e8b57] text-[#ffffff] " type="submit">新規登録</button>

        {message && <p>{message}</p>}
      </form>

      <div className="mb-[15px] text-sm">
        <p>または以下で登録</p>
        <button type="button">Googleで登録</button>
      </div>
      <p className="text-xs text-center">
        既にアカウントをお持ちの方は
        <Link href="/login" className="text-blue-500">ログイン</Link>
      </p>
    </div>
    </div>
  );
}