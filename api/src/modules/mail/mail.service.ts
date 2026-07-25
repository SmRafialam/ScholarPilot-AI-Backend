import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

/**
 * Sends transactional email. If SMTP is not configured (dev), it logs the
 * message instead of sending — so no paid email provider is required locally.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter | null;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    this.from =
      this.config.get<string>('MAIL_FROM') ??
      'ScholarPilot AI <noreply@scholarpilot.ai>';

    const host = this.config.get<string>('SMTP_HOST');
    this.transporter = host
      ? nodemailer.createTransport({
          host,
          port: Number(this.config.get('SMTP_PORT') ?? 587),
          auth: {
            user: this.config.get<string>('SMTP_USER'),
            pass: this.config.get<string>('SMTP_PASS'),
          },
        })
      : null;
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`[DEV MAIL] to=${to} | ${subject}\n${html}`);
      return;
    }
    await this.transporter.sendMail({ from: this.from, to, subject, html });
  }

  async sendEmailVerification(to: string, link: string): Promise<void> {
    await this.send(
      to,
      'Verify your ScholarPilot AI email',
      `<p>Welcome to ScholarPilot AI!</p><p>Verify your email: <a href="${link}">${link}</a></p>`,
    );
  }

  async sendPasswordReset(to: string, link: string): Promise<void> {
    await this.send(
      to,
      'Reset your ScholarPilot AI password',
      `<p>Reset your password: <a href="${link}">${link}</a></p><p>This link expires in 1 hour.</p>`,
    );
  }
}
