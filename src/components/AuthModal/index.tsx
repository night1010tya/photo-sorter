import Link from "next/link";
import Button from "../Button";


export default function AuthModal() {
    
    return(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="relative rounded-2xl bg-white p-7 shadow-xl m-3">
                <div className="flex flex-col gap-3">
                    <h2 className="font-bold text-center">ログインが必要です</h2>
                    <p className="break-keep text-pretty text-center text-sm m-2">この機能を利用するには、新規登録またはログインをしてください。</p>
                </div>
                <div className="flex flex-col gap-3">
                    <Link href="/signup" className="w-full">
                        <Button>新規登録</Button>
                    </Link>
                    <Link href="/login" className="w-full">
                        <Button>ログイン</Button>
                    </Link>
                </div>
                <Link
                    href="/"
                    className="absolute top-1 right-1 rounded-full bg-black/60 px-2 text-white hover:bg-red-500"
                >
                    ×
                </Link>

            </div>
        </div>
    )
}