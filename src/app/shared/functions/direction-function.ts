import { DirectionForm } from '../models/direction.models';

export function emptyDirectionForm(): DirectionForm {
  return { degreeLevelId: null, code: '', name: '', profile: '' };
}
