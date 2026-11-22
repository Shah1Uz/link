import { prisma } from "@/lib/prisma";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  template: "CONFIRMATION" | "WELCOME" | "NOTIFICATION" | "UNSUBSCRIBE";
  subscriberId?: string;
}

export function isEmailProviderConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith("re_"));
}

/**
 * Dispatches an email via configured provider (Resend API) or resilient BioSpace Email Engine.
 * Logs all deliveries in EmailDeliveryLog for compliance and auditing.
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { to, subject, html, template, subscriberId } = options;
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "BioSpace <newsletter@biospace.com>";

  // 1. If Resend API Key is available, dispatch via Resend REST API
  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to,
          subject,
          html,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send email via Resend");
      }

      await prisma.emailDeliveryLog.create({
        data: {
          subscriberId: subscriberId || null,
          recipientEmail: to,
          subject,
          template,
          provider: "resend",
          status: "DELIVERED",
          messageId: data.id || null,
        },
      });

      return { success: true, messageId: data.id };
    } catch (err: any) {
      console.error("Resend API delivery error:", err);
      await prisma.emailDeliveryLog.create({
        data: {
          subscriberId: subscriberId || null,
          recipientEmail: to,
          subject,
          template,
          provider: "resend",
          status: "FAILED",
          error: err.message,
        },
      });

      return { success: false, error: err.message };
    }
  }

  // 2. Built-in BioSpace Email Engine (Simulation & Audit Logging in development/sandbox)
  const simulatedMessageId = `msg_sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  await prisma.emailDeliveryLog.create({
    data: {
      subscriberId: subscriberId || null,
      recipientEmail: to,
      subject,
      template,
      provider: "biospace_mail",
      status: "SIMULATED",
      messageId: simulatedMessageId,
    },
  });

  return { success: true, messageId: simulatedMessageId };
}

/**
 * 1. Double Opt-In Confirmation Email
 */
export async function sendConfirmationEmail(params: {
  to: string;
  creatorName: string;
  profileUsername: string;
  verificationToken: string;
  subscriberId: string;
  appUrl?: string;
}) {
  const { to, creatorName, profileUsername, verificationToken, subscriberId } = params;
  const baseUrl = params.appUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const confirmUrl = `${baseUrl}/api/subscribers/confirm?token=${verificationToken}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirm Your Subscription</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background-color: #18181b; padding: 28px 32px; text-align: center;">
      <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">Bio<span style="color: #10b981;">Space</span></h2>
    </div>
    <div style="padding: 32px;">
      <h1 style="color: #18181b; font-size: 22px; font-weight: 800; margin-top: 0; line-height: 1.3;">
        Confirm your subscription to ${creatorName}'s newsletter
      </h1>
      <p style="color: #52525b; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        Thank you for requesting to subscribe to updates from <strong>@${profileUsername}</strong> on BioSpace. To ensure you requested this subscription, please verify your email address below.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${confirmUrl}" style="background-color: #10b981; color: #000000; font-weight: 800; font-size: 15px; text-decoration: none; padding: 14px 28px; border-radius: 12px; display: inline-block; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);">
          Confirm Subscription &rarr;
        </a>
      </div>
      <p style="color: #71717a; font-size: 12px; line-height: 1.5; margin-bottom: 0;">
        Or copy and paste this link into your browser:<br>
        <a href="${confirmUrl}" style="color: #10b981; word-break: break-all;">${confirmUrl}</a>
      </p>
      <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #f4f4f5; text-align: center;">
        <p style="color: #a1a1aa; font-size: 11px; margin: 0;">
          This link will expire in 24 hours. If you did not make this request, you can safely ignore this email.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

  return sendEmail({
    to,
    subject: `Action Required: Confirm your subscription to ${creatorName}'s newsletter`,
    html,
    template: "CONFIRMATION",
    subscriberId,
  });
}

/**
 * 2. Welcome Email Upon Double Opt-In Confirmation
 */
export async function sendWelcomeEmail(params: {
  to: string;
  creatorName: string;
  profileUsername: string;
  unsubscribeToken: string;
  subscriberId: string;
  appUrl?: string;
}) {
  const { to, creatorName, profileUsername, unsubscribeToken, subscriberId } = params;
  const baseUrl = params.appUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const unsubscribeUrl = `${baseUrl}/api/subscribers/unsubscribe?token=${unsubscribeToken}`;
  const profileUrl = `${baseUrl}/${profileUsername}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to the Community</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background-color: #18181b; padding: 28px 32px; text-align: center;">
      <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">Bio<span style="color: #10b981;">Space</span></h2>
    </div>
    <div style="padding: 32px;">
      <h1 style="color: #18181b; font-size: 22px; font-weight: 800; margin-top: 0;">
        You're subscribed to ${creatorName}! 🎉
      </h1>
      <p style="color: #52525b; font-size: 14px; line-height: 1.6;">
        Your email has been confirmed. You will now receive exclusive updates, articles, new product releases, and behind-the-scenes insights directly from <strong>${creatorName}</strong>.
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${profileUrl}" style="background-color: #18181b; color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 12px; display: inline-block;">
          Visit ${creatorName}'s BioSpace Profile &rarr;
        </a>
      </div>
      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f4f4f5; text-align: center;">
        <p style="color: #a1a1aa; font-size: 11px; margin: 0;">
          Sent by BioSpace for ${creatorName}. You can <a href="${unsubscribeUrl}" style="color: #71717a; text-decoration: underline;">unsubscribe at any time</a> with 1-click.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

  return sendEmail({
    to,
    subject: `You're subscribed! Welcome to ${creatorName}'s newsletter`,
    html,
    template: "WELCOME",
    subscriberId,
  });
}

/**
 * 3. Unsubscribe Confirmation Email
 */
export async function sendUnsubscribeConfirmationEmail(params: {
  to: string;
  creatorName: string;
  subscriberId?: string;
}) {
  const { to, creatorName, subscriberId } = params;

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
  <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7; padding: 32px; text-align: center;">
    <h2 style="color: #18181b; margin-top: 0;">You have been unsubscribed</h2>
    <p style="color: #52525b; font-size: 14px; line-height: 1.5;">
      Your email (${to}) has been successfully removed from ${creatorName}'s newsletter list. You will not receive further emails from this list.
    </p>
  </div>
</body>
</html>
`;

  return sendEmail({
    to,
    subject: `You have unsubscribed from ${creatorName}`,
    html,
    template: "UNSUBSCRIBE",
    subscriberId,
  });
}

/**
 * 4. Creator Real-Time Notification Email
 */
export async function sendCreatorNotificationEmail(params: {
  creatorEmail: string;
  creatorName: string;
  subscriberEmail: string;
  profileUsername: string;
}) {
  const { creatorEmail, creatorName, subscriberEmail, profileUsername } = params;

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
  <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7; padding: 32px;">
    <h2 style="color: #18181b; margin-top: 0;">New Subscriber Alert! 🚀</h2>
    <p style="color: #52525b; font-size: 14px; line-height: 1.5;">
      Hello ${creatorName},<br><br>
      A new member has subscribed to your newsletter on <strong>@${profileUsername}</strong>:
    </p>
    <div style="background: #f4f4f5; border-radius: 10px; padding: 12px; font-weight: bold; font-family: monospace; color: #10b981;">
      ${subscriberEmail}
    </div>
  </div>
</body>
</html>
`;

  return sendEmail({
    to: creatorEmail,
    subject: `New Subscriber: ${subscriberEmail} joined your list!`,
    html,
    template: "NOTIFICATION",
  });
}

