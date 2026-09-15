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
    const idCelda = letraColumna + f;
    td.id = idCelda;

    td.addEventListener("dblclick", function() {
      if (td.querySelector("input")) return;

      const input = document.createElement("input");
      input.type = "text";
      input.value = datosHoja[idCelda] || "";

      td.textContent = "";
      td.appendChild(input);
      input.focus();

      input.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
          datosHoja[idCelda] = input.value;
          td.textContent = procesarContenidoCelda(input.value);
          recalcularTodo();
        }
      });

      input.addEventListener("blur", function() {
        datosHoja[idCelda] = input.value;
        td.textContent = procesarContenidoCelda(input.value);
        recalcularTodo();
      });
    });

    fila.appendChild(td);
  }
  tabla.appendChild(fila);
}
contenedor.appendChild(tabla);



// ---- Recalcular toda la hoja ----
function recalcularTodo() {
  for (let f = 1; f <= TOTAL_FILAS; f++) {
    for (let c = 0; c < TOTAL_COLUMNAS; c++) {
      let letraColumna = String.fromCharCode(65 + c);
      let idCelda = letraColumna + f;

      let td = document.getElementById(idCelda);
      if (!td || td.querySelector("input")) continue;

      let valorGuardado = datosHoja[idCelda];
      if (valorGuardado !== undefined && valorGuardado !== "") {
        td.textContent = procesarContenidoCelda(valorGuardado);
      } else {
        td.textContent = "";
      }
    }
  }
}