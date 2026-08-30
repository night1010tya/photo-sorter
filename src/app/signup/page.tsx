"use client";

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
      <p>
        すでにアカウントをお持ちの方は
        <Link href="/login">ログイン</Link>
      </p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">名前</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <p>{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p>{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <p>{errors.password}</p>}
        </div>

        <button type="submit">新規登録</button>

        {message && <p>{message}</p>}
      </form>

      <div>
        <p>または以下で登録</p>
        <button type="button">Googleで登録</button>
      </div>
    </div>
  );
}