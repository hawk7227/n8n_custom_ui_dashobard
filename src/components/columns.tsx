"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
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

export const columns: ColumnDef<ContactData>[] = [
  {
    accessorKey: "Name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const name = row.getValue("Name") as string
      return (
        <div className="font-medium">
          {name || "N/A"}
        </div>
      )
    },
  },
  {
    accessorKey: "Email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const email = row.getValue("Email") as string
      return (
        <div className="text-sm">
          {email || "N/A"}
        </div>
      )
    },
  },
  {
    accessorKey: "Phone",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Phone
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const phone = row.getValue("Phone") as string
      return (
        <div className="text-sm">
          {phone || "N/A"}
        </div>
      )
    },
  },
  {
    accessorKey: "Status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.getValue("Status") as string
      return (
        <div className="text-sm">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status === "Active" ? "bg-green-100 text-green-800" :
            status === "Inactive" ? "bg-red-100 text-red-800" :
            "bg-gray-100 text-gray-800"
          }`}>
            {status || "Unknown"}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "Audience Type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Audience Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const audienceType = row.getValue("Audience Type") as string
      return (
        <div className="text-sm">
          {audienceType || "N/A"}
        </div>
      )
    },
  },
  {
    accessorKey: "Last Contacted",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Last Contacted
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const lastContacted = row.getValue("Last Contacted") as string
      return (
        <div className="text-sm">
          {lastContacted || "N/A"}
        </div>
      )
    },
  },
  {
    accessorKey: "LinkedIn URL",
    header: "LinkedIn",
    cell: ({ row }) => {
      const linkedinUrl = row.getValue("LinkedIn URL") as string
      return (
        <div className="text-sm">
          {linkedinUrl ? (
            <a 
              href={linkedinUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              View Profile
            </a>
          ) : (
            "N/A"
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "AI Persona",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          AI Persona
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const aiPersona = row.getValue("AI Persona") as string
      return (
        <div className="text-sm max-w-xs truncate" title={aiPersona}>
          {aiPersona || "N/A"}
        </div>
      )
    },
  },
  {
    accessorKey: "Recommended Ingredient",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Recommended Ingredient
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const ingredient = row.getValue("Recommended Ingredient") as string
      return (
        <div className="text-sm max-w-xs truncate" title={ingredient}>
          {ingredient || "N/A"}
        </div>
      )
    },
  },
  {
    accessorKey: "Pricing Tier Offered",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Pricing Tier
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const pricingTier = row.getValue("Pricing Tier Offered") as number
      return (
        <div className="text-sm">
          {pricingTier ? `$${pricingTier}` : "N/A"}
        </div>
      )
    },
  },
  {
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(contact.Email as string)}>
              Copy email
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(contact.Phone as string)}>
              Copy phone
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(contact["LinkedIn URL"] as string, '_blank')}>
              View LinkedIn
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 