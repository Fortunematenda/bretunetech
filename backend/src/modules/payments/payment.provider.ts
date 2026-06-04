// Payment Provider Abstraction Layer
// Ready for PayFast, Ozow, or any future payment gateway

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  redirectUrl?: string;
  error?: string;
}

export interface PaymentRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

export interface PaymentProvider {
  name: string;
  initiatePayment(request: PaymentRequest): Promise<PaymentResult>;
  verifyPayment(transactionId: string): Promise<PaymentResult>;
  handleWebhook(payload: any, signature?: string): Promise<{ orderId: string; status: string }>;
}

// EFT / Manual payment (default)
export class ManualPaymentProvider implements PaymentProvider {
  name = 'EFT';

  async initiatePayment(request: PaymentRequest): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: `EFT-${request.orderNumber}`,
    };
  }

  async verifyPayment(_transactionId: string): Promise<PaymentResult> {
    return { success: true };
  }

  async handleWebhook(_payload: any): Promise<{ orderId: string; status: string }> {
    throw new Error('Manual payments do not support webhooks');
  }
}

// WhatsApp checkout (existing flow)
export class WhatsAppPaymentProvider implements PaymentProvider {
  name = 'WHATSAPP';

  async initiatePayment(request: PaymentRequest): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: `WA-${request.orderNumber}`,
    };
  }

  async verifyPayment(_transactionId: string): Promise<PaymentResult> {
    return { success: true };
  }

  async handleWebhook(_payload: any): Promise<{ orderId: string; status: string }> {
    throw new Error('WhatsApp payments do not support webhooks');
  }
}

// PayFast placeholder — implement when API keys are available
export class PayFastProvider implements PaymentProvider {
  name = 'PAYFAST';
  private merchantId: string;
  private merchantKey: string;
  private passphrase: string;
  private sandbox: boolean;

  constructor() {
    this.merchantId = process.env.PAYFAST_MERCHANT_ID || '';
    this.merchantKey = process.env.PAYFAST_MERCHANT_KEY || '';
    this.passphrase = process.env.PAYFAST_PASSPHRASE || '';
    this.sandbox = process.env.PAYFAST_SANDBOX === 'true';
  }

  private get baseUrl() {
    return this.sandbox ? 'https://sandbox.payfast.co.za' : 'https://www.payfast.co.za';
  }

  async initiatePayment(request: PaymentRequest): Promise<PaymentResult> {
    // TODO: Generate PayFast signature and redirect URL
    // For now, return placeholder
    const params = new URLSearchParams({
      merchant_id: this.merchantId,
      merchant_key: this.merchantKey,
      amount: request.amount.toFixed(2),
      item_name: request.description,
      return_url: request.returnUrl,
      cancel_url: request.cancelUrl,
      notify_url: request.notifyUrl,
      email_address: request.customerEmail,
      m_payment_id: request.orderId,
    });

    return {
      success: true,
      redirectUrl: `${this.baseUrl}/eng/process?${params.toString()}`,
      transactionId: `PF-${request.orderNumber}`,
    };
  }

  async verifyPayment(_transactionId: string): Promise<PaymentResult> {
    // TODO: Verify with PayFast API
    return { success: true };
  }

  async handleWebhook(payload: any, _signature?: string): Promise<{ orderId: string; status: string }> {
    // TODO: Validate PayFast ITN signature
    return {
      orderId: payload.m_payment_id,
      status: payload.payment_status === 'COMPLETE' ? 'PAID' : 'PENDING',
    };
  }
}

// Ozow placeholder — implement when API keys are available
export class OzowProvider implements PaymentProvider {
  name = 'OZOW';

  async initiatePayment(request: PaymentRequest): Promise<PaymentResult> {
    // TODO: Implement Ozow API integration
    return {
      success: true,
      transactionId: `OZ-${request.orderNumber}`,
    };
  }

  async verifyPayment(_transactionId: string): Promise<PaymentResult> {
    return { success: true };
  }

  async handleWebhook(payload: any): Promise<{ orderId: string; status: string }> {
    return {
      orderId: payload.OrderId,
      status: payload.Status === 'Complete' ? 'PAID' : 'PENDING',
    };
  }
}

// Factory
export function getPaymentProvider(method: string): PaymentProvider {
  switch (method) {
    case 'PAYFAST': return new PayFastProvider();
    case 'OZOW': return new OzowProvider();
    case 'WHATSAPP': return new WhatsAppPaymentProvider();
    case 'EFT':
    default:
      return new ManualPaymentProvider();
  }
}
