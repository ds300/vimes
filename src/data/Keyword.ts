export class Keyword {
  name: string;
  namespace: string;
  constructor (namespace: string, name: string) {
    this.namespace = namespace;
    this.name = name;
  }
  toString() {
    if (this.namespace) {
      return ":" + this.namespace + "/" + this.name;
    } else {
      return ":" + this.name;
    }
  }
  equals(other) {
    return other instanceof Keyword && other.namespace === this.namespace && other.name === this.name;
  }
}
