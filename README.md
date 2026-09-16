## Manual de Usuario Básico

Bienvenido a **HojaClara**, una hoja de cálculo web ligera desarrollada con HTML, CSS y JavaScript estructurado.

### 1. Interfaz Principal
- **Cuadrícula de Celdas:** La hoja consta de 15 filas y 10 columnas (de la A a la J).
- **Barra de Entrada / Edición:** Al seleccionar una celda, su valor original o fórmula aparecerá visible para ser editado.

### 2. Formato e Ingreso de Datos
- **Texto y Números:** Haz clic en cualquier celda y escribe directamente texto o valores numéricos (ejemplo: `50`, `Ventas`).
- **Fórmulas:** Para ingresar una fórmula, el contenido **debe iniciar siempre con el signo `=`**.
  - *Ejemplo de Suma:* `=A1+B1`
  - *Ejemplo de Multiplicación:* `=A1*5`
  - *Ejemplo con Operandos Mixtos:* `=A1+B2*2`

### 3. Manejo de Errores
- **`#CIRC!` (Referencia Circular):** Ocurre cuando una celda se referencia a sí misma o entra en un bucle indirecto con otras celdas (ejemplo: escribir `=A1` en la celda `A1`).
- **`#ERROR!` (Error de Sintaxis):** Se muestra cuando una fórmula está mal escrita o tiene caracteres no válidos.

### 4. Cómo Ejecutar el Proyecto
1. Clona el repositorio: `git clone https://github.com/Hajolop/Practica-1.git`
2. Abre el archivo `index.html` en cualquier navegador web moderno (Chrome, Edge, Firefox).# HojaClara - Práctica de curso

## Video Explicativo
En el siguiente enlace se encuentra la demostración en vivo y la explicación técnica del proyecto:
- [Ver Video en Loom](https://www.loom.com/share/444a64613c1349a1a27a679b7c84699b)