import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import type {
  ProductOrSubscription,
  Purchase,
  PurchaseError,
} from "react-native-iap";
import * as RNIAP from "react-native-iap";

export const useIAPFlow = () => {
  const [products, setProducts] = useState<ProductOrSubscription[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastPurchase, setLastPurchase] = useState<Purchase | null>(null);
  const [purchaseError, setPurchaseError] = useState<PurchaseError | null>(
    null
  );

  // Init billing ONCE
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const result = await RNIAP.initConnection();
        if (mounted) {
          setConnected(!!result);
        }
      } catch (err) {
        console.warn("IAP init error", err);
      }
    };

    init();

    return () => {
      mounted = false;
      // We don't endConnection here as it's handled by Global IAPHandler or on app close
    };
  }, []);

  // Purchase one-time product (INAPP)
  const handlePurchase = useCallback(async (productId: string) => {
    try {
      setPurchaseError(null);
      setLastPurchase(null);

      // Platform-specific purchase request
      if (Platform.OS === "ios") {
        await RNIAP.requestPurchase({
          type: "in-app",
          request: {
            apple: {
              sku: productId,
            },
          },
        });
      } else if (Platform.OS === "android") {
        await RNIAP.requestPurchase({
          type: "in-app",
          request: {
            google: {
              skus: [productId],
            },
          },
        });
      }
    } catch (err: any) {
      const isCancelled =
        err.code === "E_USER_CANCELLED" ||
        err.code === RNIAP.ErrorCode.UserCancelled ||
        err.message?.toLowerCase().includes("cancel");

      if (isCancelled) {
        console.log("User cancelled the purchase");
      } else {
        console.warn("Error requesting purchase", err);
      }
      throw err;
    }
  }, []);

  // Fetch products
  const fetchPlanProducts = useCallback(async (productIds: string[]) => {
    if (!productIds.length) return;
    try {
      const items = await RNIAP.fetchProducts({ skus: productIds });
      if (items) {
        setProducts(items);
      }
    } catch (err) {
      console.warn("Error fetching products", err);
    }
  }, []);

  return {
    handlePurchase,
    fetchPlanProducts,
    products,
    connected,
    lastPurchase,
    purchaseError,
  };
};
