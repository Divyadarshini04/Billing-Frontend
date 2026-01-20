/**
 * Django Response Parser
 * Handles Django's response format: {data: {...}, success: true}
 * or nested: {data: {products: [...]}, success: true}
 */

export const parseDjangoResponse = (response) => {
  // If response has axios structure
  if (response.data) {
    // Return the data object which contains the actual results
    // Django returns: {data: [...]} or {data: {products: [...]}}
    return response.data;
  }
  return response;
};

/**
 * Extract the actual data from Django's nested response
 * Examples:
 * - {data: {products: [...]}} → returns [...] 
 * - {data: [...]} → returns [...]
 * - response.data.products → returns [...]
 */
export const extractData = (response, key = null) => {
  const parsed = parseDjangoResponse(response);
  
  // If there's a specific key requested (like 'products', 'customers')
  if (key && parsed && typeof parsed === 'object') {
    return parsed[key] || parsed;
  }
  
  return parsed;
};

/**
 * Wrapper for API calls that handles Django response format
 */
export const withDjangoResponse = (apiCall) => {
  return async (...args) => {
    const response = await apiCall(...args);
    return {
      ...response,
      data: parseDjangoResponse(response)
    };
  };
};

/**
 * Common response patterns from Django
 */
export const DjangoResponsePatterns = {
  // Pattern 1: List response
  // {data: [...products...], success: true, message: "..."}
  isList: (data) => Array.isArray(data),
  
  // Pattern 2: Nested response
  // {data: {products: [...], customers: [...]}, success: true}
  isNested: (data) => data && typeof data === 'object' && !Array.isArray(data),
  
  // Pattern 3: Single object
  // {data: {id: 1, name: "Product"}, success: true}
  isSingleObject: (data) => data && typeof data === 'object' && data.id,
};
