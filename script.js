
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
          // Guardar valor en el objeto global
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
// Función auxiliar para validar dígitos
function esDigito(caracter) {
  return caracter >= "0" && caracter <= "9";
}

function tokenizar(formula) {
  let tokens = [];
  let numeroActual = "";
  let inicio = formula.startsWith("=") ? 1 : 0;
  for (let i = inicio; i < formula.length; i++) {
    let caracter = formula[i];
    if (esDigito(caracter)) {
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
function precedencia(operador) {
  if (operador === "+" || operador === "-") {
    return 1;
  }
  if (operador === "*" || operador === "/") {
    return 2;
  }
  return 0;
}

function aplicarOperacion(operador, izquierdo, derecho) {
  switch (operador) {
    case "+":
      return izquierdo + derecho;
    case "-":
      return izquierdo - derecho;
    case "*":
      return izquierdo * derecho;
    case "/":
      return izquierdo / derecho;
    default:
      return 0;
  }
}
function evaluar(tokens) {
  let pilaNumeros = [];
  let pilaOperadores = [];

  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];

    // TODO 1: Si el token es un número
    if (!isNaN(parseFloat(token)) && isFinite(token)) {
      pilaNumeros.push(parseFloat(token));
    } 
    // TODO 2: Si el token es un operador (+, -, *, /)
    else if (["+", "-", "*", "/"].includes(token)) {
      // Mientras haya un operador en la pila con mayor o igual precedencia:
      while (
        pilaOperadores.length > 0 &&
        precedencia(pilaOperadores[pilaOperadores.length - 1]) >= precedencia(token)
      ) {
        let op = pilaOperadores.pop();
        let derecho = pilaNumeros.pop();   // 1er pop() -> operando derecho
        let izquierdo = pilaNumeros.pop(); // 2do pop() -> operando izquierdo
        
        let resultado = aplicarOperacion(op, izquierdo, derecho);
        pilaNumeros.push(resultado);
      }
      // Al terminar las operaciones prioritarias, guardamos el operador actual
      pilaOperadores.push(token);
    }
  }

  // TODO 3: Cierre al terminar el ciclo (procesar operadores sobrantes)
  while (pilaOperadores.length > 0) {
    let op = pilaOperadores.pop();
    let derecho = pilaNumeros.pop();   // 1er pop() -> operando derecho
    let izquierdo = pilaNumeros.pop(); // 2do pop() -> operando izquierdo
    
    let resultado = aplicarOperacion(op, izquierdo, derecho);
    pilaNumeros.push(resultado);
  }

  // El único elemento que queda es el resultado final de la expresión
  return pilaNumeros[0];
}
console.log(evaluar(tokenizar("3+41*2")));   // esperado: 85
console.log(evaluar(tokenizar("10-2*3")));   // esperado: 4
console.log(evaluar(tokenizar("10-2-3")));   // esperado: 5
function evaluar(tokens) {
  let pilaNumeros = [];
  let pilaOperadores = [];

  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];

    if (!isNaN(parseFloat(token)) && isFinite(token)) {
      pilaNumeros.push(parseFloat(token));
    } 
    else if (token === "(") {
      pilaOperadores.push(token);
    } 
    else if (token === ")") {
      while (pilaOperadores.length > 0 && pilaOperadores[pilaOperadores.length - 1] !== "(") {
        let op = pilaOperadores.pop();
        let derecho = pilaNumeros.pop();
        let izquierdo = pilaNumeros.pop();
        let resultado = aplicarOperacion(op, izquierdo, derecho);
        pilaNumeros.push(resultado);
      }
      pilaOperadores.pop();
    } 
    else if (["+", "-", "*", "/"].includes(token)) {
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
console.log(evaluar(tokenizar("(3+4)*2")));   // esperado: 14