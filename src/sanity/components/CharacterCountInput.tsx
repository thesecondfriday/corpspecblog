import type { StringInputProps, TextInputProps } from "sanity";

/*
 * A live character counter under a string/text field.
 *
 * Sanity has no built-in counter — validation only fires on save, which is too
 * late to be useful while an editor is writing a meta description to length.
 * This renders the count as they type and colours it against the ideal range.
 *
 * Attach with `components: { input: characterCount(55, 60) }` on the field.
 * The two numbers are the ideal ceiling and the hard ceiling; the field's own
 * validation still owns what actually blocks a save.
 *
 * Deliberately plain markup rather than @sanity/ui: its v4 components are
 * polymorphic generics that don't type-check cleanly against React 19, and a
 * counter is not worth that coupling. The colours below are Studio theme
 * variables, so this follows light and dark mode on its own.
 */

const TONES = {
  neutral: "var(--card-muted-fg-color, #8c9084)",
  positive: "var(--card-badge-positive-fg-color, #3a7d4c)",
  caution: "var(--card-badge-caution-fg-color, #9a6b1e)",
  critical: "var(--card-badge-critical-fg-color, #c24e1e)",
} as const;

export function characterCount(ideal: number, max: number) {
  return function CharacterCountInput(props: StringInputProps | TextInputProps) {
    const value = typeof props.value === "string" ? props.value : "";
    const count = value.length;

    const tone =
      count === 0 ? "neutral" : count > max ? "critical" : count > ideal ? "caution" : "positive";

    const hint =
      count === 0
        ? `Aim for ${ideal}–${max} characters`
        : count > max
          ? `${count - max} over — search engines will cut this off`
          : count > ideal
            ? "Getting long, but still fine"
            : "Good length";

    return (
      <div>
        {props.renderDefault(props)}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "0.5rem",
            font: "inherit",
            fontSize: "0.8125rem",
            color: TONES[tone],
          }}
        >
          <span
            style={{
              fontVariantNumeric: "tabular-nums",
              fontWeight: 600,
              border: "1px solid currentColor",
              borderRadius: "2px",
              padding: "0.0625rem 0.375rem",
            }}
          >
            {count} / {max}
          </span>
          <span style={{ color: "var(--card-muted-fg-color, #8c9084)" }}>{hint}</span>
        </div>
      </div>
    );
  };
}
