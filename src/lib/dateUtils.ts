export const getISTDateTime = (date: Date | string | null) => {
  if (!date) return "Never";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  return (
    dateObj.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) + " IST"
  );
};

export const isOver30Hours = (date: Date | string | null) => {
  if (!date) return false;
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  return diff > 30 * 60 * 60 * 1000; // 30 hours in milliseconds
};

export const isValidManualDate = (dateString: string) => {
  return !isNaN(Date.parse(dateString));
};
