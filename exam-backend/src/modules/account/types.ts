export interface NotificationPrefsDTO {
  email: boolean;
  sms: boolean;
  push: boolean;
}

export interface AccountPreferencesDTO {
  notifications: NotificationPrefsDTO;
  language: string;
  timezone: string | null;
}

export interface ExportJobDTO {
  url: string;
  expiresAt: string;
}
