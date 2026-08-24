import type { RewardsRule } from "@/types/api.types";

// Shared by the admin Rewards settings page and the residential Rewards
// details page — both render the same rewards_rules rows, just with
// different edit affordances.
export function formatRewardsRuleDescription(rule: RewardsRule): string {
  if (rule.value == null) return rule.description;
  const formattedValue = rule.unit === "usd" ? rule.value.toFixed(2).replace(/\.00$/, "") : String(rule.value);
  return rule.description.replace("{value}", formattedValue);
}
