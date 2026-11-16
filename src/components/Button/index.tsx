import { ButtonProps } from "./type";

export default function Button({
  children,
  type = "button",
  onClick,
  disabled,
  variant = "primary",
  isLoading = false,
  loadingText = "処理中...",
}: ButtonProps) {
  const variantClass = {
    primary:
      "block p-3 w-full items-center justify-center gap-2 rounded-2xl bg-[#2C3F55] text-white shadow-sm font-extrabold hover:bg-black/60 active:scale-95",
    secondary:
      "w-full h-[100px] bg-white/80 text-[#2C3F55] rounded-xl hover:bg-yellow-500/30 font-semibold",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`flex flex-col items-center justify-center gap-2
                             disabled:opacity-50 disabled:cursor-not-allowed
                            ${variantClass[variant]}`}
    >
      {isLoading ? `⟳ ${loadingText}` : children}
    </button>
  );
}
