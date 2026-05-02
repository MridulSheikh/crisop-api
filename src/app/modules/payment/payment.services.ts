import Stripe from 'stripe';
import config from '../../config';

const stripe = new Stripe(config.STRIPE_SECTRET_KEY as string);

export const stripePaymentServices = async ({
    items, userEmail,
}: {
    items: {
        name: string;
        price: number;
        quantity: number;
    }[];
    userEmail: string;
}) => {
  const amount = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: 'usd',

    receipt_email: userEmail,

    automatic_payment_methods: {
      enabled: true,
    },

    metadata: {
      items: JSON.stringify(items),
      total: amount.toString(),
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
  };
};
