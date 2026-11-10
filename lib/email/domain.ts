import { Resend } from 'resend';
import { getEmailBaseWrapper } from './emailTemplates';

/** The domain e-mails are sent from. */
export const SENDING_DOMAIN = 'horwalle.com';

export interface EmailDomainStatus {
  configured: boolean;
  domain: null | {
    id: string;
    name: string;
    status: string;
    records: Array<{ record: string; name: string; type: string; value: string; priority?: number; status: string }>;
  };
  error?: string;
}

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

/** Current state of the sending domain in Resend (does not change anything). */
export async function getEmailDomainStatus(): Promise<EmailDomainStatus> {
  const resend = client();
  if (!resend) return { configured: false, domain: null };

  const list = await resend.domains.list();
  if (list.error) return { configured: true, domain: null, error: list.error.message };
  const found = (list.data?.data || []).find((d: any) => d.name === SENDING_DOMAIN);
  if (!found) return { configured: true, domain: null };

  const full = await resend.domains.get(found.id);
  if (full.error || !full.data) return { configured: true, domain: null, error: full.error?.message };
  const d: any = full.data;
  return {
    configured: true,
    domain: {
      id: d.id,
      name: d.name,
      status: d.status,
      records: (d.records || []).map((r: any) => ({
        record: r.record,
        name: r.name,
        type: r.type,
        value: r.value,
        priority: r.priority,
        status: r.status,
      })),
    },
  };
}

/** Adds the sending domain to Resend if it is not there yet. */
export async function createEmailDomain(): Promise<EmailDomainStatus> {
  const resend = client();
  if (!resend) return { configured: false, domain: null };
  const current = await getEmailDomainStatus();
  if (current.domain || current.error) return current;

  const created = await resend.domains.create({ name: SENDING_DOMAIN });
  if (created.error) return { configured: true, domain: null, error: created.error.message };
  return getEmailDomainStatus();
}

/** Asks Resend to check the DNS records now. */
export async function verifyEmailDomain(): Promise<EmailDomainStatus> {
  const resend = client();
  if (!resend) return { configured: false, domain: null };
  const current = await getEmailDomainStatus();
  if (!current.domain) return current;
  const res = await resend.domains.verify(current.domain.id);
  if (res.error) return { ...current, error: res.error.message };
  return getEmailDomainStatus();
}

export async function sendTestEmail(to: string, from: string): Promise<{ id?: string; error?: string }> {
  const resend = client();
  if (!resend) return { error: 'RESEND_API_KEY qurulmayıb.' };
  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject: 'HORWALLE — test e-poçtu',
    html: getEmailBaseWrapper(
      '<h2 style="margin:0 0 12px">E-poçt işləyir ✓</h2><p style="margin:0">Bu məktub admin paneldən göndərilən sınaqdır. Sifariş təsdiqləri və status bildirişləri də bu ünvandan gedəcək.</p>'
    ),
  });
  return error ? { error: error.message } : { id: data?.id };
}
