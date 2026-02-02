import { ShimmerElementType, type IShimmerElement } from "@fluentui/react";

export type ShimmerPreset =
  | "list"
  | "card"
  | "details"
  | "profile"
  | "text";

export function getShimmerElements(preset: ShimmerPreset): IShimmerElement[] {
  switch (preset) {
    case "list":
      // Looks like rows: title + 2 lines, repeated by caller
      return [
        { type: ShimmerElementType.line, width: "40%", height: 14 },
        { type: ShimmerElementType.gap, width: "100%", height: 10 },
        { type: ShimmerElementType.line, width: "92%", height: 12 },
        { type: ShimmerElementType.gap, width: "100%", height: 8 },
        { type: ShimmerElementType.line, width: "75%", height: 12 }
      ];

    case "card":
      // Card with header + body + footer line
      return [
        { type: ShimmerElementType.line, width: "55%", height: 14 },
        { type: ShimmerElementType.gap, width: "100%", height: 10 },
        { type: ShimmerElementType.line, width: "100%", height: 120 },
        { type: ShimmerElementType.gap, width: "100%", height: 10 },
        { type: ShimmerElementType.line, width: "80%", height: 12 }
      ];

    case "details":
      // Detail page: title + bigger block + lines
      return [
        { type: ShimmerElementType.line, width: "65%", height: 18 },
        { type: ShimmerElementType.gap, width: "100%", height: 12 },
        { type: ShimmerElementType.line, width: "100%", height: 180 },
        { type: ShimmerElementType.gap, width: "100%", height: 12 },
        { type: ShimmerElementType.line, width: "95%", height: 12 },
        { type: ShimmerElementType.gap, width: "100%", height: 8 },
        { type: ShimmerElementType.line, width: "88%", height: 12 },
        { type: ShimmerElementType.gap, width: "100%", height: 8 },
        { type: ShimmerElementType.line, width: "80%", height: 12 }
      ];

    case "profile":
      // Avatar + name + subtitle + small lines
      return [
        { type: ShimmerElementType.circle, height: 44 },
        { type: ShimmerElementType.gap, width: 12 },
        { type: ShimmerElementType.line, width: "35%", height: 14 },
        { type: ShimmerElementType.gap, width: "100%", height: 10 },
        { type: ShimmerElementType.line, width: "55%", height: 12 }
      ];

    case "text":
    default:
      return [
        { type: ShimmerElementType.line, width: "60%", height: 14 },
        { type: ShimmerElementType.gap, width: "100%", height: 10 },
        { type: ShimmerElementType.line, width: "95%", height: 12 },
        { type: ShimmerElementType.gap, width: "100%", height: 8 },
        { type: ShimmerElementType.line, width: "85%", height: 12 }
      ];
  }
}
