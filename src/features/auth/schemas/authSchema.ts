import { z } from "zod";

export const patientRegistrationSchema = z.object({
  fullName: z.string().min(3, "Informe o nome completo."),
  cpf: z.string().min(11, "CPF invalido."),
  birthDate: z.string().min(1, "Data de nascimento obrigatoria."),
  phone: z.string().min(10, "Telefone invalido."),
  email: z.string().email("Email invalido."),
  address: z.string().min(8, "Endereco obrigatorio."),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
  confirmPassword: z.string().min(6, "Confirme sua senha."),
}).refine((values) => values.password === values.confirmPassword, {
  message: "As senhas precisam ser iguais.",
  path: ["confirmPassword"],
});

export type PatientRegistrationForm = z.infer<typeof patientRegistrationSchema>;

export const loginSchema = z.object({
  email: z.string().email("Informe um email valido."),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
});

export type LoginForm = z.infer<typeof loginSchema>;
