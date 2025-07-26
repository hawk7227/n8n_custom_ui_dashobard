"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, ExternalLink, Copy, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface ContactData {
  [key: string]: string | number | boolean
}

// Helper function to create dynamic columns
export function createDynamicColumns(data: ContactData[]): ColumnDef<ContactData>[] {
  if (!data.length) return []

  // Get all unique keys from the data
  const allKeys = new Set<string>()
  data.forEach(row => {
    Object.keys(row).forEach(key => allKeys.add(key))
  })

  // Filter out technical fields and create columns
  const skipFields = [
    'webhookUrl', 'executionMode', 'headers', 'params', 'query', 'body',
    'id', 'Id', 'createdTime'
  ]

  const columns: ColumnDef<ContactData>[] = []

  Array.from(allKeys)
    .filter(key => !skipFields.includes(key))
    .forEach(key => {
      columns.push({
        accessorKey: key,
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 lg:px-3 text-xs"
            >
              {key}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const value = row.getValue(key) as string | number | boolean
          
          // Special handling for different field types
          if (key === "LinkedIn URL" && value) {
            return (
              <div className="text-sm">
                <a 
                  href={value as string} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  View Profile
                </a>
              </div>
            )
          }

          if (key === "Status") {
            const status = value as string
            return (
              <div className="text-sm">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  status === "Active" ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400" :
                  status === "Inactive" ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {status || "Unknown"}
                </span>
              </div>
            )
          }

          if (key === "Pricing Tier Offered" && typeof value === "number") {
            return (
              <div className="text-sm font-medium text-green-600 dark:text-green-400">
                ${value}
              </div>
            )
          }

          if (key === "Tags" && Array.isArray(value)) {
            return (
              <div className="text-sm">
                <div className="flex flex-wrap gap-1">
                  {(value as string[]).map((tag, index) => (
                    <span key={index} className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary/90 text-xs px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )
          }

          // Default cell rendering
          const displayValue = value !== null && value !== undefined ? String(value) : "N/A"
          return (
            <div className="text-sm max-w-xs truncate" title={displayValue}>
              {displayValue}
            </div>
          )
        },
      })
    })

  // Add actions column
  columns.push({
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const contact = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {contact.Email && (
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(contact.Email as string)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy email
              </DropdownMenuItem>
            )}
            {contact.Phone && (
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(contact.Phone as string)}>
                <Phone className="mr-2 h-4 w-4" />
                Copy phone
              </DropdownMenuItem>
            )}
            {contact["LinkedIn URL"] && (
              <DropdownMenuItem onClick={() => window.open(contact["LinkedIn URL"] as string, '_blank')}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View LinkedIn
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  })

  return columns
} 