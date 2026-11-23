export const emptyChargeFilters = {
  start: '', end: '', customer: '', minimum: '', maximum: '', order: '',
};

export function paymentStatusMatches(status, filter) {
  return filter === 'ALL' || status === filter ||
    (filter === 'PENDING' && status === 'PAYMENT_IN_PROCESS');
}

function matchesSearch(value, query) {
  return String(value ?? '').toLocaleLowerCase('pt-BR').includes(query.trim().toLocaleLowerCase('pt-BR'));
}

export function filterCharges(charges, status, query, filters) {
  const date = (charge) => charge.dueDate?.slice(0, 10) || '';
  const filtered = charges.filter((charge) => {
    const due = date(charge);
    const amount = Number(charge.amount);
    return paymentStatusMatches(charge.status, status) &&
      matchesSearch([charge.customerName, charge.petName, charge.serviceName, charge.id].join(' '), query) &&
      matchesSearch(charge.customerName, filters.customer) &&
      (!filters.start || (due && due >= filters.start)) &&
      (!filters.end || (due && due <= filters.end)) &&
      (!filters.minimum || (charge.amount != null && amount >= Number(filters.minimum))) &&
      (!filters.maximum || (charge.amount != null && amount <= Number(filters.maximum)));
  });
  if (!filters.order) return filtered;
  return filtered.sort((first, second) => {
    const a = date(first);
    const b = date(second);
    if (!a || !b) return Number(!a) - Number(!b);
    return filters.order === 'newest' ? b.localeCompare(a) : a.localeCompare(b);
  });
}

export function validateChargeFilters(filters) {
  const clean = Object.fromEntries(Object.entries(filters).map(([key, value]) => [key, value.trim()]));
  for (const value of [clean.start, clean.end]) {
    if (!value) continue;
    const parsed = new Date(value + 'T00:00:00Z');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(parsed.getTime()) ||
        parsed.toISOString().slice(0, 10) !== value) {
      throw new Error('Informe datas válidas no formato AAAA-MM-DD.');
    }
  }
  if (clean.start && clean.end && clean.start > clean.end) {
    throw new Error('A data final deve ser igual ou posterior à inicial.');
  }
  for (const key of ['minimum', 'maximum']) {
    if (!clean[key]) continue;
    clean[key] = clean[key].replace(',', '.');
    if (!/^\d+(\.\d{1,2})?$/.test(clean[key]) || !Number.isFinite(Number(clean[key]))) {
      throw new Error('Informe valores válidos com até duas casas decimais.');
    }
  }
  if (clean.minimum && clean.maximum && Number(clean.minimum) > Number(clean.maximum)) {
    throw new Error('O valor máximo deve ser igual ou maior que o mínimo.');
  }
  return clean;
}
