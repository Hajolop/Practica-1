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
          td.textContent = procesarContenidoCelda(input.value, idCelda);
          recalcularTodo();
          guardarEnLocalStorage();
        }
      });

      input.addEventListener("blur", function() {
        datosHoja[idCelda] = input.value;
        td.textContent = procesarContenidoCelda(input.value, idCelda);
        recalcularTodo();
        guardarEnLocalStorage();
      });
    });

    fila.appendChild(td);
  }
  tabla.appendChild(fila);
}
contenedor.appendChild(tabla);

cargarDesdeLocalStorage();
recalcularTodo();

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
        td.textContent = procesarContenidoCelda(valorGuardado, idCelda);
      } else {
        td.textContent = "";
      }
    }
  }
}
function generarTextoCSV() {
  let lineas = [];

  for (let f = 1; f <= TOTAL_FILAS; f++) {
    let valoresFila = [];

    for (let c = 0; c < TOTAL_COLUMNAS; c++) {
      // TODO 1: Reconstrucción del idCelda
      let letraColumna = String.fromCharCode(65 + c);
      let idCelda = letraColumna + f;

      // TODO 2: Obtención del valor evaluado o string vacío
      let valorGuardado = datosHoja[idCelda];
      let valorAMostrar = "";

      if (valorGuardado !== undefined && valorGuardado !== "") {
        valorAMostrar = procesarContenidoCelda(valorGuardado, idCelda);
      }

      // TODO 3: Agregamos el valor formateado al array de la fila
      valoresFila.push(valorAMostrar);
    }

    // TODO 4: Unimos las columnas de la fila por comas
    let lineaFila = valoresFila.join(",");
    lineas.push(lineaFila);
  }

  // TODO 5: Unimos todas las filas mediante saltos de línea (\n) y retornamos
  return lineas.join("\n");
}
function exportarCSV() {
  let textoCSV = generarTextoCSV();
  let blob = new Blob([textoCSV], { type: "text/csv;charset=utf-8;" });
  let url = URL.createObjectURL(blob);

  let enlace = document.createElement("a");
  enlace.href = url;
  enlace.setAttribute("download", "hoja_de_calculo.csv");

  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

document.addEventListener("DOMContentLoaded", () => {
  let boton = document.getElementById("boton-exportar");
  if (boton) {
    boton.addEventListener("click", exportarCSV);
  }
});
document.addEventListener("DOMContentLoaded", () => {
  // Conexión del botón de exportar CSV
  let botonExportar = document.getElementById("boton-exportar");
  if (botonExportar) {
    botonExportar.addEventListener("click", exportarCSV);
  }

  // TODO 4: Búsqueda y conexión del botón "boton-limpiar"
  let botonLimpiar = document.getElementById("boton-limpiar");
  if (botonLimpiar) {
    botonLimpiar.addEventListener("click", limpiarHoja);
  }
});
function limpiarHoja() {
  let confirmar = confirm("¿Seguro que querés borrar toda la hoja? Esta acción no se puede deshacer.");
  if (!confirmar) return;

  // TODO 1: Vaciar el objeto de datos en memoria
  datosHoja = {};

  // TODO 2: Eliminar el registro persistente de localStorage
  localStorage.removeItem("hojaClaraDatos");

  // TODO 3: Refrescar el DOM para mostrar todas las celdas vacías
  recalcularTodo();
}