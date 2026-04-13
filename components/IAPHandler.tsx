import { useRouter } from "expo-router";
import { useEffect } from "react";
import * as RNIAP from "react-native-iap";
import Toast from "react-native-toast-message";
import { useVerifyPurchaseMutation } from "../store/api/apiSlice";

export const IAPHandler = () => {
  const router = useRouter();
  const [verifyPurchase] = useVerifyPurchaseMutation();

  useEffect(() => {
    let purchaseUpdateSubscription: any;
    let purchaseErrorSubscription: any;

    const initIAP = async () => {
      try {
        await RNIAP.initConnection();

        purchaseUpdateSubscription = RNIAP.purchaseUpdatedListener(
          async (purchase: RNIAP.Purchase) => {
            if (purchase) {
              try {
                // 1. Verify with backend
                // Structure: { planId: string, transaction: any }
                const verificationResult = await verifyPurchase({
                  planId: purchase.productId,
                  transaction: purchase,
                }).unwrap();

                // 2. Only finish transaction if verification was successful
                if (verificationResult.success || verificationResult.data) {
                  await RNIAP.finishTransaction({
                    purchase,
                    isConsumable: true, // true because these are credit-based (consumable)
                  });

                  Toast.show({
                    type: "success",
                    text1: "Purchase Successful",
                    text2: "Your credits have been added to your account.",
                  });

                  router.push("/purchase-history");
                } else {
                  console.warn(
                    "Backend verification returned failure",
                    verificationResult
                  );
                  Toast.show({
                    type: "error",
                    text1: "Verification Failed",
                    text2:
                      "We couldn't verify your purchase. Please contact support.",
                  });
                  router.push("/purchase-history");
                }
              } catch (error) {
                console.error("API verification call failed:", error);
                Toast.show({
                  type: "error",
                  text1: "Purchase Error",
                  text2: "Something went wrong during verification.",
                });
                router.push("/purchase-history");
              }
            }
          }
        );

        purchaseErrorSubscription = RNIAP.purchaseErrorListener(
          (error: RNIAP.PurchaseError) => {
            console.warn("Global IAP error:", error.message);

            // Don't show toast if user cancelled, but redirect if there's a real error
            if (error.code !== "user-cancelled") {
              Toast.show({
                type: "error",
                text1: "Purchase Failed",
                text2: error.message || "Something went wrong.",
              });
              router.push("/purchase-history");
            }
          }
        );
      } catch (err) {
        console.warn("Error initializing Global IAP:", err);
      }
    };

    initIAP();

    return () => {
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove();
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove();
      }
      // We don't endConnection here to allow hooks in other screens to stay active
    };
  }, [verifyPurchase]);

  return null;
};
