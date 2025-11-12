import type { NextRequest } from 'next/server';
import { updateTask } from '@/server/service/task/task.service';
import * as response from '@/utils/api';

// TODO - Add authentication
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const id = (await params).id;
    const body = await request.json();
    const updatedTask = await updateTask(id, body);

    if (!updatedTask.success) {
      return response.badRequest(updatedTask.errors);
    }

    return response.noContent();
  } catch (error) {
    return response.internalError('Unexpected server error', error);
  }
}
