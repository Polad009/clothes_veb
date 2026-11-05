import { PaymentProvider } from "./types";
import { MockPaymentProvider } from "./providers/mockProvider";
import { RealGatewayTemplateProvider } from "./providers/templateProvider";
import { EpointPaymentProvider } from "./providers/epointProvider";

export * from "./types";
export { MockPaymentProvider } from "./providers/mockProvider";
export { RealGatewayTemplateProvider } from "./providers/templateProvider";
export { EpointPaymentProvider } from "./providers/epointProvider";

export function getActivePaymentProvider(): PaymentProvider {
  const providerName = (process.env.PAYMENT_PROVIDER || "epoint").toLowerCase();
  const paymentMode = (process.env.PAYMENT_MODE || "test").toLowerCase();

  switch (providerName) {
    case "epoint":
      return new EpointPaymentProvider();
    case "template":
    case "stripe":
    case "payriff":
    case "pashabank":
      return new RealGatewayTemplateProvider();
    case "mock":
    default:
      if (paymentMode === "live") {
        return new EpointPaymentProvider();
      }
      return new MockPaymentProvider();
  }
}

