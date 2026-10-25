"use client";

import PhotoStatusFilter, {
  PhotoStatusFilterValue,
} from "@/components/PhotoStatusFilter";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Photo = {
  id: number;
  imageUrl: string;
  sort_status: "UNSORTED" | "SORTED";
};

type Props = {
  photos: Photo[];
  onBack: () => void;
  onStart: (photoIds: number[]) => void;
};

export default function PhotoSelectModal({ photos, onBack, onStart }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<number[]>([]);

  const handleSwitch = (photoId: number) => {
    setSelectedPhotoIds((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId],
    );
  };

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog && !dialog.open) {
      dialog.showModal();
    }

    return () => {
      dialog?.close();
    };
  }, []);

  const [statusFilter, setStatusFilter] =
    useState<PhotoStatusFilterValue>("UNSORTED");

  const filteredPhotos = photos.filter(
    (photo) => statusFilter === "ALL" || photo.sort_status === statusFilter,
  );

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onBack();
      }}
      className="m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl backdrop:bg-black/40"
    >
      <h2 className="text-lg font-semibold">仕分ける写真を選択</h2>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <PhotoStatusFilter
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            setSelectedPhotoIds([]);
          }}
        />

        <Link
          href="/photos/new"
          className="text-sm font-medium text-pink-600 hover:underline"
        >
          ＋ 写真を追加
        </Link>
      </div>
      <p className="mt-3 text-sm text-gray-500">
        {filteredPhotos.length}枚から選択できます
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {filteredPhotos.map((photo) => {
          const isSelected = selectedPhotoIds.includes(photo.id);

          return (
            <button
              key={photo.id}
              type="button"
              onClick={() => handleSwitch(photo.id)}
              aria-label={`写真 ${photo.id} を選択`}
              aria-pressed={isSelected}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 ${
                isSelected ? "border-pink-500" : "border-transparent"
              }`}
            >
              <Image
                src={photo.imageUrl}
                alt="仕分け候補の写真"
                fill
                unoptimized
                sizes="(max-width: 512px) 33vw, 160px"
                className="object-cover"
              />

              {isSelected && (
                <span className="absolute right-1 top-1 rounded-full bg-pink-500 p-1 text-white">
                  <Check size={16} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filteredPhotos.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-500">
          この条件に一致する写真はありません。
        </p>
      )}

      <div className="sticky -bottom-6 z-10 border-t border-gray-200 bg-white py-4">
        <button
          type="button"
          onClick={onBack}
          className="mt-6 rounded-lg bg-gray-100 px-4 py-2 m-3 hover:bg-gray-300"
        >
          アルバム選択に戻る
        </button>

        <button
          type="button"
          onClick={() => onStart(selectedPhotoIds)}
          disabled={selectedPhotoIds.length === 0}
          className="rounded-lg bg-pink-400 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-300 hover:bg-pink-500"
        >
          {selectedPhotoIds.length}枚を仕分ける
        </button>
      </div>
    </dialog>
  );
}
