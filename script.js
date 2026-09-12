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
        }
      });

      input.addEventListener("blur", function() {
        datosHoja[idCelda] = input.value;
        td.textContent = procesarContenidoCelda(input.value);
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
      while (
        pilaOperadores.length > 0 &&
        pilaOperadores[pilaOperadores.length - 1] !== "("
      ) {
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
        precedencia(pilaOperadores[pilaOperadores.length - 1]) >=
          precedencia(token)
      ) {
        let op = pilaOperadores.pop();
        let derecho = pilaNumeros.pop();
        let izquierdo = pilaNumeros.pop();
        let resultado = aplicarOperacion(op, izquierdo, derecho);
        pilaNumeros.push(resultado);
      }
      pilaOperadores.push(token);
    } else {
      // ---- NUEVA RAMA: El token es una referencia a celda (ej: "A1") ----
      
      // 1. Buscamos el contenido en datosHoja. Si está vacía/undefined, usamos "0"
      let valorGuardado = datosHoja[token] || "0";

      // 2. Evaluamos su contenido (resuelve tanto valores directos como fórmulas anidadas)
      let valorResuelto = procesarContenidoCelda(valorGuardado);

      // 3. Convertimos a número float y apilamos en pilaNumeros
      pilaNumeros.push(parseFloat(valorResuelto));
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
function procesarContenidoCelda(texto) {
  let valorFormateado = texto.trim();

  if (valorFormateado.startsWith("=")) {
    try {
      let tokens = tokenizar(valorFormateado);
      let resultado = evaluar(tokens);
      return resultado;
    } catch (error) {
      return error.message || "#ERROR!";
    }
  }

  return valorFormateado;
}
// ---- Pruebas ----
console.log(evaluar(tokenizar("3+41*2")));    // esperado: 85
console.log(evaluar(tokenizar("10-2*3")));    // esperado: 4
console.log(evaluar(tokenizar("10-2-3")));    // esperado: 5
console.log(evaluar(tokenizar("(3+4)*2")));   // esperado: 14
console.log(tokenizar("A12+3"));              // esperado: ["A12", "+", "3"]
console.log(tokenizar("A1+B2*2"));            // esperado: ["A1", "+", "B2", "*", "2"]
console.log(tokenizar("A12+3"));              // esperado: ["A12", "+", "3"]
console.log(tokenizar("A1+B2*2"));            // esperado: ["A1", "+", "B2", "*", "2"]
datosHoja["A1"] = "10";
datosHoja["B1"] = "5";
console.log(evaluar(tokenizar("A1+B1*2"))); // esperado: 20 (10 + 5 * 2)