import { z } from "zod";

export const DOMAIN_STATUSES = [
  "PENDING",
  "VERIFYING",
  "VERIFIED",
  "PROVISIONING_SSL",
  "ACTIVE",
  "FAILED",
  "SUSPENDED",
] as const;

export const DomainStatusEnum = z.enum(DOMAIN_STATUSES);

export const RESERVED_DOMAINS = [
  "biospace.com",
  "www.biospace.com",
  "app.biospace.com",
  "api.biospace.com",
  "admin.biospace.com",
  "cname.biospace.com",
  "custom-domain.biospace.com",
  "localhost",
  "127.0.0.1",
  "vercel.app",
  "now.sh",
];

export function normalizeDomain(raw: string): string {
  let cleaned = raw.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//i, "");
  cleaned = cleaned.replace(/\/.*$/, "");
  cleaned = cleaned.replace(/:\d+$/, "");
  return cleaned;
}

export function isValidHostname(domain: string): boolean {
  if (!domain || domain.length > 253) return false;
  // Standard RFC 1035 FQDN check
  const fqdnRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
  if (!fqdnRegex.test(domain)) return false;

  const normalized = normalizeDomain(domain);
  return !RESERVED_DOMAINS.some(
    (reserved) => normalized === reserved || normalized.endsWith(`.${reserved}`)
  );
}

export function isApexDomain(domain: string): boolean {
  const parts = domain.split(".");
  return parts.length === 2;
}

export const connectDomainSchema = z.object({
  domain: z
    .string()
    .min(3, "Domain name is too short")
    .max(253, "Domain name cannot exceed 253 characters")
    .transform(normalizeDomain)
    .refine(isValidHostname, {
      message: "Please enter a valid custom domain (e.g. links.yourdomain.com or yourbrand.me).",
    }),
});

export const verifyDomainSchema = z.object({
  domainId: z.string().min(1, "Domain ID is required"),
});

export const removeDomainSchema = z.object({
  domainId: z.string().min(1, "Domain ID is required"),
});

export const adminDomainActionSchema = z.object({
  domainId: z.string().min(1, "Domain ID is required"),
  action: z.enum(["SUSPEND", "UNSUSPEND", "FORCE_VERIFY", "DELETE"]),
  reason: z.string().max(300).optional(),
});

export type ConnectDomainInput = z.infer<typeof connectDomainSchema>;
export type VerifyDomainInput = z.infer<typeof verifyDomainSchema>;
export type AdminDomainActionInput = z.infer<typeof adminDomainActionSchema>;

