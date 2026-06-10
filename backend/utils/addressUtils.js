function normalizeText(value) {
  return String(value ?? '').trim();
}

function buildAddress(source = {}) {
  const nestedAddress = typeof source.address === 'object' && source.address !== null ? source.address : null;
  const address = source.defaultAddress || source.shippingAddress || nestedAddress || source;
  return {
    name: normalizeText(address.name || address.fullName),
    phone: normalizeText(address.phone || address.mobile),
    address: normalizeText(address.address || address.line1),
    city: normalizeText(address.city),
    state: normalizeText(address.state),
    postalCode: normalizeText(address.postalCode || address.pincode),
    country: normalizeText(address.country) || 'India',
  };
}

function hasAddress(address) {
  if (!address) return false;
  return ['address', 'city', 'state', 'postalCode'].some((key) => normalizeText(address[key]));
}

function addressKey(address) {
  return JSON.stringify(buildAddress(address)).toLowerCase();
}

function mergeSavedAddresses(existing = [], nextAddress) {
  const normalized = buildAddress(nextAddress);
  if (!hasAddress(normalized)) return Array.isArray(existing) ? existing : [];
  const current = Array.isArray(existing) ? existing.map(buildAddress).filter(hasAddress) : [];
  const key = addressKey(normalized);
  const deduped = current.filter((item) => addressKey(item) !== key);
  return [normalized, ...deduped].slice(0, 5);
}

module.exports = {
  buildAddress,
  hasAddress,
  mergeSavedAddresses,
};
