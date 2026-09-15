import { auth } from "@/auth";
import { CircleUserRound} from "lucide-react";
import Link from "next/link";

export async function Header() {

    const session = await auth();

    return(
            <header className="sticky top-0 z-50 flex bg-[#fadadd] text-gray-500 p-5 justify-between">
                <Link href="/" className="font-bold hover:text-[#2d3748]">photo-sorter</Link>
                {session?.user ? ( 
                <div>
                    <Link href="/account" className="hover:text-[#2d3748]">
                    <CircleUserRound/>
                    </Link>
                </div>
                ):(
                <div className="flex items-center gap-4"> 
                    <Link href="/login" className="hover:text-[#2d3748]">
                        <p>ログイン</p>
                    </Link>
                    <Link href="/signup" className="hover:text-[#2d3748]">
                        <p>新規登録</p>
                    </Link>
                </div>
)}
            </header> 
    )
}