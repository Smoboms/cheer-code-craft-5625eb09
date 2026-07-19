// Placeholder — real implementation lands in Task 3.
// Kept as a separate file so the public card page compiles at checkpoint 2.
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: { id: string; name: string; discount_percent: number; cashback_enabled: boolean; cashback_percent: number; cashback_feature_unlocked: boolean };
  client: { user_id: string; name: string; card_code: string };
}

export function CouponIssuerDialog(_props: Props) {
  return null;
}
