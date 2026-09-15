let datosHoja = {}; // Ej: { "A1": "25", "B3": "Hola" }

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

// ---- Tokenizador ----
function esDigito(caracter) {
  return caracter >= "0" && caracter <= "9";
}

function esLetra(caracter) {
  return (caracter >= "A" && caracter <= "Z") || (caracter >= "a" && caracter <= "z");
}

function tokenizar(formula) {
  let tokens = [];
  let numeroActual = "";
  let inicio = formula.startsWith("=") ? 1 : 0;

  for (let i = inicio; i < formula.length; i++) {
    let caracter = formula[i];

    if (esLetra(caracter)) {
      let referencia = "";
      while (i < formula.length && esLetra(formula[i])) {
        referencia += formula[i].toUpperCase();
        i++;
      }
      while (i < formula.length && esDigito(formula[i])) {
        referencia += formula[i];
        i++;
      }
      tokens.push(referencia);
      i--;
    } else if (esDigito(caracter)) {
      numeroActual = numeroActual + caracter;
    } else {
      if (numeroActual !== "") {
        tokens.push(numeroActual);
        numeroActual = "";
      }
      if (caracter !== " ") {
        tokens.push(caracter);
      }
    }
  }
  if (numeroActual !== "") {
    tokens.push(numeroActual);
  }
  return tokens;
}

// ---- Evaluador ----
function precedencia(operador) {
  if (operador === "+" || operador === "-") return 1;
  if (operador === "*" || operador === "/") return 2;
  return 0;
}

function aplicarOperacion(operador, izquierdo, derecho) {
  switch (operador) {
    case "+": return izquierdo + derecho;
    case "-": return izquierdo - derecho;
    case "*": return izquierdo * derecho;
    case "/": return izquierdo / derecho;
    default: return 0;
  }
}

function evaluar(tokens) {
  let pilaNumeros = [];
  let pilaOperadores = [];

  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];

    if (!isNaN(parseFloat(token)) && isFinite(token)) {
      pilaNumeros.push(parseFloat(token));
    } else if (token === "(") {
      pilaOperadores.push(token);
    } else if (token === ")") {
      while (pilaOperadores.length > 0 && pilaOperadores[pilaOperadores.length - 1] !== "(") {
        let op = pilaOperadores.pop();
        let derecho = pilaNumeros.pop();
        let izquierdo = pilaNumeros.pop();
        let resultado = aplicarOperacion(op, izquierdo, derecho);
        pilaNumeros.push(resultado);
      }
      pilaOperadores.pop();
    } else if (["+", "-", "*", "/"].includes(token)) {
      while (
        pilaOperadores.length > 0 &&
        precedencia(pilaOperadores[pilaOperadores.length - 1]) >= precedencia(token)
      ) {
        let op = pilaOperadores.pop();
        let derecho = pilaNumeros.pop();
        let izquierdo = pilaNumeros.pop();
        let resultado = aplicarOperacion(op, izquierdo, derecho);
        pilaNumeros.push(resultado);
      }
      pilaOperadores.push(token);
    } else {
      // Nivel 6, Parte A: referencia a celda vacía o inexistente -> #REF!
      if (datosHoja[token] === undefined || datosHoja[token].trim() === "") {
        throw new Error("#REF!");
      }
      let valorResuelto = procesarContenidoCelda(datosHoja[token]);
      pilaNumeros.push(Number(valorResuelto));
    }
  }

  while (pilaOperadores.length > 0) {
    let op = pilaOperadores.pop();
    let derecho = pilaNumeros.pop();
    let izquierdo = pilaNumeros.pop();
    let resultado = aplicarOperacion(op, izquierdo, derecho);
    pilaNumeros.push(resultado);
  }

  return pilaNumeros[0];
}

// ---- Rangos y funciones ----
function separarColumnaFila(referencia) {
  let columna = "";
  let filaTexto = "";
  for (let i = 0; i < referencia.length; i++) {
    let caracter = referencia[i];
    if (esLetra(caracter)) {
      columna += caracter.toUpperCase();
    } else if (esDigito(caracter)) {
      filaTexto += caracter;
    }
  }
  return { columna: columna, fila: Number(filaTexto) };
}

function obtenerCeldasEnRango(refInicio, refFin) {
  let inicio = separarColumnaFila(refInicio);
  let fin = separarColumnaFila(refFin);
  let celdas = [];
  for (let f = inicio.fila; f <= fin.fila; f++) {
    celdas.push(inicio.columna + f);
  }
  return celdas;
}

function aplicarFuncionRango(nombreFuncion, celdas) {
  let valores = [];
  for (let i = 0; i < celdas.length; i++) {
    let id = celdas[i];
    let valorTexto = datosHoja[id] || "0";
    let valorResuelto = procesarContenidoCelda(valorTexto);
    let numero = Number(valorResuelto);
    valores.push(isNaN(numero) ? 0 : numero);
  }

  let funcionUpper = nombreFuncion.toUpperCase();
  switch (funcionUpper) {
    case "SUMA": {
      let suma = 0;
      for (let i = 0; i < valores.length; i++) suma += valores[i];
      return suma;
    }
    case "PROMEDIO": {
      if (valores.length === 0) return 0;
      let suma = 0;
      for (let i = 0; i < valores.length; i++) suma += valores[i];
      return suma / valores.length;
    }
    case "MAX":
      return Math.max(...valores);
    case "MIN":
      return Math.min(...valores);
    default:
      return "#NAME?";
  }
}

// ---- Procesar contenido de celda ----
function procesarContenidoCelda(texto) {
  let valorFormateado = texto.trim();

  if (valorFormateado.startsWith("=")) {
    let formula = valorFormateado.slice(1);

    try {
      let posicionParentesis = formula.indexOf("(");

      if (posicionParentesis !== -1) {
        let nombreFuncion = formula.slice(0, posicionParentesis);
        let contenidoParentesis = formula.slice(posicionParentesis + 1, formula.length - 1);
        let partesRango = contenidoParentesis.split(":");
        let refInicio = partesRango[0];
        let refFin = partesRango[1];
        let celdas = obtenerCeldasEnRango(refInicio, refFin);
        return aplicarFuncionRango(nombreFuncion, celdas);
      }

      let tokens = tokenizar(valorFormateado);
      let resultado = evaluar(tokens);

      // Nivel 6, Parte B: fórmula mal escrita -> #ERROR!
      if (resultado === undefined || isNaN(resultado)) {
        return "#ERROR!";
      }
      return resultado;
    } catch (error) {
      return error.message || "#ERROR!";
    }
  }

  return valorFormateado;
}

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