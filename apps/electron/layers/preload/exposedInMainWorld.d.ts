interface Window {
  /**
   * Safe expose node.js API
   * @example
   * window.nodeCrypto('data')
   */
  readonly nodeCrypto: { sha256sum: any };
}
