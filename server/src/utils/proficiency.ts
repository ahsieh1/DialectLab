import { Proficiency } from '../database'

export const PROFICIENCY_ORDER: Proficiency[] = ['beginner', 'intermediate', 'advanced', 'master', 'native']

export function meetsProficiency(
  userLevel: Proficiency,
  requiredLevel: Proficiency
): boolean {
  return PROFICIENCY_ORDER.indexOf(userLevel) >= PROFICIENCY_ORDER.indexOf(requiredLevel)
}

/* 
Example route call:
    if (room.required_proficiency && !meetsProficiency(userLevel, room.required_proficiency)) {
        return res.status(403).json({ error: 'Your level is too low for this room' })
    }
*/