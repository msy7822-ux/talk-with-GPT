import { HandlerContext } from "$fresh/server.ts";
import { fetchApi } from "../../lib/openai.ts";
// const prompt = {
//   command: `以下の大喜利を採点してください、採点理由はなるべく褒めて伸ばすようにしてください
//   [お題]
//   ${odai}

//   [回答]
//   ${answer}`,
//   response: {
//     score: "0 ~ 100",
//     reason: "採点理由",
//   },
// } as const;

export async function handler(_req: Request, _ctx: HandlerContext) {
  const prompt = "denoとは何ですか？";
  const res = await fetchApi({ prompt });

  const reader = res?.body?.getReader();
  const decoder = new TextDecoder();

  const read = async (): Promise<Uint8Array | null> => {
    const res = await reader?.read();
    if (!res) return null;

    const { done, value } = res;

    if (done) return null;

    console.log(decoder.decode(value));
    return read();
  };

  await read();

  reader?.releaseLock();

  // const json = await res.json();
  // const message = json.choices[0].message.content;

  return new Response(JSON.stringify(res), {
    headers: { "Content-Type": "application/json" },
  });
}
