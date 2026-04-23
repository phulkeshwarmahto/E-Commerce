import { Badge } from "../ui/Badge";

export function ProductBadge({ badge }) {
  if (!badge) {
    return null;
  }

  return <Badge tone={badge}>{badge}</Badge>;
}
