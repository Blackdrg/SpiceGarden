import { IsString, IsOptional, IsNumber, IsBoolean, IsDateString, IsObject, IsIn } from 'class-validator';

export class QueueNotificationDto {
  recipientId!: string;

  @IsIn(['user', 'device', 'email', 'phone'])
  recipientType!: 'user' | 'device' | 'email' | 'phone';

  @IsIn(['push', 'sms', 'email', 'apns'])
  notificationType!: 'push' | 'sms' | 'email' | 'apns';

  payload!: Record<string, any>;

  @IsIn(['fcm', 'twilio', 'sendgrid', 'apns'])
  provider!: 'fcm' | 'twilio' | 'sendgrid' | 'apns';

  @IsOptional()
  maxAttempts?: number;

  @IsOptional()
  callbackUrl?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
