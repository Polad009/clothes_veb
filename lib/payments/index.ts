import { PaymentProvider } from "./types";
import { MockPaymentProvider } from "./providers/mockProvider";
import { RealGatewayTemplateProvider } from "./providers/templateProvider";

export * from "./types";
export { MockPaymentProvider } from "./providers/mockProvider";
export { RealGatewayTemplateProvider } from "./providers/templateProvider";

export function getActivePaymentProvider(): PaymentProvider {
  const providerName = (process.env.PAYMENT_PROVIDER || "mock").toLowerCase();
  const paymentMode = (process.env.PAYMENT_MODE || "test").toLowerCase();

  if (paymentMode === "live" && providerName === "mock") {
    throw new Error("Təhlükəsizlik xətası: PAYMENT_MODE=live olanda 'mock' provayderi işlədilə bilməz!");
  }

  switch (providerName) {
    case "template":
    case "stripe":
    case "payriff":
    case "pashabank":
      return new RealGatewayTemplateProvider();
    case "mock":
    default:
      return new MockPaymentProvider();
  }
}

