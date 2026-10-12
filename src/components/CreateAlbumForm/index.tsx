"use client";

import Input from "@/components/Input";
import { useState } from "react";

type Album = {
  id: number;
  name: string;
};

type Props = {
  onCreated: (album: Album) => void;
  onCancel: () => void;
};

export default function CreateAlbumForm({ onCreated, onCancel }: Props) {
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    if (!name.trim() || isCreating) {
      return;
    }

    setIsCreating(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("name", name.trim());

      const response = await fetch("/api/albums", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("アルバムの作成に失敗しました");
      }

      const result: { album: Album } = await response.json();

      setName("");
      onCreated(result.album);
    } catch (error) {
      console.error(error);
      setErrorMessage("アルバムを作成できませんでした");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-5">
      <Input
        label="アルバム名"
        id="albumTitle"
        name="albumTitle"
        size="medium"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="アルバム名"
      />

      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isCreating}
          className="w-32 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
        >
          キャンセル
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!name.trim() || isCreating}
          className="w-32 rounded-full bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isCreating ? "作成中..." : "作成"}
        </button>
      </div>
    </div>
  );
}
