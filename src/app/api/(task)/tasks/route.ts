import { getAllTasks } from '@/server/service/task/task.service';
import * as response from '@/utils/api';

// TODO - Add authentication
export async function GET() {
  try {
    const tasks = await getAllTasks();
    return response.ok(tasks);
  } catch (error) {
    return response.internalError('Unexpected server error', error);
  }
}
