import Button from "@/components/Button";
import { Header } from "@/components/Header";
import { FolderPlus, Folders, Images, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const photos = [
    { id: 1, url: "/sample1.jpg" },
    { id: 2, url: "/sample2.jpg" },
    { id: 3, url: "/sample3.jpg" },
    { id: 4, url: "/sample4.jpg" },
    { id: 5, url: "/sample5.jpg" },
    { id: 6, url: "/sample6.jpg" },
  ];

  return (
    <>
      <Header />
      <main  className="min-h-screen flex flex-col px-4">
        <div className="my-9 tracking-wider ">
          <Button><FolderPlus className="animate-bounce duration-1000 mt-2"/>仕分けを始める</Button>
        </div>

        <div className="flex gap-4 my-6">
          <Button variant="secondary"><Plus />写真を追加</Button>
          <Link href="/photos" className="w-full">
            <Button variant="secondary"><Images />写真一覧</Button>
          </Link>
          <Button variant="secondary"><Folders />アルバム一覧</Button>
        </div>

        <p className="mt-4 mb-2 text-lg font-bold text-slate-700">最近追加された写真</p>
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative aspect-square overflow-hidden rounded-lg">
              <Image 
                src={photo.url}
                alt="最近追加された写真"
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}