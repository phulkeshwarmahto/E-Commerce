import { useEffect, useState } from "react";

const targetDate = new Date("2026-04-30T23:59:59");

const getDiff = () => {
  const remaining = Math.max(targetDate.getTime() - Date.now(), 0);

  return {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor((remaining / 3600000) % 24),
    minutes: Math.floor((remaining / 60000) % 60),
    seconds: Math.floor((remaining / 1000) % 60),
  };
};

export function useTimer() {
  const [time, setTime] = useState(getDiff);

  useEffect(() => {
    const timer = window.setInterval(() => setTime(getDiff()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return time;
}
