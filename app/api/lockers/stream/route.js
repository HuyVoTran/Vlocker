import { addLockerClient, removeLockerClient } from "@/lib/lockerEvents";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      addLockerClient(controller);
      controller.enqueue(`event: connected\ndata: ${JSON.stringify({ ts: Date.now() })}\n\n`);
    },
    cancel(controller) {
      removeLockerClient(controller);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
