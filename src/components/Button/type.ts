import React from "react"

export type ButtonProps = {
    children:React.ReactNode;
    type?: "button" | "submit";
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
    variant?: "primary" | "secondary";
}