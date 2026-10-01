"use client";

import Button from "@/components/Button";
import Input from "@/components/Input";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function CreateAlbumForm() {
    const [name, setName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const router = useRouter();

    const handleSubmit = async () => {
        if(!name.trim()) {
            return;
        }

        setIsCreating(true);
        try{
            const formData = new FormData();
            formData.append("name", name);

            const response = await fetch("/api/albums",{
                method: "POST",
                body: formData
            });

            if (!response.ok){
                throw new Error("アルバムの作成に失敗しました")
            }

            setName("");
            dialogRef.current?.close();

            router.refresh()
        } catch (error) {
            console.error(error);
          } finally {
            setIsCreating(false);
          }
      };

    const handleClick = () => {
        dialogRef. current?. showModal();
    }

    const handleRemove = () => {
        dialogRef.current?.close();
        setName("");
    }


    return(
        <div>
            <div className="space-y-1">
                <button onClick={handleClick} 
                className="flex w-full aspect-square items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300">
                    <Plus className="" />
                </ button>
                <p  className="text-center break-words bg-[#fadadd]/50 text-gray-500 rounded-full px-2 py-1">新規作成</p>
            </div>
            <dialog ref={dialogRef} className="m-auto rounded-2xl p-7 shadow-xl backdrop:bg-black/50">
                <div>
                    <p className="font-bold text-center m-3">アルバムを作成</p>
                    <Input 
                        label=""
                        id="albumTitle"
                        name="albumTitle"
                        size="medium"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="アルバム名"/ >
                    <Button onClick={handleSubmit} isLoading={isCreating} loadingText="作成中...">作成</Button>
                    <button type="button"
                            onClick={handleRemove}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full px-2 hover:bg-red-500">
                                ×
                    </button>
                </div>
            </dialog>
        </div>
    )

}