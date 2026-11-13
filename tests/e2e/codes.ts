import { makeStudentCode } from '../../src/domain/profile/studentCode';
import { makeRng } from '../../src/domain/random';

/** Kode siswa sah (acak, ber-seed) untuk tes E2E. */
export const RAKA = makeStudentCode('A', makeRng(101));
export const SINTA = makeStudentCode('B', makeRng(102));
export const DIMAS = makeStudentCode('C', makeRng(103));
