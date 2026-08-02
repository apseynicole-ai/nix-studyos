import { studyBlocksRepo } from './repositories';
import { TBC_TASK_TEXT } from './recurring/weekGenerator';
import type { StudyBlock } from './types';

export function isPlaceholderStudyTask(taskText: string): boolean {
  return taskText.trim() === TBC_TASK_TEXT;
}

/** Update only a study block's instruction, preserving all scheduling and linkage fields. */
export function updateStudyBlockTaskText(blockId: string, taskText: string): StudyBlock | undefined {
  const block = studyBlocksRepo.getById(blockId);
  const trimmed = taskText.trim();
  if (!block || !trimmed) return undefined;

  return studyBlocksRepo.upsert({ ...block, taskText: trimmed });
}
