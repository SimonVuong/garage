"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { extractListingUuid } from "@/app/lib/extractListingUuid";
import { isValidEmail } from "@/app/lib/isValidEmail";
import { downloadListingInvoice, emailListingInvoice } from "@/app/services/frontend/listings/invoice";
import { Alert } from "@/app/uiKit/Alert";
import { Button } from "@/app/uiKit/Button";
import { TextField } from "@/app/uiKit/TextField";

const RATE_LIMIT_MS = 5000;
const ALERT_AUTO_DISMISS_MS = 5000;

type AlertMessage =
  | { id: string; severity: "success"; email: string }
  | { id: string; severity: "warning"; body: string };

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export default function HomePage() {
  const [listingUrl, setListingUrl] = useState("");
  const [emailMode, setEmailMode] = useState(false);
  const [email, setEmail] = useState("");
  const [messages, setMessages] = useState<AlertMessage[]>([]);
  const [invoiceDownloading, setInvoiceDownloading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const lastSuccessSendByEmail = useRef<Record<string, number>>({});
  const dismissTimersRef = useRef<Map<string, number>>(new Map());

  const listingId = useMemo(() => extractListingUuid(listingUrl), [listingUrl]);

  const scheduleDismiss = useCallback((id: string) => {
    const existing = dismissTimersRef.current.get(id);
    if (existing !== undefined) clearTimeout(existing);
    dismissTimersRef.current.set(
      id,
      window.setTimeout(() => {
        dismissTimersRef.current.delete(id);
        setMessages((prev) => prev.filter((m) => m.id !== id));
      }, ALERT_AUTO_DISMISS_MS),
    );
  }, []);

  useEffect(() => {
    return () => {
      dismissTimersRef.current.forEach((t) => clearTimeout(t));
      dismissTimersRef.current.clear();
    };
  }, []);

  const handleListingUrlChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setListingUrl(e.target.value);
  }, []);

  const handleEmailChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

  const handleOpenEmailMode = useCallback(() => {
    setEmailMode(true);
  }, []);

  const handleCancelEmailMode = useCallback(() => {
    setEmailMode(false);
    setEmail("");
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = email.trim();
    if (!isValidEmail(trimmed) || !listingId || emailSending) return;

    const key = trimmed.toLowerCase();
    const now = Date.now();
    const last = lastSuccessSendByEmail.current[key];

    if (last !== undefined && now - last < RATE_LIMIT_MS) {
      const warningId = newId();
      setMessages((prev) => [
        {
          id: warningId,
          severity: "warning",
          body: "You're sending too quickly. Please wait a few seconds before trying again.",
        },
        ...prev,
      ]);
      scheduleDismiss(warningId);
      return;
    }

    setEmailSending(true);
    try {
      const result = await emailListingInvoice({ listingId, to: trimmed });
      if (!result.ok) {
        const warningId = newId();
        setMessages((prev) => [
          { id: warningId, severity: "warning", body: result.message },
          ...prev,
        ]);
        scheduleDismiss(warningId);
        return;
      }

      lastSuccessSendByEmail.current[key] = Date.now();
      const successId = newId();
      setMessages((prev) => {
        for (const m of prev) {
          if (m.severity === "warning") {
            const t = dismissTimersRef.current.get(m.id);
            if (t !== undefined) {
              clearTimeout(t);
              dismissTimersRef.current.delete(m.id);
            }
          }
        }
        return [
          {
            id: successId,
            severity: "success",
            email: trimmed,
          },
          ...prev.filter((m) => m.severity !== "warning"),
        ];
      });
      scheduleDismiss(successId);
    } finally {
      setEmailSending(false);
    }
  }, [email, listingId, emailSending, scheduleDismiss]);

  const handleDownloadInvoice = useCallback(async () => {
    if (!listingId || invoiceDownloading) return;

    setInvoiceDownloading(true);
    try {
      const result = await downloadListingInvoice(listingId);
      if (result.ok) return;

      const warningId = newId();
      setMessages((prev) => [
        { id: warningId, severity: "warning", body: result.message },
        ...prev,
      ]);
      scheduleDismiss(warningId);
    } finally {
      setInvoiceDownloading(false);
    }
  }, [listingId, invoiceDownloading, scheduleDismiss]);

  return (
    <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-white px-4">
      <div className="min-h-0 w-full shrink-0 flex-[0.4_1_0%]" aria-hidden />
      <div className="mx-auto flex min-h-0 w-full max-w-[600px] flex-1 flex-col items-center gap-8">
        <Image
          src="/garage-logo.svg"
          alt="Garage"
          width={707}
          height={187}
          className="h-[52px] w-auto max-w-[min(280px,70vw)] object-contain"
          priority
        />

        <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-4">
          <TextField
            type="url"
            name="listing"
            value={listingUrl}
            onChange={handleListingUrlChange}
            placeholder="Paste a Garage fire truck listing URL"
            autoComplete="off"
          />

          {emailMode ? (
            <div className="flex w-full items-stretch gap-3">
              <TextField
                type="email"
                name="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Email address"
                className="max-w-none sm:flex-1"
                autoComplete="email"
              />
              <Button
                variant="contained"
                color="dark"
                className="shrink-0 sm:min-w-[120px]"
                disabled={!isValidEmail(email) || !listingId || emailSending}
                onClick={handleSend}
                aria-busy={emailSending}
              >
                {emailSending ? "Sending…" : "Send"}
              </Button>
            </div>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="contained"
              color="primary"
              onClick={handleDownloadInvoice}
              disabled={!listingId || invoiceDownloading}
              aria-busy={invoiceDownloading}
            >
              {invoiceDownloading ? "Preparing…" : "Download invoice"}
            </Button>
            {!emailMode ? (
              <Button variant="outlined" onClick={handleOpenEmailMode}>
                Email invoice
              </Button>
            ) : (
              <Button variant="outlined" onClick={handleCancelEmailMode}>
                Cancel
              </Button>
            )}
          </div>

          <div
            className="mt-4 flex min-h-0 w-full max-w-[584px] flex-1 flex-col gap-3 overflow-hidden"
          >
            {messages.map((m) =>
              m.severity === "success" ? (
                <Alert key={m.id} severity="success">
                  Invoice sent to <strong className="font-bold">{m.email}</strong>.
                </Alert>
              ) : (
                <Alert key={m.id} severity="warning">
                  {m.body}
                </Alert>
              ),
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
