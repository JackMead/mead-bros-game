import type { Chapter } from '../types';
import { prologue } from './00-prologue';
import { whitby } from './01-whitby';

/** Every chapter, in story order. Add new chapters here. */
export const chapters: Chapter[] = [prologue, whitby];
