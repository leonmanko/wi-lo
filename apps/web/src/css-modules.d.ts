// apps/web/src/css-modules.d.ts — NOUVEAU FICHIER

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}