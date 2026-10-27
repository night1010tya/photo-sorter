"use client";

import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  albumId: number;
  albumName: string;
};

export default function AlbumNameEditor({ albumId, albumName }: Props) {
  const [isEditing, setIsEditing] = useState(false); // アルバム名を編集中か

  const [name, setName] = useState(albumName); // 入力欄で編集中の名前

  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (isSaving || name.trim() === "") return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch("/api/albums", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          albumId,
          name: name.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("アルバム名を変更できませんでした");
      }
      router.refresh();
      setIsEditing(false);
    } catch (error) {
      console.error("アルバム名の変更に失敗しました", error);
      setSaveError(
        "アルバム名を変更できませんでした。もう一度お試しください。",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {isEditing ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            maxLength={20}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-label="アルバム名"
            autoFocus
            disabled={isSaving}
            className="min-w-0 flex-1 rounded-lg border border-pink-300 px-3 py-2"
          />

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || name.trim() === ""}
            className="rounded-lg bg-pink-500 px-3 py-2 text-sm text-white hover:bg-pink-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSaving ? "保存中..." : "保存"}
          </button>

          <button
            type="button"
            onClick={() => {
              setName(albumName);
              setSaveError(null);
              setIsEditing(false);
            }}
            disabled={isSaving}
            className="rounded-lg bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
          >
            キャンセル
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <h1 className="min-w-0 break-words text-2xl font-semibold text-slate-700">
            {albumName}
          </h1>

          <button
            type="button"
            onClick={() => {
              setName(albumName);
              setIsEditing(true);
              setSaveError(null);
            }}
            aria-label="アルバム名を変更"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-gray-100"
          >
            <Pencil size={18} />
          </button>
        </div>
      )}
      {saveError && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {saveError}
        </p>
      )}
    </div>
  );
}
