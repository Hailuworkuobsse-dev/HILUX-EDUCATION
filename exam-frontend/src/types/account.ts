export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

export interface AccountPreferences {
  notifications: NotificationPreferences;
  language: string;
  timezone: string | null;
}

export interface ExportJob {
  url: string;
  expiresAt: string;
}
