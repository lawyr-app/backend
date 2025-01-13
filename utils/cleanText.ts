const getCleanedText = (text: string) => {
  return text.replace(/\s+/g, " ").trim();
};

export { getCleanedText };
