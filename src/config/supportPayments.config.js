const PAYMENT_METHOD_DEFINITIONS = [
  { id: 'stripe', label: 'Stripe', envVar: 'REACT_APP_SUPPORT_STRIPE_URL' },
  { id: 'paypal', label: 'PayPal', envVar: 'REACT_APP_SUPPORT_PAYPAL_URL' },
  { id: 'kofi', label: 'Ko-fi', envVar: 'REACT_APP_SUPPORT_KOFI_URL' },
  { id: 'buymeacoffee', label: 'Buy Me a Coffee', envVar: 'REACT_APP_SUPPORT_BMC_URL' },
  { id: 'custom', label: 'Other', envVar: 'REACT_APP_SUPPORT_CHECKOUT_URL' },
];

export const SUPPORT_DEFAULT_AMOUNTS = [5, 10, 20, 50, 100];
export const SUPPORT_PREFERENCES_KEY = 'supportPreferences';
export const SUPPORT_DEFAULT_CURRENCY = process.env.REACT_APP_SUPPORT_CURRENCY || 'EUR';

const readEnvValue = (envVar) => process.env[envVar] || '';

export const buildSupportPaymentOptions = () => (
  PAYMENT_METHOD_DEFINITIONS.map((definition) => ({
    ...definition,
    checkoutUrl: readEnvValue(definition.envVar),
  }))
);

export const getPaymentProviderName = (checkoutUrl) => {
  if (!checkoutUrl) {
    return 'Not configured';
  }

  try {
    const hostname = new URL(checkoutUrl).hostname.toLowerCase();
    if (hostname.includes('stripe')) return 'Stripe';
    if (hostname.includes('paypal')) return 'PayPal';
    if (hostname.includes('buymeacoffee')) return 'Buy Me a Coffee';
    if (hostname.includes('ko-fi')) return 'Ko-fi';
    if (hostname.includes('lemonsqueezy')) return 'Lemon Squeezy';
    if (hostname.includes('patreon')) return 'Patreon';
    return 'External Checkout';
  } catch (_error) {
    return 'External Checkout';
  }
};

export const buildSupportCheckoutUrl = ({ paymentOption, amount }) => {
  if (!paymentOption?.checkoutUrl) {
    return '';
  }

  const normalizedAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;
  const paypalAmount = Number.isInteger(normalizedAmount)
    ? String(normalizedAmount)
    : normalizedAmount.toFixed(2);

  try {
    const checkoutUrl = new URL(paymentOption.checkoutUrl);
    const hostname = checkoutUrl.hostname.toLowerCase();

    // PayPal donation links expect major units (e.g. 5.00), not cents.
    if (paymentOption.id === 'paypal' || hostname.includes('paypal')) {
      checkoutUrl.searchParams.set('amount', paypalAmount);
      checkoutUrl.searchParams.set('currency_code', SUPPORT_DEFAULT_CURRENCY);
      checkoutUrl.searchParams.set('currency', SUPPORT_DEFAULT_CURRENCY);
      checkoutUrl.searchParams.set('payment', 'paypal');
      return checkoutUrl.toString();
    }

    // Generic fallback: keep both major and minor units for compatibility.
    checkoutUrl.searchParams.set('amount', normalizedAmount.toFixed(2));
    checkoutUrl.searchParams.set('amount_minor', String(Math.round(normalizedAmount * 100)));
    checkoutUrl.searchParams.set('currency', SUPPORT_DEFAULT_CURRENCY);
    checkoutUrl.searchParams.set('payment', paymentOption.id || 'external');
    return checkoutUrl.toString();
  } catch (_error) {
    return paymentOption.checkoutUrl;
  }
};
