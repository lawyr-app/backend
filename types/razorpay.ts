interface Customer {
  contact: string;
  email: string;
}

interface Notes {
  [key: string]: string;
}

interface Notify {
  email: boolean;
  sms: boolean;
}

interface OrderEntity {
  amount: number;
  amount_due: number;
  amount_paid: number;
  attempts: number;
  created_at: number;
  currency: string;
  entity: "order";
  id: string;
  notes: Notes;
  offer_id: string | null;
  offers: string[];
  receipt: string;
  status: string;
}

interface AcquirerData {
  bank_transaction_id: string;
}

interface PaymentEntity {
  acquirer_data: AcquirerData;
  amount: number;
  amount_refunded: number;
  amount_transferred: number;
  bank: string;
  base_amount: number;
  captured: boolean;
  card_id: string | null;
  contact: string;
  created_at: number;
  currency: string;
  description: string;
  email: string;
  entity: "payment";
  error_code: string | null;
  error_description: string | null;
  error_reason: string | null;
  error_source: string | null;
  error_step: string | null;
  fee: number;
  fee_bearer: string;
  id: string;
  international: boolean;
  invoice_id: string | null;
  method: string;
  notes: any[];
  order_id: string;
  refund_status: string | null;
  status: string;
  tax: number;
  vpa: string | null;
  wallet: string | null;
}

interface PaymentLinkEntity {
  accept_partial: boolean;
  amount: number;
  amount_paid: number;
  callback_method: string;
  callback_url: string;
  cancelled_at: number;
  created_at: number;
  currency: string;
  customer: Customer;
  description: string;
  expire_by: number;
  expired_at: number;
  first_min_partial_amount: number;
  id: string;
  notes: Notes;
  notify: Notify;
  order_id: string | null;
  payments: any[] | null;
  reference_id: string;
  reminder_enable: boolean;
  reminders: { status?: string };
  short_url: string;
  source: string;
  source_id: string;
  status: string;
  updated_at: number;
  user_id: string;
}

interface Payload {
  order: {
    entity: OrderEntity | null;
  };
  payment: {
    entity: PaymentEntity | null;
  };
  payment_link: {
    entity: PaymentLinkEntity | null;
  };
}

interface PaymentEvent {
  account_id: string;
  contains: string[];
  created_at: number;
  entity: "event";
  event:
    | "payment_link.paid"
    | "payment_link.cancelled"
    | "payment_link.expired";
  payload: Payload;
}
