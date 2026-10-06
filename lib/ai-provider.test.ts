import { describe, expect, it } from "vitest";
import { getGeminiConfig } from "./ai-provider";

describe("getGeminiConfig", () => {
  it("uses AI_API_KEY and the documented Gemini 3 Flash model by default for Google", () => {
    expect(getGeminiConfig({ AI_API_KEY: "gemini-key" })).toEqual({
      apiKey: "gemini-key",
      model: "gemini-3-flash-preview",
    });
  });

  it("maps the unavailable Gemini 3.8 Flash model name to Gemini 3 Flash", () => {
    expect(getGeminiConfig({
      AI_API_KEY: "gemini-key",
      AI_MODEL: "gemini-3.8-flash",
    })).toEqual({
      apiKey: "gemini-key",
      model: "gemini-3-flash-preview",
    });
  });

  it("prefers the explicit Gemini key and configured model", () => {
    expect(getGeminiConfig({
      AI_PROVIDER: "google",
      AI_MODEL: "gemini-custom",
      AI_API_KEY: "generic-key",
      GOOGLE_GEMINI_API_KEY: "google-key",
    })).toEqual({
      apiKey: "google-key",
      model: "gemini-custom",
    });
  });

  it("does not use a Gemini key when a different provider is selected", () => {
    expect(getGeminiConfig({
      AI_PROVIDER: "openai",
      AI_API_KEY: "generic-key",
    })).toBeNull();
  });

  it("returns no configuration when no supported key is set", () => {
    expect(getGeminiConfig({ AI_PROVIDER: "google" })).toBeNull();
  });
});
