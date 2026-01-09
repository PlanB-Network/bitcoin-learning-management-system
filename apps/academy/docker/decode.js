// Helper to safely decode or return a fallback
const safeDecode = (str, fallback) => {
  if (!str) return fallback;
  try {
    return decodeURIComponent(atob(str));
  } catch (_e) {
    // If decoding fails (invalid base64), return the fallback
    return fallback;
  }
};

export default {
  // Replace strings below with your actual default site description/title
  desc: (r) =>
    safeDecode(
      r.variables.desc64,
      "Plan ₿ Academy - Let's build together the Bitcoin educational layer",
    ),

  title: (r) => safeDecode(r.variables.title64, 'Plan ₿ Academy'),
};
