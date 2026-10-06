type InteractionOutput = {
  type?: string;
  text?: string;
  content?: Array<{ type?: string; text?: string }>;
};

type InteractionResponse = {
  output_text?: string;
  outputs?: InteractionOutput[];
  steps?: InteractionOutput[];
};

export function getInteractionText(response: InteractionResponse): string | null {
  const directText = response.output_text?.trim();
  if (directText) return directText;

  const text = (response.steps ?? response.outputs)
    ?.flatMap((output) => {
      if (output.type === "text" && output.text) return [output.text];
      return output.content
        ?.filter((item) => item.type === "text" && item.text)
        .map((item) => item.text as string) ?? [];
    })
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n");

  return text || null;
}
