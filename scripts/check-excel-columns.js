const XLSX = require('xlsx');
const path = require('path');

// Función para ver las columnas del Excel
function checkExcelColumns() {
  try {
    const filePath = path.join(__dirname, '..', 'FILTROS - Camila tours.xlsx');
    console.log('📖 Leyendo archivo:', filePath);
    
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📊 Total de filas: ${rawData.length}`);
    console.log('\n📋 Columnas del Excel:');
    console.log('='.repeat(50));
    
    if (rawData.length > 0) {
      const columns = Object.keys(rawData[0]);
      columns.forEach((col, index) => {
        console.log(`${index + 1}. "${col}"`);
      });
      
      console.log('\n📄 Primera fila de ejemplo:');
      console.log('='.repeat(50));
      const firstRow = rawData[0];
      columns.forEach(col => {
        const value = firstRow[col];
        const displayValue = value ? String(value).substring(0, 100) + (String(value).length > 100 ? '...' : '') : 'null';
        console.log(`${col}: ${displayValue}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

if (require.main === module) {
  checkExcelColumns();
}

module.exports = { checkExcelColumns };

