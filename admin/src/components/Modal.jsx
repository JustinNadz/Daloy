import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'
import { cn } from "@/lib/utils"

/**
 * Modal - Reusable modal/dialog component
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is open
 * @param {Function} props.onOpenChange - Callback when open state changes
 * @param {string} props.title - Modal title
 * @param {string} props.description - Modal description
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.variant - Modal variant: 'default', 'warning', 'danger', 'success', 'info'
 * @param {React.ReactNode} props.footer - Custom footer content
 * @param {string} props.confirmText - Text for confirm button
 * @param {string} props.cancelText - Text for cancel button
 * @param {Function} props.onConfirm - Callback when confirm is clicked
 * @param {Function} props.onCancel - Callback when cancel is clicked
 * @param {boolean} props.loading - Loading state for confirm button
 * @param {boolean} props.showFooter - Whether to show footer (default: true)
 * @param {string} props.size - Modal size: 'sm', 'default', 'lg', 'xl'
 */
const Modal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  variant = 'default',
  footer,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  showFooter = true,
  size = 'default',
}) => {
  const handleCancel = () => {
    onCancel?.()
    onOpenChange?.(false)
  }

  const handleConfirm = async () => {
    await onConfirm?.()
    if (!loading) {
      onOpenChange?.(false)
    }
  }

  const getVariantIcon = () => {
    switch (variant) {
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />
      case 'danger':
        return <XCircle className="h-6 w-6 text-red-500" />
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'info':
        return <Info className="h-6 w-6 text-blue-500" />
      default:
        return null
    }
  }

  const getConfirmButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const sizeClasses = {
    sm: 'max-w-sm',
    default: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(sizeClasses[size])}>
        <DialogHeader>
          <div className="flex items-start gap-4">
            {getVariantIcon()}
            <div className="flex-1">
              <DialogTitle>{title}</DialogTitle>
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {children && <div className="py-4">{children}</div>}

        {showFooter && (
          <DialogFooter>
            {footer || (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  {cancelText}
                </Button>
                <Button
                  variant={getConfirmButtonVariant()}
                  onClick={handleConfirm}
                  disabled={loading}
                >
                  {loading && (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  )}
                  {confirmText}
                </Button>
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

/**
 * ConfirmModal - Convenience wrapper for confirmation dialogs
 */
export const ConfirmModal = ({
  open,
  onOpenChange,
  title = "Are you sure?",
  description,
  onConfirm,
  loading,
  variant = "warning",
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => (
  <Modal
    open={open}
    onOpenChange={onOpenChange}
    title={title}
    description={description}
    variant={variant}
    onConfirm={onConfirm}
    loading={loading}
    confirmText={confirmText}
    cancelText={cancelText}
  />
)

/**
 * DeleteModal - Convenience wrapper for delete confirmation dialogs
 */
export const DeleteModal = ({
  open,
  onOpenChange,
  title = "Delete Item",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName,
  onConfirm,
  loading,
}) => (
  <Modal
    open={open}
    onOpenChange={onOpenChange}
    title={title}
    description={itemName ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.` : description}
    variant="danger"
    onConfirm={onConfirm}
    loading={loading}
    confirmText="Delete"
    cancelText="Cancel"
  />
)

export default Modal
