import { useMemo } from 'react';
import { ObjectChecklist } from '../model/types';

interface UseObjectChecklistProps {
  checklist: ObjectChecklist;
}

export const useObjectChecklist = ({ checklist }: UseObjectChecklistProps) => {
  const progressInfo = useMemo(() => {
    const completedCount = checklist.items.filter(
      item => item.completed
    ).length;
    const totalCount = checklist.items.length;
    const progressPercent =
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      completedCount,
      totalCount,
      progressPercent,
    };
  }, [checklist.items]);

  return {
    progressInfo,
  };
};
