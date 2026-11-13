import { db, type Profile } from './db';
import { classOf } from '../domain/profile/studentCode';

export function findProfile(studentCode: string): Promise<Profile | undefined> {
  return db.profiles.where('studentCode').equals(studentCode).first();
}

export async function createProfile(studentCode: string, nickname: string): Promise<Profile> {
  const id = await db.profiles.add({
    studentCode,
    nickname: nickname.trim(),
    classCode: classOf(studentCode),
    createdAt: Date.now(),
  });
  return (await db.profiles.get(id))!;
}
