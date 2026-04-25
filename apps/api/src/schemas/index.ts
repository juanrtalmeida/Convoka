import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const createConvokaSchema = z.object({
  title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  date: z.string().datetime({ message: 'Data inválida' }).refine((val) => new Date(val) > new Date(), {
    message: "A data e hora do evento devem estar no futuro"
  }),
  location: z.string().optional(),
  maxParticipants: z.number().int().positive().optional(),
  allowWaitlist: z.boolean().default(false),
  requireRoles: z.boolean().default(false),
  paymentRequired: z.boolean().default(false),
  allowWaitlistPayment: z.boolean().default(false),
  allowParticipantPayment: z.boolean().default(true),
  availableRoles: z.array(z.string()).optional().default([]),
});

export const joinConvokaSchema = z.object({
  roles: z.array(z.string()).optional().default([]),
});

export const manageParticipantSchema = z.object({
  action: z.enum(['UPDATE_PAYMENT', 'MOVE_TO_WAITLIST', 'MOVE_TO_CONFIRMED', 'REMOVE']),
  hasPaid: z.boolean().optional(),
});

export const createPaymentSchema = z.object({
  participantId: z.string().uuid(),
  amount: z.number().positive(),
  method: z.string(),
  receiptUrl: z.string().url().optional(),
});

export const updatePaymentStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  adminId: z.string().uuid(), // Para validar se quem aprova tem permissão
});
