
const TOTAL_FILAS = 15;
const TOTAL_COLUMNAS = 10;


const contenedor = document.getElementById("hoja-calculo");


const tabla = document.createElement("table");


const filaEncabezado = document.createElement("tr");


const celdaEsquina = document.createElement("th");
celdaEsquina.textContent = "";
filaEncabezado.appendChild(celdaEsquina);


for (let c = 0; c < TOTAL_COLUMNAS; c++) {
  const th = document.createElement("th");
  th.textContent = String.fromCharCode(65 + c);
  filaEncabezado.appendChild(th);
}


tabla.appendChild(filaEncabezado);



for (let f = 1; f <= TOTAL_FILAS; f++) {
  const fila = document.createElement("tr");

  
  const thNumero = document.createElement("th");
  thNumero.textContent = f;
  fila.appendChild(thNumero);

  
  for (let c = 0; c < TOTAL_COLUMNAS; c++) {
    const td = document.createElement("td");
    
   
    const letraColumna = String.fromCharCode(65 + c);
    td.id = letraColumna + f;
    
    
    fila.appendChild(td);
  }

 
  tabla.appendChild(fila);
}

contenedor.appendChild(tabla);