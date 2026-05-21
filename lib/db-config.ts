'use client';

export type DbMode = 'mongodb';

export function getDbMode(): DbMode {
  return 'mongodb';
}

export function isMongoMode(): boolean {
  return true;
}
