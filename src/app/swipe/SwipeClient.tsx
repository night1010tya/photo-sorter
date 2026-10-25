"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, FolderHeart } from "lucide-react";
import { SwipeableCards } from "@daformat/react-swipeable-cards";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AlbumSelectModal from "@/components/AlbumSelectModal";
import PhotoSelectModal from "./PhotoSelectModal";
import Link from "next/link";

type Album = {
  id: number;
  name: string;
};

type Photo = {
  id: number;
  imageUrl: string;
};

type Props = {
  albums: Album[];
  photos: Photo[];
};

export default function SwipeClient({ albums, photos }: Props) {
  const router = useRouter();

  const [step, setStep] = useState<"album" | "photos" | "swipe">("album");

  const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null);

  const [processedCount, setProcessedCount] = useState(0);

  const [albumName, setAlbumName] = useState("保存先を選択");

  const [swipePhotos, setSwipePhotos] = useState<Photo[]>([]);

  const totalCount = swipePhotos.length;
  const progress = totalCount === 0 ? 0 : (processedCount / totalCount) * 100;

  const cards = useMemo(
    () =>
      [...swipePhotos].reverse().map((photo) => ({
        id: String(photo.id),
        card: (
          <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gray-100">
            <Image
              src={photo.imageUrl}
              alt="仕分け対象の写真"
              fill
              unoptimized
              sizes="100vw"
              draggable={false}
              className="object-contain"
            />
          </div>
        ),
      })),
    [swipePhotos],
  );

  const isComplete = totalCount > 0 && processedCount >= totalCount;

  const handleSwipe = async (direction: string, cardId: string) => {
    const photoId = Number(cardId);

    const response =
      direction === "right"
        ? await fetch("/api/album-photos", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              photoId,
              albumId: selectedAlbumId,
            }),
          })
        : await fetch("/api/photos", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              photoId,
            }),
          });

    if (!response.ok) {
      console.error("写真の仕分け保存に失敗しました");
      return;
    }

    setProcessedCount((count) => count + 1);
  };

  return (
    <main className="relative left-1/2 h-dvh w-screen -translate-x-1/2 overflow-hidden bg-[#fff8fa] px-4 py-4 md:px-8">
      {step === "album" && (
        <AlbumSelectModal
          albums={albums}
          defaultOpen
          description="仕分けた写真の保存先を選んでください"
          confirmLabel="次へ"
          savingLabel="準備中..."
          onSelect={async (albumId) => {
            setSelectedAlbumId(albumId);

            const album = albums.find((item) => item.id === albumId);
            setAlbumName(album?.name ?? "選択したアルバム");

            setStep("photos");
            return true;
          }}
          onCancel={() => router.push("/")}
        />
      )}

      {step === "photos" && (
        <PhotoSelectModal
          photos={photos}
          onBack={() => setStep("album")}
          onStart={(photoIds) => {
            const selectedIdSet = new Set(photoIds);

            const selectedPhotos = photos.filter((photo) =>
              selectedIdSet.has(photo.id),
            );

            setSwipePhotos(selectedPhotos);
            setProcessedCount(0);
            setStep("swipe");
          }}
        />
      )}

      <SwipeableCards.Root
        key={
          step === "swipe"
            ? swipePhotos.map((photo) => photo.id).join("-")
            : "preparing"
        }
        inert={step !== "swipe"}
        cards={cards}
        swipeDirections="horizontal"
        className="mx-auto flex h-full w-full flex-col gap-4"
        onSwipe={(direction, cardId) => {
          void handleSwipe(direction, cardId);
        }}
        emptyView={
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <FolderHeart size={48} className="text-pink-400" />
            <p className="text-lg font-bold text-slate-700">
              すべての写真を確認しました
            </p>
            <p className="text-sm text-slate-500">{`${totalCount}枚中${processedCount}枚の仕分けが完了しました。`}</p>
            <Link
              href="/albums"
              className="underline text-blue-600 hover:text-red-600"
            >
              アルバム一覧へ
            </Link>
          </div>
        }
      >
        <div className="shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 text-slate-700">
              <FolderHeart className="shrink-0 text-pink-400" />
              <span className="truncate font-semibold">{albumName}</span>
            </div>
            <p className="shrink-0 text-sm text-slate-500">
              {processedCount} / {totalCount} 枚完了
            </p>
          </div>
          <div
            role="progressbar"
            aria-label="写真の仕分け進捗"
            aria-valuemin={0}
            aria-valuemax={totalCount}
            aria-valuenow={processedCount}
            className="mt-3 h-2 overflow-hidden rounded-full bg-pink-100"
          >
            <div
              className="h-full rounded-full bg-pink-400 transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <SwipeableCards.Cards className="relative min-h-0 flex-1 touch-none select-none">
          {(stack) =>
            stack.map((card, index) => (
              <SwipeableCards.CardWrapper
                key={card.id}
                card={card}
                className="absolute inset-0"
                style={{ zIndex: index + 1 }}
              />
            ))
          }
        </SwipeableCards.Cards>

        {!isComplete && (
          <div className="flex shrink-0 items-center justify-center gap-16 pb-2">
            <div className="flex flex-col items-center gap-2">
              <SwipeableCards.SwipeLeftButton
                type="button"
                aria-label="この写真を削除候補にする"
                disabled={step !== "swipe" || processedCount >= totalCount}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:opacity-40"
              >
                <ArrowLeft size={28} />
              </SwipeableCards.SwipeLeftButton>

              <span className="text-xs text-slate-500">削除候補</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <SwipeableCards.SwipeRightButton
                type="button"
                aria-label={`この写真を${albumName}に保存する`}
                disabled={step !== "swipe" || processedCount >= totalCount}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 text-pink-600 shadow-sm ring-1 ring-pink-200 transition hover:bg-pink-200 disabled:opacity-40"
              >
                <ArrowRight size={28} />
              </SwipeableCards.SwipeRightButton>

              <span className="text-xs text-pink-600">アルバムに保存</span>
            </div>
          </div>
        )}
      </SwipeableCards.Root>
    </main>
  );
}
