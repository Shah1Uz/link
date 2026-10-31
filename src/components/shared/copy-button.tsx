"use client";

import React, { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface CopyButtonProps extends Omit<ButtonProps, "onClick"> {
  text: string;
  successMessage?: string;
}

export function CopyButton({
  text,
  successMessage = "Copied to clipboard!",
  className,
  variant = "outline",
  size = "sm",
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(successMessage);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleCopy}
      {...props}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-1 text-emerald-500" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-1" />
          <span>Copy</span>
        </>
      )}
    </Button>
  );
}

