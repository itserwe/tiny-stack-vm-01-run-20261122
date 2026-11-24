// Tiny stack VM: an exact implementation of make.fun's tiny stack ISA v1.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
function run(p, q) {
  const D = new Int32Array(256), C = new Int32Array(64), M = new Int32Array(256);
  let sp = 0, cp = 0, ip = 0, pc = 0, s = 0, o = '';
  const n = p.length, e = c => ({ o, c });
  for (;;) {
    if (s === 1000000) return e(10);
    if (pc < 0 || pc >= n) return e(9);
    const op = p[pc], im = op === 1 ? 1 : op === 2 ? 4 : op >= 48 && op <= 51 ? 2 : 0;
    if (pc + im >= n) return e(9);
    s++;
    const nx = pc + 1 + im;
    const po = op === 7 ? 3 : op === 3 || op === 4 || op === 23 || op === 27 || op === 49 || op === 50 || op === 64 || op === 80 || op === 81 || op === 83 ? 1 : op === 5 || op === 6 || op === 65 || (op >= 16 && op <= 34) ? 2 : 0;
    const pu = op === 6 || op === 7 ? 3 : op === 4 || op === 5 ? 2 : op === 1 || op === 2 || op === 64 || op === 82 || (op >= 16 && op <= 34) ? 1 : 0;
    if (sp < po) return e(2);
    if (sp - po + pu > 256) return e(3);
    pc = nx;
    if (op === 23) D[sp - 1] = -D[sp - 1] | 0;
    else if (op === 27) D[sp - 1] = ~D[sp - 1];
    else if (op >= 16 && op <= 34) {
      const b = D[sp - 1], a = D[sp - 2];
      let r;
      if (op === 16) r = (a + b) | 0;
      else if (op === 17) r = (a - b) | 0;
      else if (op === 18) r = Math.imul(a, b);
      else if (op === 19) { if (!b) return e(4); r = a === -2147483648 && b === -1 ? a : (a / b) | 0; }
      else if (op === 20) { if (!b) return e(4); r = b === -1 ? 0 : (a % b) | 0; }
      else if (op === 21) { if (!b) return e(4); r = Math.floor((a >>> 0) / (b >>> 0)) | 0; }
      else if (op === 22) { if (!b) return e(4); r = ((a >>> 0) % (b >>> 0)) | 0; }
      else if (op === 24) r = a & b;
      else if (op === 25) r = a | b;
      else if (op === 26) r = a ^ b;
      else if (op === 28) r = a << (b & 31);
      else if (op === 29) r = a >> (b & 31);
      else if (op === 30) r = (a >>> (b & 31)) | 0;
      else if (op === 32) r = a === b ? 1 : 0;
      else if (op === 33) r = a < b ? 1 : 0;
      else r = (a >>> 0) < (b >>> 0) ? 1 : 0;
      sp -= 2; D[sp++] = r;
    } else switch (op) {
      case 0: return e(0);
      case 1: D[sp++] = (p[nx - 1] << 24) >> 24; break;
      case 2: D[sp++] = p[nx - 4] | (p[nx - 3] << 8) | (p[nx - 2] << 16) | (p[nx - 1] << 24); break;
      case 3: sp--; break;
      case 4: D[sp] = D[sp - 1]; sp++; break;
      case 5: { const t = D[sp - 1]; D[sp - 1] = D[sp - 2]; D[sp - 2] = t; break; }
      case 6: D[sp] = D[sp - 2]; sp++; break;
      case 7: { const a = D[sp - 3]; D[sp - 3] = D[sp - 2]; D[sp - 2] = D[sp - 1]; D[sp - 1] = a; break; }
      case 48: case 49: case 50: { const rel = ((p[nx - 2] | (p[nx - 1] << 8)) << 16) >> 16; let t = 1; if (op !== 48) { const v = D[--sp]; t = op === 49 ? v === 0 : v !== 0; } if (t) pc = nx + rel; break; }
      case 51: if (cp === 64) return e(7); C[cp++] = nx; pc = p[nx - 2] | (p[nx - 1] << 8); break;
      case 52: if (cp === 0) return e(8); pc = C[--cp]; break;
      case 64: { const a = D[sp - 1]; if (a < 0 || a >= 256) return e(6); D[sp - 1] = M[a]; break; }
      case 65: { const a = D[sp - 1], v = D[sp - 2]; if (a < 0 || a >= 256) return e(6); sp -= 2; M[a] = v; break; }
      case 80: { const g = String(D[sp - 1]); if (o.length + g.length > 65536) return e(11); sp--; o += g; break; }
      case 81: if (o.length + 1 > 65536) return e(11); o += String.fromCharCode(D[--sp] & 255); break;
      case 82: D[sp++] = ip < q.length ? q[ip++] : -1; break;
      case 83: return e(D[--sp] & 255);
      default: return e(5);
    }
  }
}
const I = process.env.MAKEFUN_INPUT_DIR || '/input', O = process.env.MAKEFUN_OUTPUT_DIR || '/output';
for (const id of readdirSync(I).sort()) {
  const r = run(readFileSync(I + '/' + id + '/program.bin'), readFileSync(I + '/' + id + '/input.bin'));
  mkdirSync(O + '/' + id, { recursive: true });
  writeFileSync(O + '/' + id + '/stdout.bin', Buffer.from(r.o, 'latin1'));
  writeFileSync(O + '/' + id + '/exit.txt', r.c + '\n');
}
