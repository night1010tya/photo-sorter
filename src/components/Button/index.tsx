import { ButtonProps } from "./type";

export default function Button ({
    children,type="button",onClick,disabled,variant="primary"
    }:ButtonProps) {

        const variantClass = {
            primary:"block w-full p-3 bg-gray-500 text-[#ffffff] rounded-full hover:bg-gray-700 active:scale-95",
            secondary:"bg-white text-black border",
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