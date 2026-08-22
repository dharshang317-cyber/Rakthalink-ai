/**
 * Security Middleware Suite
 * Sanitizes request parameters and guards against NoSQL injection and parameter tampering.
 */

export const sanitizeInputs = (req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    for (const key of Object.keys(obj)) {
      // Prevent MongoDB NoSQL Query Operator Injections ($gt, $where, $regex in unvalidated objects)
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
        continue;
      }

      if (typeof obj[key] === 'string') {
        // Strip null bytes
        obj[key] = obj[key].replace(/\0/g, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
    return obj;
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
};
