import { env } from "./env.ts";
import * as mod from "https://deno.land/std@0.184.0/streams/write_all.ts";

export const fetchApi = async (opt: { prompt: string; modelName?: string }) => {
  const body = {
    messages: [
      {
        role: "user",
        content: opt.prompt,
      },
    ],
    model: "gpt-3.5-turbo",
    stream: true,
  };

  const res = await fetch(env["OPENAI_API_ENDPOINT"], {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env["OPENAI_API_KEY"]}`,
    },
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res) return;

  if (!res.ok) {
    throw new Error("OpenAI API error");
  }

  return res;
  // const json = await res.json();
  // return json.choices[0].message.content;
};

export const readeMessage = async (prompt: string) => {
  const res = await fetchApi({ prompt });

  const reader = res?.body?.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const read = async (): Promise<Uint8Array | null> => {
    const res = await reader?.read();
    if (!res) return null;

    const { done, value } = res;

    if (done) return null;

    const chunks = decoder
      .decode(value)
      .split("data: ")
      .map((str) => (str === "[DONE]\n\n" ? undefined : str))
      .filter((str) => !!str)
      .map((str) => JSON.parse(str as string));

    chunks.forEach(async (chunk) => {
      await mod.writeAll(
        Deno.stdout,
        encoder.encode(chunk.choices[0].delta.content)
      );
      // console.log(chunk.choices[0].delta.content);
    });
    return read();
  };

  return await read();
};

type Prompt = {
  readonly command: string;
  readonly response: {
    readonly [key: string]: string;
  };
  model?: string;
};

export const executePrompt = async <T extends Prompt>(
  opt: T
): Promise<{ [k in keyof T["response"]]: string }> => {
  const responseFormats = Object.keys(opt.response)
    .map((key) => {
      return `${key}: ${opt.response[key]}`;
    })
    .join("\n");

  const prompt = `${opt.command}
  以下の形式で回答してください
  \`\`\`
  ${responseFormats}
  \`\`\``;

  const result = await fetchApi({ prompt });
  const resultLines = result.split("\n");
  // const response = {} as { [k in keyof T["response"]]: string };
  // Object.keys(opt.response).forEach((key) => {
  //   const line = resultLines.find((line: string) =>
  //     line.startsWith(`${key}: `)
  //   );
  //   if (!line) {
  //     throw new Error("Invalid llm response format");
  //   }
  //   response[key] = line.replace(`${key}: `, "");
  // });

  return resultLines;
};
