"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Calendar, 
  Tag, 
  DollarSign,
  Brain,
  Target,
  Heart,
  Eye,
  MessageSquare,
  ExternalLink,
  Copy,
  Check
} from "lucide-react"
import { ContactData } from "./dynamic-columns"

interface ContactDetailsDialogProps {
  contact: ContactData
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactDetailsDialog({ contact, open, onOpenChange }: ContactDetailsDialogProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const getFieldIcon = (fieldName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      Name: <User className="h-4 w-4" />,
      Email: <Mail className="h-4 w-4" />,
      "Personal Email": <Mail className="h-4 w-4" />,
      Phone: <Phone className="h-4 w-4" />,
      "LinkedIn URL": <Globe className="h-4 w-4" />,
      "Last Contacted": <Calendar className="h-4 w-4" />,
      Tags: <Tag className="h-4 w-4" />,
      "Pricing Tier Offered": <DollarSign className="h-4 w-4" />,
      "AI Persona": <Brain className="h-4 w-4" />,
      "Audience Type": <Target className="h-4 w-4" />,
      "Detected Emotion": <Heart className="h-4 w-4" />,
      "Detected Intention": <Eye className="h-4 w-4" />,
      "Email Subject Content": <MessageSquare className="h-4 w-4" />,
      "Email Body Content": <MessageSquare className="h-4 w-4" />,
      "SMS Content": <MessageSquare className="h-4 w-4" />,
      "Fallback SMS Content": <MessageSquare className="h-4 w-4" />,
      "Scraped Bio": <User className="h-4 w-4" />,
      "Recommended Ingredient": <Tag className="h-4 w-4" />,
      Gender: <User className="h-4 w-4" />,
      Status: <Target className="h-4 w-4" />,
      "Loopbacks Triggered": <Target className="h-4 w-4" />,
      "Sent Image URL via Email": <ExternalLink className="h-4 w-4" />
    }
    return iconMap[fieldName] || <Tag className="h-4 w-4" />
  }

  const getFieldValue = (fieldName: string, value: any) => {
    if (value === null || value === undefined || value === "") {
      return "Not provided"
    }

    if (fieldName === "LinkedIn URL") {
      return (
        <a 
          href={value as string} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 underline flex items-center gap-2"
        >
          <ExternalLink className="h-3 w-3" />
          View LinkedIn Profile
        </a>
      )
    }

    if (fieldName === "Status") {
      return (
        <Badge variant={
          value === "Active" ? "default" : 
          value === "Inactive" ? "destructive" : 
          "secondary"
        }>
          {value}
        </Badge>
      )
    }

    if (fieldName === "Pricing Tier Offered" && typeof value === "number") {
      return <span className="font-semibold text-green-600 dark:text-green-400">${value}</span>
    }

    if (fieldName === "Tags" && Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )
    }

    if (fieldName === "Detected Emotion") {
      const emotionColors: Record<string, string> = {
        "Happy": "text-green-600 dark:text-green-400",
        "Sad": "text-blue-600 dark:text-blue-400", 
        "Angry": "text-red-600 dark:text-red-400",
        "Excited": "text-yellow-600 dark:text-yellow-400",
        "Neutral": "text-muted-foreground"
      }
      return (
        <span className={`font-medium ${emotionColors[value] || "text-muted-foreground"}`}>
          {value}
        </span>
      )
    }

    return String(value)
  }

  const isCopyableField = (fieldName: string) => {
    return ["Email", "Personal Email", "Phone", "Name"].includes(fieldName)
  }

  const fields = Object.entries(contact).filter(([key]) => 
    !['webhookUrl', 'executionMode', 'headers', 'params', 'query', 'body', 'id', 'Id', 'createdTime'].includes(key)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                {contact.Name || "Contact Details"}
              </DialogTitle>
              <p className="text-muted-foreground">
                Complete contact information and analytics
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map(([fieldName, value]) => (
            <div key={fieldName} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-muted-foreground">
                    {getFieldIcon(fieldName)}
                  </div>
                  <label className="text-sm font-semibold text-foreground">
                    {fieldName}
                  </label>
                </div>
                {isCopyableField(fieldName) && value && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(value as string, fieldName)}
                    className="h-8 w-8 p-0"
                  >
                    {copiedField === fieldName ? (
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              
              <div className="bg-muted/50 dark:bg-muted/30 rounded-lg p-4 border border-border min-h-[60px] flex items-center">
                <div className="text-sm text-foreground leading-relaxed break-words">
                  {getFieldValue(fieldName, value)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Click outside or press ESC to close
            </div>
            <div className="flex gap-2">
              {contact.Email && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(contact.Email as string, "email")}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Copy Email
                </Button>
              )}
              {contact.Phone && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(contact.Phone as string, "phone")}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Copy Phone
                </Button>
              )}
              {contact["LinkedIn URL"] && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(contact["LinkedIn URL"] as string, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View LinkedIn
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 