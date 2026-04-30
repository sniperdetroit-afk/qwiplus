export async function safeAsync(fn, label = "async") {
  try {
    return await fn();
  } catch (err) {
    console.error("SAFE ASYNC ERROR →", label, err);
    return null;
  }
}