import { useState, useEffect } from "react";

export function DigitalClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString("es-ES", { hour12: false });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex items-center justify-center m-4">
        <div className="max-w-sm w-full flex flex-col items-center justify-center p-4 text-white">
            {/* Título con tamaño responsivo */}
            <div className="text-6xl sm:text-7xl md:text-8xl font-bold">
            {formatTime(time)}
            </div>
            {/* Subtítulo con tamaño responsivo */}
            <div className="text-base sm:text-lg md:text-xl mt-2">
            {formatDate(time)}
            </div>
        </div>
    </div>
  );
}
