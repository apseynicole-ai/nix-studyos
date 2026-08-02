import { beforeEach, describe, expect, it } from 'vitest';
import { TBC_TASK_TEXT } from './recurring/weekGenerator';
import { studyBlocksRepo } from './repositories';
import { isPlaceholderStudyTask, updateStudyBlockTaskText } from './studyBlocks';
import { installMemoryStorage } from './testMemoryStorage';
import type { StudyBlock } from './types';

const BLOCK: StudyBlock = {
  id: 'sb:test',
  moduleId: 'finacc178',
  date: '2026-07-28',
  startTime: '13:00',
  endTime: '14:00',
  plannedMinutes: 60,
  taskText: TBC_TASK_TEXT,
  linkedTaskId: 'task-1',
  linkedAssessmentId: 'assessment-1',
  weight: 2,
  isIndependentObligation: true,
  notes: 'Keep every field',
};

beforeEach(() => {
  installMemoryStorage();
  studyBlocksRepo.upsert(BLOCK);
});

describe('study-block instructions', () => {
  it('detects the locked placeholder but not a normal instruction', () => {
    expect(isPlaceholderStudyTask(TBC_TASK_TEXT)).toBe(true);
    expect(isPlaceholderStudyTask('Complete tutorial questions 1–4')).toBe(false);
  });

  it('trims the instruction and changes only taskText', () => {
    const updated = updateStudyBlockTaskText(BLOCK.id, '  Complete tutorial questions 1–4  ');
    expect(updated).toEqual({ ...BLOCK, taskText: 'Complete tutorial questions 1–4' });
    expect(studyBlocksRepo.getById(BLOCK.id)).toEqual(updated);
  });

  it('does not destroy the existing instruction when blank text is submitted', () => {
    expect(updateStudyBlockTaskText(BLOCK.id, '   ')).toBeUndefined();
    expect(studyBlocksRepo.getById(BLOCK.id)).toEqual(BLOCK);
  });

  it('fails safely when the block is missing', () => {
    expect(updateStudyBlockTaskText('missing', 'New instruction')).toBeUndefined();
  });
});
