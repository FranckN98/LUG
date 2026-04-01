export type FormPayload = {
  type: 'contact' | 'join' | 'workshop-registration' | 'mentor-request' | 'sponsor-inquiry';
  values: Record<string, string>;
  meta: {
    consent: boolean;
    startedAt: number;
    submittedAt: number;
    honeypot: string;
  };
  captchaToken?: string;
};
