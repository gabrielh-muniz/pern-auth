/**
 * Error handling function
 * @param {Promise} promise - The promise to handle
 * @return {Promise} - A promise that resolves to an array containing either the error or the data
 */
export function catchError(promise) {
  return promise.then((data) => [null, data]).catch((error) => [error, null]);
}
