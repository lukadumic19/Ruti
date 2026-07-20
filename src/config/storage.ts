/**
 * Internt storage-namespace (DATA_MODEL §8: versionerede nøgler "atlas:v1:*").
 * Bevidst IKKE koblet til branding: et navneskifte må ikke slette brugerdata.
 */
export const storageNamespace = "atlas:v1";

export function storageKey(name: string): string {
  return `${storageNamespace}:${name}`;
}
