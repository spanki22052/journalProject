import type { Dayjs } from 'dayjs';
import { ObjectData } from '@pages/objects/model/types';

export interface CreateObjectModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: Partial<ObjectData>) => void;
  loading?: boolean;
}

export interface FormValues {
  name: string;
  type: 'project';
  assignee: string;
  description?: string;
  startDate: Dayjs;
  endDate: Dayjs;
}
