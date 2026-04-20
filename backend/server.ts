import crypto from "node:crypto";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import nodemailer from "nodemailer";
import twilio from "twilio";
import { buildExamPdf } from "./examPdf";
import { buildExamDeliveryMessage, buildMessage } from "./notificationTemplates";
import { ExamDeliveryPayload, NotificationPayload } from "../src/shared/types";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = Number(process.env.PORT ?? 4000);
const publicBaseUrl = process.env.PUBLIC_BASE_URL;
const whatsappProvider = (process.env.WHATSAPP_PROVIDER ?? "wazzup").toLowerCase();
const wazzupApiUrl = process.env.WAZZUP_API_URL ?? "https://api.wazzup24.com/v3/message";
const wazzupApiKey = process.env.WAZZUP_API_KEY;
const wazzupChannelId = process.env.WAZZUP_CHANNEL_ID;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
});

const smsClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

const examPdfCache = new Map<string, ExamDeliveryPayload>();

function normalizeBrazilPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("55")) {
    return `+${digits}`;
  }

  if (digits.length >= 10) {
    return `+55${digits}`;
  }

  return `+${digits}`;
}

function normalizeChatId(phone: string) {
  return normalizeBrazilPhone(phone).replace(/\D/g, "");
}

async function sendWhatsappText(phone: string, text: string) {
  const normalizedPhone = normalizeBrazilPhone(phone);

  if (whatsappProvider === "twilio") {
    if (!smsClient || !process.env.TWILIO_WHATSAPP_FROM) {
      throw new Error("Twilio WhatsApp nao configurado.");
    }

    await smsClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${normalizedPhone}`,
      body: text,
    });
    return;
  }

  if (!wazzupApiKey || !wazzupChannelId) {
    throw new Error("Wazzup nao configurado.");
  }

  const response = await fetch(wazzupApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${wazzupApiKey}`,
    },
    body: JSON.stringify({
      channelId: wazzupChannelId,
      chatType: "whatsapp",
      chatId: normalizeChatId(phone),
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Falha no Wazzup ao enviar texto: ${body}`);
  }
}

async function sendWhatsappFile(phone: string, fileUrl: string) {
  const normalizedPhone = normalizeBrazilPhone(phone);

  if (whatsappProvider === "twilio") {
    if (!smsClient || !process.env.TWILIO_WHATSAPP_FROM) {
      throw new Error("Twilio WhatsApp nao configurado.");
    }

    await smsClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${normalizedPhone}`,
      mediaUrl: [fileUrl],
    });
    return;
  }

  if (!wazzupApiKey || !wazzupChannelId) {
    throw new Error("Wazzup nao configurado.");
  }

  const response = await fetch(wazzupApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${wazzupApiKey}`,
    },
    body: JSON.stringify({
      channelId: wazzupChannelId,
      chatType: "whatsapp",
      chatId: normalizeChatId(phone),
      contentUri: fileUrl,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Falha no Wazzup ao enviar arquivo: ${body}`);
  }
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "clinica-notifications-api" });
});

app.get("/api/exams/pdf/:token", async (req, res) => {
  const payload = examPdfCache.get(req.params.token);

  if (!payload) {
    res.status(404).json({ success: false, message: "PDF do exame nao encontrado." });
    return;
  }

  try {
    const pdfBuffer = await buildExamPdf(payload);
    const fileName = `exame-${payload.exam.examName.toLowerCase().replace(/\s+/g, "-")}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Falha ao gerar o PDF do exame.",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

app.post("/api/exams/deliver", async (req, res) => {
  const payload = req.body as ExamDeliveryPayload;
  const token = crypto.randomUUID();
  examPdfCache.set(token, payload);

  try {
    const pdfBuffer = await buildExamPdf(payload);
    const fileName = `exame-${payload.exam.examName.toLowerCase().replace(/\s+/g, "-")}.pdf`;
    const mediaUrl =
      publicBaseUrl?.replace(/\/$/, "") ? `${publicBaseUrl.replace(/\/$/, "")}/api/exams/pdf/${token}` : null;
    const message = buildExamDeliveryMessage(payload);

    if (process.env.SMTP_HOST && process.env.NOTIFICATION_EMAIL_FROM) {
      await transporter.sendMail({
        from: process.env.NOTIFICATION_EMAIL_FROM,
        to: payload.patient.email,
        subject: message.subject,
        text: message.text,
        html: message.html,
        attachments: [
          {
            filename: fileName,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });
    }

    if (mediaUrl) {
      await sendWhatsappText(payload.patient.phone, message.text);
      await sendWhatsappFile(payload.patient.phone, mediaUrl);
    }

    res.json({
      success: true,
      channels: {
        email: Boolean(process.env.SMTP_HOST),
        whatsapp:
          Boolean(mediaUrl) &&
          (whatsappProvider === "twilio"
            ? Boolean(smsClient && process.env.TWILIO_WHATSAPP_FROM)
            : Boolean(wazzupApiKey && wazzupChannelId)),
      },
      pdfUrl: mediaUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Falha ao entregar o PDF do exame.",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

app.post("/api/notifications", async (req, res) => {
  const payload = req.body as NotificationPayload;
  const message = buildMessage(payload);

  try {
    if (process.env.SMTP_HOST && process.env.NOTIFICATION_EMAIL_FROM) {
      await transporter.sendMail({
        from: process.env.NOTIFICATION_EMAIL_FROM,
        to: payload.patientEmail,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
    }

    if (
      (whatsappProvider === "twilio" && smsClient && process.env.TWILIO_WHATSAPP_FROM) ||
      (whatsappProvider === "wazzup" && wazzupApiKey && wazzupChannelId)
    ) {
      await sendWhatsappText(payload.patientPhone, message.text);
    }

    res.json({
      success: true,
      channels: {
        email: Boolean(process.env.SMTP_HOST),
        whatsapp:
          whatsappProvider === "twilio"
            ? Boolean(smsClient && process.env.TWILIO_WHATSAPP_FROM)
            : Boolean(wazzupApiKey && wazzupChannelId),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Falha ao enviar notificacoes.",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

app.listen(port, () => {
  console.log(`Notification API ativa na porta ${port}`);
});
