export const brand = {
  name: "CivicGH",
  tagline: "Technology helping communities become better connected.",
};

export const greeting = (now = new Date()) => {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};
