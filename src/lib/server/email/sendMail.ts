import { MAIL_SMTP_HOST, MAIL_SMTP_PORT } from "@/lib/credentials";
import nodemailer from "nodemailer";
import { Attachment } from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export type TSendMailOptions = {
  smtpUserName: string;
  smtpPassword: string;
  to: string;
  subject: string;
  html: string;
  attachments?: Attachment[];
};

const sendMail = ({
  smtpUserName,
  smtpPassword,
  to,
  subject,
  html,
  attachments,
}: TSendMailOptions) =>
  new Promise((resolve, reject) => {
    try {
      const smtpConfig: SMTPTransport.Options = {
        host: MAIL_SMTP_HOST,
        port: Number(MAIL_SMTP_PORT),
        secure: MAIL_SMTP_PORT === "465",
        auth: {
          user: smtpUserName,
          pass: smtpPassword,
        },
      };
      const transporter = nodemailer.createTransport(smtpConfig);

      new Promise((resolve, reject) => {
        // verify connection configuration
        transporter.verify(function (error, success) {
          if (error) {
            reject(error);
          } else {
            resolve(success);
          }
        });
      });

      const info = new Promise((resolve, reject) => {
        // send mail
        transporter.sendMail(
          { from: smtpUserName, to, subject, html, attachments },
          (err, info) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              resolve(info);
            }
          }
        );
      });
      resolve(info);
    } catch (err: any) {
      reject(new Error("Failed to send mail: " + err.message));
    }
  });

export default sendMail;
