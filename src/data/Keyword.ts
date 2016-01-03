const interned = {};

export class Keyword {
  name: string;
  namespace: string;
  combined: string;
  constructor (namespace: string, name: string) {
    this.namespace = namespace;
    this.name = name;
    if (this.namespace) {
      this.combined = ":" + this.namespace + "/" + this.name;
    } else {
      this.combined = ":" + this.name;
    }
  }
  toString() {
    return this.combined;
  }
  equals(other) {
    return other instanceof Keyword && other.combined === this.combined;
  }
  intern() {
    const existing = interned[this.combined];
    if (existing != null) {
      return existing;
    } else {
      interned[this.combined] = this;
      return this;
    }
  }
}
