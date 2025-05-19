import React, { useState } from 'react'; 
import * as XLSX from 'xlsx'; 
  
export function JsonToExcel({  
  data,  
  fileName = 'datos_exportados',  
  sheetName = 'Hoja1', 
  buttonText = 'Exportar a Excel', 
  includeHeaders = true 
}) { 
  const [exporting, setExporting] = useState(false); 
  
  const exportToExcel = () => { 
    try { 
      // Validar que haya datos para exportar 
      if (!data || data.length === 0) { 
        return; 
      } 
  
      setExporting(true); 
  
      // Crear un libro de trabajo 
      const workbook = XLSX.utils.book_new(); 
        
      // Convertir los datos a una hoja de cálculo 
      const worksheet = XLSX.utils.json_to_sheet(data, { 
        header: includeHeaders ? Object.keys(data[0]) : undefined 
      }); 
      
      // Obtener el rango de celdas
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      
      // Aplicar estilos a las celdas
      // Primero, crear un objeto para almacenar los estilos
      worksheet['!cols'] = [];
      for (let i = 0; i <= range.e.c; i++) {
        worksheet['!cols'].push({ wch: 20 }); // Ancho de columna
      }
      
      // Añadir bordes a todas las celdas y color a los encabezados
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const headerCell = XLSX.utils.encode_cell({ r: range.s.r, c: C });
        
        // Asegurarse de que existe la propiedad !cols
        if (!worksheet['!cols']) worksheet['!cols'] = [];
        
        // Estilo para los encabezados (primera fila)
        if (!worksheet[headerCell].s) worksheet[headerCell].s = {};
        worksheet[headerCell].s = {
          fill: { fgColor: { rgb: "4F81BD" } }, // Color de fondo azul
          font: { color: { rgb: "FFFFFF" }, bold: true }, // Texto blanco y negrita
          border: {
            top: { style: 'thin', color: { rgb: "000000" } },
            bottom: { style: 'thin', color: { rgb: "000000" } },
            left: { style: 'thin', color: { rgb: "000000" } },
            right: { style: 'thin', color: { rgb: "000000" } }
          }
        };
        
        // Aplicar bordes a todas las demás celdas
        for (let R = range.s.r + 1; R <= range.e.r; ++R) {
          const cell = XLSX.utils.encode_cell({ r: R, c: C });
          if (!worksheet[cell]) continue;
          if (!worksheet[cell].s) worksheet[cell].s = {};
          worksheet[cell].s.border = {
            top: { style: 'thin', color: { rgb: "000000" } },
            bottom: { style: 'thin', color: { rgb: "000000" } },
            left: { style: 'thin', color: { rgb: "000000" } },
            right: { style: 'thin', color: { rgb: "000000" } }
          };
        }
      }
        
      // Añadir la hoja al libro
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName); 
        
      // Escribir el archivo y descargarlo
      XLSX.writeFile(workbook, `${fileName}.xlsx`); 
    } catch (error) { 
      console.error("Error al exportar a Excel:", error); 
    } finally { 
      setExporting(false); 
    } 
  }; 
  
  return ( 
    <div className="flex flex-col items-center"> 
      <button 
        onClick={exportToExcel} 
        disabled={exporting || !data || data.length === 0} 
        className={` 
          px-4 py-2 rounded-lg font-medium text-white 
          flex items-center space-x-2 
          transition-colors 
          ${exporting || !data || data.length === 0  
            ? 'bg-gray-500 cursor-not-allowed'  
            : 'bg-green-600 hover:bg-green-500'} 
        `} 
      > 
        {exporting ? ( 
          <> 
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> 
            <span>Exportando...</span> 
          </> 
        ) : ( 
          <> 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> 
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /> 
            </svg> 
            <span>{buttonText}</span> 
          </> 
        )} 
      </button> 
    </div> 
  ); 
}