import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const SelectContext = React.createContext({
  value: "",
  onValueChange: () => {},
  open: false,
  setOpen: () => {},
})

const Select = ({ children, value, onValueChange, defaultValue = "", open: controlledOpen, onOpenChange }) => {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  
  const isControlled = value !== undefined
  const isOpenControlled = controlledOpen !== undefined
  
  const currentValue = isControlled ? value : uncontrolledValue
  const open = isOpenControlled ? controlledOpen : uncontrolledOpen

  const handleValueChange = React.useCallback(
    (newValue) => {
      if (!isControlled) {
        setUncontrolledValue(newValue)
      }
      onValueChange?.(newValue)
    },
    [isControlled, onValueChange]
  )

  const setOpen = React.useCallback(
    (newOpen) => {
      if (!isOpenControlled) {
        setUncontrolledOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    },
    [isOpenControlled, onOpenChange]
  )

  return (
    <SelectContext.Provider value={{ value: currentValue, onValueChange: handleValueChange, open, setOpen }}>
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  )
}

const useSelect = () => React.useContext(SelectContext)

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { open, setOpen } = useSelect()

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
        className
      )}
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      {...props}
    >
      {children}
      <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", open && "rotate-180")} />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef(({ className, placeholder, ...props }, ref) => {
  const { value } = useSelect()

  return (
    <span ref={ref} className={cn("block truncate", !value && "text-muted-foreground", className)} {...props}>
      {value || placeholder}
    </span>
  )
})
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => {
  const { open, setOpen } = useSelect()
  const contentRef = React.useRef(null)

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (contentRef.current && !contentRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false)
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      ref={(node) => {
        contentRef.current = node
        if (typeof ref === "function") ref(node)
        else if (ref) ref.current = node
      }}
      className={cn(
        "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ className, children, value, disabled, ...props }, ref) => {
  const { value: selectedValue, onValueChange, setOpen } = useSelect()
  const isSelected = selectedValue === value

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        isSelected && "bg-accent text-accent-foreground",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      onClick={() => {
        if (!disabled) {
          onValueChange(value)
          setOpen(false)
        }
      }}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      <span>{children}</span>
    </div>
  )
})
SelectItem.displayName = "SelectItem"

const SelectGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-1", className)} {...props} />
))
SelectGroup.displayName = "SelectGroup"

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)} {...props} />
))
SelectLabel.displayName = "SelectLabel"

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
))
SelectSeparator.displayName = "SelectSeparator"

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
}
