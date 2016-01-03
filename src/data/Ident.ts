const interned = {};


export class Ident {
  interned: boolean;
  name: string;
  namespace: string;
  combined: string;
  constructor (namespace: string, name: string) {
    this.namespace = namespace;
    this.name = name;
    if (this.namespace) {
      this.combined = this.namespace + "/" + this.name;
    } else {
      this.combined = this.name;
    }
  }
  toString() {
    return this.combined;
  }
  equals(other): boolean {
    return other instanceof Ident && other.combined === this.combined;
  }
  intern(): Ident {
    if (this.interned) {
      return this;
    } else {
      const existing = interned[this.combined];
      if (existing != null) {
        return existing;
      } else {
        interned[this.combined] = this;
        this.interned = true;
        return this;
      }
    }
  }
}
