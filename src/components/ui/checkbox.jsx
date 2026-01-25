import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(checked ?? false)
    
    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked)
      }
    }, [checked])

    const handleClick = () => {
      if (disabled) return
      const newChecked = !isChecked
      setIsChecked(newChecked)
      onCheckedChange?.(newChecked)
    }

    return (
      <button
        type="button"
        role="checkbox"
        ref={ref}
        aria-checked={isChecked}
        disabled={disabled}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          isChecked && "bg-primary text-primary-foreground",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {isChecked && (
          <span className="flex items-center justify-center text-current">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
        )}
      </button>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
