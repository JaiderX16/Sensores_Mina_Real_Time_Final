import React from "react";

const Metric = ({ label, unit, value, color = "#3b82f6" }) => {
  // Asegurar que el valor sea numérico y truncar a 2 decimales
  const numericValue = typeof value === 'number' ? value : parseFloat(value);
  const displayValue = (Math.trunc(numericValue * 100) / 100).toFixed(2);
  const normalizedValue = numericValue / 100;

  return (
    <>
      <style>
        {`
          .metric {
            width: 100%;
            max-width: 250px;
            font-family: "Roboto", sans-serif;
            font-size: 32px;
            color: white;
          }

          .metric__body {
            width: 100%;
            height: 0;
            padding-bottom: 50%;
            background: #b4c0be;
            position: relative;
            border-top-left-radius: 100% 200%;
            border-top-right-radius: 100% 200%;
            overflow: hidden;
          }

          .metric__fill {
            position: absolute;
            top: 100%;
            left: 0;
            width: inherit;
            height: 100%;
            transform-origin: center top;
            transition: transform 0.2s ease-out;
          }

          .metric__cover {
            width: 75%;
            height: 150%;
            background: #1f2937;
            border-radius: 50%;
            position: absolute;
            top: 25%;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding-bottom: 13%;
            box-sizing: border-box;
          }
        `}
      </style>

      <div className="metric">
        <div className="metric__body">
          <div
            className="metric__fill"
            style={{
              transform: `rotate(${normalizedValue / 2}turn)`,
              background: color,
            }}
          />
          <div className="metric__cover font-bold">
            {displayValue} {/* Muestra valor truncado con 2 decimales */}
            {""}
            {unit}
          </div>
        </div>
      </div>
    </>
  );
};

export default Metric;
      

