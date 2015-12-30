import { ProtocolFunction, implement } from '../protocols'

export const show = ProtocolFunction([1], null, 'vimes.core/show');
implement(show, Object.prototype, obj => obj.toString());
implement(show, null, (_) => 'nil');
implement(show, String.prototype, s => JSON.stringify(s));
const flags = r => r.flags || r.toString().match(/[gimuy]*$/)[0] || "";
implement(show, RegExp.prototype, r => `#"${r.source}"${flags(r)}`)

export const withMeta = ProtocolFunction([2], null, 'vimes.core/with-meta');
export const meta = ProtocolFunction([1], null, "vimes.core/meta");

export const seq = ProtocolFunction([1], null, "vimes.core/seq");
export const first = ProtocolFunction([1], null, "vimes.core/first");
export const rest = ProtocolFunction([1], null, "vimes.core/rest");
