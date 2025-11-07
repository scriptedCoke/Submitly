"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  Upload,
  Download,
  FileText,
  Folder,
  ImageIcon,
  Video,
  Music,
  Code,
  Mail,
  Send,
  Inbox,
  Crown,
} from "lucide-react"
import { UpgradeDialog } from "./upgrade-dialog"

const ICONS = [
  { name: "sparkles", icon: Sparkles, label: "Sparkles" },
  { name: "upload", icon: Upload, label: "Upload" },
  { name: "download", icon: Download, label: "Download" },
  { name: "file-text", icon: FileText, label: "Document" },
  { name: "folder", icon: Folder, label: "Folder" },
  { name: "image", icon: ImageIcon, label: "Image" },
  { name: "video", icon: Video, label: "Video" },
  { name: "music", icon: Music, label: "Music" },
  { name: "code", icon: Code, label: "Code" },
  { name: "mail", icon: Mail, label: "Mail" },
  { name: "send", icon: Send, label: "Send" },
  { name: "inbox", icon: Inbox, label: "Inbox" },
]

export function IconPicker({
  value,
  onChange,
  subscriptionTier,
}: {
  value: string
  onChange: (icon: string) => void
  subscriptionTier: string
}) {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const isUnlimited = subscriptionTier === "unlimited"

  const handleIconClick = (iconName: string) => {
    if (!isUnlimited) {
      setShowUpgradeDialog(true)
      return
    }
    onChange(iconName)
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Icon</Label>
          {!isUnlimited && (
            <Badge variant="outline" className="gap-1 cursor-pointer" onClick={() => setShowUpgradeDialog(true)}>
              <Crown className="h-3 w-3" />
              Unlimited
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-6 gap-2">
          {ICONS.map(({ name, icon: Icon, label }) => (
            <Button
              key={name}
              type="button"
              variant={value === name ? "default" : "outline"}
              size="sm"
              className="h-12 w-full flex flex-col gap-1 p-2"
              onClick={() => handleIconClick(name)}
              disabled={!isUnlimited}
              title={label}
            >
              <Icon className="h-5 w-5" />
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {isUnlimited
            ? "Choose an icon to display on your submission page"
            : "Custom icons are available with Unlimited plan"}
        </p>
      </div>

      <UpgradeDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog} />
    </>
  )
}
