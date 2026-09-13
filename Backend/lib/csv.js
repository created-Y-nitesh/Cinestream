/**
 * Chhota RFC-4180 CSV parser — koi npm dependency nahi (cold start fast rehta hai).
 * Quoted fields, embedded commas/newlines aur "" escaping sab handle karta hai.
 */

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  // BOM hata do warna pehla header kharab ho jata hai.
  const input = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char === '\r') {
      // \r\n ka \r ignore — agla loop \n handle kar lega.
    } else {
      field += char;
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((c) => String(c).trim() !== ''));
}

/**
 * Header key ko normalize karta hai: "Drive Link" / "drive-link" / "DRIVE_LINK"
 * sab "drivelink" ban jate hain, taki column naming se farak na pade.
 */
export function normalizeKey(key) {
  return String(key || '')
    .trim()
    .toLowerCase()
    .replace(/[\s\-_.]+/g, '');
}

/**
 * CSV text ko objects ki array me badalta hai (pehli row = header).
 */
export function csvToObjects(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];

  const headers = rows[0].map(normalizeKey);

  return rows.slice(1).map((cells) => {
    const obj = {};
    headers.forEach((header, index) => {
      if (!header) return;
      obj[header] = (cells[index] ?? '').trim();
    });
    return obj;
  });
}

/**
 * Apps Script se aayi JSON rows ko bhi wahi normalized shape me le aata hai.
 */
export function objectsToNormalized(list) {
  if (!Array.isArray(list)) return [];
  return list.map((item) => {
    const obj = {};
    Object.keys(item || {}).forEach((key) => {
      const normalized = normalizeKey(key);
      if (!normalized) return;
      const value = item[key];
      obj[normalized] = value === null || value === undefined ? '' : String(value).trim();
    });
    return obj;
  });
}
