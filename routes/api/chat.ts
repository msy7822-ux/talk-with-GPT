import { HandlerContext } from "$fresh/server.ts";
import { fetchApi, readeMessage } from "../../lib/openai.ts";
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
  await readeMessage(prompt);

  // const json = await res.json();
  // const message = json.choices[0].message.content;

  return new Response(JSON.stringify({ prompt }), {
    headers: { "Content-Type": "application/json" },
  });
}
