"use client";

import CreateAlbumForm from "@/components/CreateAlbumForm";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";

export default function CreateAlbumButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="flex aspect-square w-full items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300"
      >
        <Plus />
      </button>

      <p className="rounded-full bg-[#fadadd]/50 px-2 py-1 text-center text-gray-500">
        新規作成
      </p>

      <dialog
        ref={dialogRef}
        className="m-auto rounded-2xl bg-white p-7 shadow-xl backdrop:bg-black/50"
      >
        <h2 className="mb-4 text-center font-bold">アルバムを作成</h2>

        <CreateAlbumForm
          onCreated={() => {
            dialogRef.current?.close();
            router.refresh();
          }}
          onCancel={() => dialogRef.current?.close()}
        />
      </dialog>
    </div>
  );
}
