import { describe, expect, it } from "vitest";
import { getInteractionText } from "./gemini-interactions";

describe("getInteractionText", () => {
  it("reads the SDK-compatible output_text field", () => {
    expect(getInteractionText({ output_text: "  Direct answer  " })).toBe("Direct answer");
  });

  it("joins text output blocks from the Interactions REST response", () => {
    expect(getInteractionText({
      steps: [
        { type: "model_output", content: [{ type: "text", text: "First point." }] },
        { type: "model_output", content: [{ type: "text", text: "Second point." }] },
      ],
    })).toBe("First point.\nSecond point.");
  });

  it("supports older output blocks when the REST response has no steps", () => {
    expect(getInteractionText({
      outputs: [{ type: "text", text: "Legacy output." }],
    })).toBe("Legacy output.");
  });

  it("returns null when the interaction has no text output", () => {
    expect(getInteractionText({ outputs: [{ type: "thought", text: "internal" }] })).toBeNull();
  });
});
