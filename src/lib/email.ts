import mustache from "mustache";
import { readFileSync } from "fs";
import path from "path";

// Simple wrapper to send a welcome email with magic link.
// In a real project this would call an external email provider (e.g., SendGrid, Postmark).
// Here we just log the email content – replace with actual send logic as needed.
export async function sendWelcomeEmail(email: string, magicLink: string, planType: string) {
  const templatePath = path.join(process.cwd(), "src/templates/welcome_email.html");
  const template = readFileSync(templatePath, "utf-8");
  const html = mustache.render(template, { email, magicLink, planType });

  // Placeholder: log the email. Replace with sendgrid.send({to: email, html}) etc.
  console.log("[Welcome Email] to:", email);
  console.log(html);
  // Return a promise for compatibility.
  return Promise.resolve();
}

