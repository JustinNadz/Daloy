import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

/**
 * DataTable - Reusable table component with sorting, filtering, and pagination
 * 
 * @param {Object} props
 * @param {Array} props.columns - Array of column definitions { key, label, sortable?, render? }
 * @param {Array} props.data - Array of data objects
 * @param {boolean} props.loading - Loading state
 * @param {number} props.page - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Callback when page changes
 * @param {string} props.searchPlaceholder - Placeholder text for search input
 * @param {Function} props.onSearch - Callback when search value changes
 * @param {Function} props.onRowClick - Callback when a row is clicked
 * @param {Function} props.actions - Function that returns action buttons for each row
 */
const DataTable = ({
  columns,
  data,
  loading = false,
  page = 1,
  totalPages = 1,
  onPageChange,
  searchPlaceholder = "Search...",
  onSearch,
  onRowClick,
  actions,
  emptyMessage = "No data found",
}) => {
  const [searchValue, setSearchValue] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchValue(value)
    onSearch?.(value)
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
    })
  }, [data, sortConfig])

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      {onSearch && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={handleSearch}
              className="pl-9"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>
                  {column.sortable ? (
                    <button
                      className="flex items-center font-medium hover:text-foreground"
                      onClick={() => handleSort(column.key)}
                    >
                      {column.label}
                      {getSortIcon(column.key)}
                    </button>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
              {actions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="ml-2">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, index) => (
                <TableRow
                  key={row.id || index}
                  className={onRowClick ? "cursor-pointer" : ""}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {actions(row)}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
