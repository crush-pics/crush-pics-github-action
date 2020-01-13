module.exports = (idParam) => {
  if (typeof idParam === 'undefined' || typeof idParam !== 'number') {
    throw new Error('the required id parameter missing or wrong')
  }
  return idParam
}