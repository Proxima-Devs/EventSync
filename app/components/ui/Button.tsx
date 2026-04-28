type ButtonProps = {
    label: string
    onClick?: () => void
    variant: "primary" | "secondary" | "danger" | "ghost"
    size?: "sm" | "md" | "lg"
    disabled?: boolean
    loading?: boolean
    type?: "button" | "submit" 
    
}

const variants = {
    primary:   "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger:    "bg-red-500 text-white hover:bg-red-600",
    ghost:      "bg-transparent text-blue-600 hover:bg-blue-50 border border-blue-600"

}

const sizes = {
    sm: "text-sm px-3 py-1.5",
    md: "text-base px-5 py-1.5",
    lg: "text-lg px-10 py-1.5",
}

    export default function Button({label, onClick, variant, size = "sm", type = "button"}: ButtonProps){
        return (
            <button type={type} onClick={onClick} className={`inline-flex items-center gap-2 rounded-lg font-medium transition ${variants[variant]} ${sizes[size]}`}>{label}</button>
        )
    }