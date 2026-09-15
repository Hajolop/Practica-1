


// ---- Pruebas ----
console.log(evaluar(tokenizar("3+41*2")));    // esperado: 85
console.log(evaluar(tokenizar("10-2*3")));    // esperado: 4
console.log(evaluar(tokenizar("10-2-3")));    // esperado: 5
console.log(evaluar(tokenizar("(3+4)*2")));   // esperado: 14
console.log(tokenizar("A12+3"));              // esperado: ["A12", "+", "3"]
console.log(tokenizar("A1+B2*2"));            // esperado: ["A1", "+", "B2", "*", "2"]

datosHoja["A1"] = "10";
datosHoja["B1"] = "5";
console.log(evaluar(tokenizar("A1+B1*2")));   // esperado: 20

console.log(separarColumnaFila("A10"));       // esperado: { columna: "A", fila: 10 }
console.log(obtenerCeldasEnRango("A1", "A5")); // esperado: ["A1","A2","A3","A4","A5"]

datosHoja["A2"] = "20";
datosHoja["A3"] = "30";
console.log(procesarContenidoCelda("=SUMA(A1:A3)"));     // esperado: 60
console.log(procesarContenidoCelda("=PROMEDIO(A1:A3)")); // esperado: 20

console.log(procesarContenidoCelda("=Z99+5"));  // esperado: "#REF!"