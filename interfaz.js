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

      td.classList.add("celda-seleccionada");

      const input = document.createElement("input");
      input.type = "text";
      input.value = datosHoja[idCelda] || "";

      td.textContent = "";
      td.appendChild(input);
      input.focus();

      function guardarEdicion() {
        datosHoja[idCelda] = input.value;
        td.textContent = procesarContenidoCelda(input.value, idCelda);
        td.classList.remove("celda-seleccionada");
        recalcularTodo();
        guardarEnLocalStorage();
      }

      input.addEventListener("keydown", function(event) {
        if (event.key === "Enter") guardarEdicion();
      });

      input.addEventListener("blur", guardarEdicion);
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
      let letraColumna = String.fromCharCode(65 + c);
      let idCelda = letraColumna + f;

      let valorGuardado = datosHoja[idCelda];
      let valorAMostrar = "";

      if (valorGuardado !== undefined && valorGuardado !== "") {
        valorAMostrar = procesarContenidoCelda(valorGuardado, idCelda);
      }

      valoresFila.push(valorAMostrar);
    }

    lineas.push(valoresFila.join(","));
  }

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

function limpiarHoja() {
  let confirmar = confirm("¿Seguro que querés borrar toda la hoja? Esta acción no se puede deshacer.");
  if (!confirmar) return;

  datosHoja = {};
  localStorage.removeItem("hojaClaraDatos");
  recalcularTodo();
}

document.addEventListener("DOMContentLoaded", () => {
  let botonExportar = document.getElementById("boton-exportar");
  if (botonExportar) {
    botonExportar.addEventListener("click", exportarCSV);
  }

  let botonLimpiar = document.getElementById("boton-limpiar");
  if (botonLimpiar) {
    botonLimpiar.addEventListener("click", limpiarHoja);
  }
});
