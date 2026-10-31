"use client";

import React, { useState } from "react";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("Message sent! Our support team will get back to you shortly.");
    }, 800);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <MarketingNavbar />
      <main className="flex-1 py-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-xl">
          <div className="text-center space-y-3 mb-10">
            <h1 className="text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              Get in Touch
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Have questions or feedback? We are here to help.
            </p>
          </div>

          <Card className="p-8">
            {submitted ? (
              <div className="text-center py-8 space-y-4">
                <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto" />
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Message Delivered</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Thank you for reaching out. We typically reply within 2–4 hours.
                </p>
                <Button variant="outline" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Your Name
                  </label>
                  <Input required placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Email Address
                  </label>
                  <Input type="email" required placeholder="jane@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Subject
                  </label>
                  <Input required placeholder="Partnership inquiry / Support question" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Message
                  </label>
                  <Textarea required placeholder="How can we assist you today?" rows={4} />
                </div>
                <Button type="submit" className="w-full rounded-xl" isLoading={loading}>
                  <Send className="h-4 w-4 mr-2" />
                  <span>Send Message</span>
                </Button>
              </form>
            )}
          </Card>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}

