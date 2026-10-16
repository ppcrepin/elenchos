// Fractions exactes (regles.md, section 2, « Calcul exact ») : toutes les grandeurs du moteur sont des fractions,
// jamais des nombres à virgule, pour qu'une égalité qui déclenche un départage se juge sur la valeur exacte.
// Portage de `Fraction` de l'essai 2 (noyau.js), mêmes opérations, même écriture « p/q ».

export class ErreurFraction extends Error {
  override name = 'ErreurFraction';
}

function pgcd(a: bigint, b: bigint): bigint {
  if (a < 0n) a = -a;
  if (b < 0n) b = -b;
  while (b !== 0n) {
    const r = a % b;
    a = b;
    b = r;
  }
  return a;
}

function versBigInt(x: number | bigint): bigint {
  if (typeof x === 'bigint') return x;
  if (!Number.isSafeInteger(x)) throw new ErreurFraction(`nombre à virgule ou trop grand refusé (${x})`);
  return BigInt(x);
}

/** Une fraction irréductible p/q, q > 0, immuable. */
export class Fraction {
  readonly n: bigint;
  readonly d: bigint;

  /** Depuis deux entiers, ou une chaîne « p/q », « -2 » ou « 0.95 ». Jamais depuis un nombre à virgule. */
  constructor(p: number | bigint | string, q?: number | bigint) {
    let num: bigint;
    let den: bigint;
    if (typeof p === 'string') {
      if (q !== undefined) throw new ErreurFraction('chaîne et dénominateur à la fois');
      const md = /^(-?)([0-9]+)(?:\.([0-9]+))?$/.exec(p);
      const mf = /^(-?[0-9]+)\/([0-9]+)$/.exec(p);
      if (md) {
        const dec = md[3] ?? '';
        num = BigInt((md[2] ?? '') + dec);
        den = 10n ** BigInt(dec.length);
        if (md[1] === '-') num = -num;
      } else if (mf) {
        num = BigInt(mf[1] ?? '');
        den = BigInt(mf[2] ?? '');
      } else {
        throw new ErreurFraction(`chaîne illisible « ${p} »`);
      }
    } else {
      num = versBigInt(p);
      den = q === undefined ? 1n : versBigInt(q);
    }
    if (den === 0n) throw new ErreurFraction('dénominateur nul');
    if (den < 0n) {
      num = -num;
      den = -den;
    }
    const g = pgcd(num, den);
    if (g > 1n) {
      num /= g;
      den /= g;
    }
    this.n = num;
    this.d = den;
    Object.freeze(this);
  }

  static readonly ZERO = new Fraction(0);
  static readonly UN = new Fraction(1);
  static readonly DEMI = new Fraction(1, 2);

  plus(b: FractionLike): Fraction {
    const x = F(b);
    return new Fraction(this.n * x.d + x.n * this.d, this.d * x.d);
  }
  moins(b: FractionLike): Fraction {
    const x = F(b);
    return new Fraction(this.n * x.d - x.n * this.d, this.d * x.d);
  }
  fois(b: FractionLike): Fraction {
    const x = F(b);
    return new Fraction(this.n * x.n, this.d * x.d);
  }
  divise(b: FractionLike): Fraction {
    const x = F(b);
    if (x.n === 0n) throw new ErreurFraction('division par zéro');
    return new Fraction(this.n * x.d, this.d * x.n);
  }
  oppose(): Fraction {
    return new Fraction(-this.n, this.d);
  }
  abs(): Fraction {
    return this.n < 0n ? this.oppose() : this;
  }
  /** -1, 0 ou 1, par produits croisés. */
  cmp(b: FractionLike): -1 | 0 | 1 {
    const x = F(b);
    const g = this.n * x.d;
    const dr = x.n * this.d;
    return g < dr ? -1 : g > dr ? 1 : 0;
  }
  egal(b: FractionLike): boolean {
    return this.cmp(b) === 0;
  }
  inf(b: FractionLike): boolean {
    return this.cmp(b) < 0;
  }
  infEgal(b: FractionLike): boolean {
    return this.cmp(b) <= 0;
  }
  sup(b: FractionLike): boolean {
    return this.cmp(b) > 0;
  }
  supEgal(b: FractionLike): boolean {
    return this.cmp(b) >= 0;
  }
  estZero(): boolean {
    return this.n === 0n;
  }
  /** « p/q », ou « p » si q = 1 (forme de l'essai). */
  toString(): string {
    return this.d === 1n ? this.n.toString() : `${this.n.toString()}/${this.d.toString()}`;
  }
  toJSON(): string {
    return this.toString();
  }
  /** Seule conversion en nombre à virgule, pour dessiner. La valeur rendue ne revient jamais dans un calcul. */
  pourDessiner(): number {
    return Number(this.n) / Number(this.d);
  }

  static max(a: FractionLike, b: FractionLike): Fraction {
    return F(a).cmp(b) >= 0 ? F(a) : F(b);
  }
  static min(a: FractionLike, b: FractionLike): Fraction {
    return F(a).cmp(b) <= 0 ? F(a) : F(b);
  }
  static somme(liste: readonly FractionLike[]): Fraction {
    let s = Fraction.ZERO;
    for (const x of liste) s = s.plus(x);
    return s;
  }
}

export type FractionLike = Fraction | number | bigint | string;

/** Fraction depuis une fraction, un entier ou une chaîne. */
export function F(x: FractionLike, q?: number | bigint): Fraction {
  if (x instanceof Fraction) {
    if (q !== undefined) throw new ErreurFraction('fraction et dénominateur à la fois');
    return x;
  }
  return new Fraction(x, q);
}
