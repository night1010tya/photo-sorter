import { ButtonProps } from "./type";

export default function Button ({
    children,type="button",onClick,disabled,variant="primary"
    }:ButtonProps) {

        const variantClass = {
            primary:"block w-full p-3 bg-[#148ecc] text-[#ffffff] font-extrabold rounded-full hover:bg-gray-700 active:scale-95",
            secondary:"w-full h-[100px] bg-white text-black border border-black rounded-2xl hover:bg-gray-100 active:scale-95",
        }

    return(
            <button
                type={type}
                onClick={onClick}
                disabled={disabled}
                className={`flex flex-col items-center justify-center gap-2
                             disabled:opacity-50 disabled:cursor-not-allowed
                            ${variantClass[variant]}`}
            >
                {children}
            </button>
    )

}