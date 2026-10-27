import React from "react"

export type InputProps = {
    label: string;
    placeholder?: string;
    id: string;
    name: string;
    type: string;
    value: string;
    maxLength?: number;
    onChange: (e:React.ChangeEvent<HTMLInputElement>)=>void;
    error?: string;
    
    size: "medium";
}