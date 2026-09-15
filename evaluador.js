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
      // Nivel 6, Parte C: pasamos "token" como idCeldaActual para detectar ciclos
      let valorResuelto = procesarContenidoCelda(datosHoja[token], token);

      // Si la celda referenciada ya devolvió un error, propagarlo
      // en vez de intentar convertirlo a número (evita perder el
      // mensaje específico, como "#CIRC!", detrás de un "#ERROR!" genérico)
      if (typeof valorResuelto === "string" && valorResuelto.startsWith("#")) {
        throw new Error(valorResuelto);
      }

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

// ---- Procesar contenido de celda (con deteccion de referencias circulares) ----
let pilaEvaluacion = [];

function procesarContenidoCelda(texto, idCeldaActual) {
  let valorFormateado = texto.trim();

  if (valorFormateado.startsWith("=")) {
    if (idCeldaActual) {
      if (pilaEvaluacion.includes(idCeldaActual)) {
        throw new Error("#CIRC!");
      }
      pilaEvaluacion.push(idCeldaActual);
    }

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

      if (resultado === undefined || isNaN(resultado)) {
        return "#ERROR!";
      }
      return resultado;
    } catch (error) {
      return error.message || "#ERROR!";
    } finally {
      if (idCeldaActual) {
        let posicion = pilaEvaluacion.indexOf(idCeldaActual);
        if (posicion !== -1) {
          pilaEvaluacion.splice(posicion, 1);
        }
      }
    }
  }

  return valorFormateado;
}