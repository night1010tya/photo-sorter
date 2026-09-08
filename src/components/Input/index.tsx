import { InputProps } from "./type";

export default function Input ({
    label, id, name, type, value, error,size,onChange,placeholder
}:InputProps) {
    const sizeClass = {
        medium: "h-[30px] border p-[20px]"
    }
    
    return(
        <div className="mb-[15px] bg-[#ffffff] ">  
            <label className="sr-only" htmlFor={id}>{label}</label>
            <input
               id={id}
               name={name}
               type={type}
               value={value}
               onChange={onChange}
               placeholder={placeholder}
               className={`w-full ${sizeClass[size]}  ${error ? "border-red-500" : "border-gray-300"}`}
            />
            {error && <p className="text-[8px] text-red-500">{error}</p>}
        </div>
    )
}