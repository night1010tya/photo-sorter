"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, FolderHeart } from "lucide-react";
import { SwipeableCards } from "@daformat/react-swipeable-cards";
import Image from "next/image";

const dummyPhotos = [
  {
    id: 1,
    name: "猫",
    imageSrc: "/cat.jpg",
  },
  {
    id: 2,
    name: "犬",
    imageSrc: "/dog.jpg",
  },
];

const cards = dummyPhotos.map((photo) => ({
  id: String(photo.id),
  card: (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gray-100">
      {""}
      <Image
        src={photo.imageSrc}
        alt={photo.name}
        fill
        sizes="100vw"
        draggable={false}
        className="object-contain"
      />
      {""}
    </div>
  ),
}));

export default function SwipePage() {
  const [processedCount, setProcessedCount] = useState(0);

  // 今は仮の名前。後で選択したアルバム名を渡す
  const albumName = "思い出アルバム";
  const totalCount = dummyPhotos.length;
  const progress = totalCount === 0 ? 0 : (processedCount / totalCount) * 100;

  return (
    <main className="relative left-1/2 h-dvh w-screen -translate-x-1/2 overflow-hidden bg-[#fff8fa] px-4 py-4 md:px-8">
      <SwipeableCards.Root
        cards={cards}
        swipeDirections="horizontal"
        className="mx-auto flex h-full w-full flex-col gap-4"
        onSwipe={() => {
          setProcessedCount((count) => count + 1);
        }}
        emptyView={
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <FolderHeart size={48} className="text-pink-400" />
            <p className="text-lg font-bold text-slate-700">
              すべての写真を確認しました
            </p>
            <p className="text-sm text-slate-500">おつかれさまでした！</p>
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

        <div className="flex shrink-0 items-center justify-center gap-16 pb-2">
          <div className="flex flex-col items-center gap-2">
            <SwipeableCards.SwipeLeftButton
              type="button"
              aria-label="この写真を削除候補にする"
              disabled={processedCount >= totalCount}
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
              disabled={processedCount >= totalCount}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 text-pink-600 shadow-sm ring-1 ring-pink-200 transition hover:bg-pink-200 disabled:opacity-40"
            >
              <ArrowRight size={28} />
            </SwipeableCards.SwipeRightButton>

            <span className="text-xs text-pink-600">アルバムに保存</span>
          </div>
        </div>
      </SwipeableCards.Root>
    </main>
  );
}
