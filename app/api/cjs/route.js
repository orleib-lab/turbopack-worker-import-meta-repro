import { startWorker } from 'worker-pkg/cjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const worker = startWorker();
    const message = await new Promise((resolve, reject) => {
      worker.once('message', resolve);
      worker.once('error', reject);
    });
    await worker.terminate();
    return Response.json({ message });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
