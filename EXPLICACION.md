# Cómo funciona el proyecto

## En una frase

Un robot camina por un escenario. **JavaScript lo dibuja 25 veces por segundo**, y en cada dibujo cambia un poquito su posición y su pose. Eso hace que parezca que camina.

## Los 3 archivos

| Archivo | Qué hace |
|---|---|
| `index.html` | Pone en la página un recuadro vacío llamado **canvas** (un lienzo para dibujar). |
| `css/style.css` | Solo decora: centra el lienzo, le pone borde y colores. |
| `js/game.js` | **Todo lo importante.** Dibuja, mueve y anima al robot. |

---

# `game.js` paso a paso

El archivo está dividido en 9 partes. Vamos una por una.

## 1. El lienzo y el pincel

```js
const canvas = document.getElementById('escenario');
const ctx = canvas.getContext('2d');
```

- `canvas` es **la hoja**: el recuadro que está en el HTML.
- `ctx` es **el pincel**: con él dibujamos en esa hoja.

> Todo lo que se dibuja pasa por `ctx`.

---

## 2. Los ajustes

```js
const TAMANO_FRAME = 48;
const TAMANO_PERSONAJE = 72;
const VELOCIDAD = 4;
const INTERVALO = 40;
const ACTUALIZACIONES_POR_FRAME = 4;
const COLUMNA_REPOSO = 1;
const TOTAL_COLUMNAS = 4;

const FILAS = { abajo: 0, izquierda: 1, derecha: 2, arriba: 3 };
```

Son números que no cambian. Están arriba para poder ajustarlos fácilmente:

| Nombre | Valor | Qué significa |
|---|---|---|
| `TAMANO_FRAME` | 48 | Cada dibujito del robot en la imagen mide 48 × 48 píxeles. |
| `TAMANO_PERSONAJE` | 72 | En pantalla lo dibujamos más grande: 72 × 72. |
| `VELOCIDAD` | 4 | Cada vez que se actualiza, el robot avanza 4 píxeles. |
| `INTERVALO` | 40 | Cada 40 milésimas de segundo se vuelve a dibujar todo (25 veces por segundo). |
| `ACTUALIZACIONES_POR_FRAME` | 4 | Cada 4 dibujos, el robot cambia de pose. |
| `COLUMNA_REPOSO` | 1 | La pose que se usa cuando está quieto. |
| `TOTAL_COLUMNAS` | 4 | Hay 4 poses por dirección. |
| `FILAS` | | Qué fila de la imagen usar según hacia dónde mira. |

### La imagen del robot (sprite sheet)

Es **una sola imagen** con todas las poses del robot, ordenadas en una tabla:

```
              columna 0   columna 1   columna 2   columna 3
              (pie izq)   (quieto)    (pie der)   (quieto)
fila 0  ↓     🤖          🤖          🤖          🤖
fila 1  ←     🤖          🤖          🤖          🤖
fila 2  →     🤖          🤖          🤖          🤖
fila 3  ↑     🤖          🤖          🤖          🤖
```

- La **fila** dice **hacia dónde mira** el robot.
- La **columna** dice **en qué paso de la caminata va**.

Cada cuadrito de la tabla se llama **frame**.

---

## 3. Lo que el programa recuerda del robot

```js
let x = (canvas.width - TAMANO_PERSONAJE) / 2;
let y = (canvas.height - TAMANO_PERSONAJE) / 2;
let direccion = 'abajo';
let seMueve = false;
let columna = COLUMNA_REPOSO;
let contador = 0;

const teclas = { arriba: false, abajo: false, izquierda: false, derecha: false };
```

| Variable | Qué guarda |
|---|---|
| `x`, `y` | **Dónde está** el robot. Empieza en el centro. |
| `direccion` | **Hacia dónde mira**: abajo, izquierda, derecha o arriba. |
| `seMueve` | ¿Se está moviendo **ahora mismo**? Sí o no. |
| `columna` | **Qué pose** se dibuja (0, 1, 2 o 3). |
| `contador` | Cuenta los dibujos para saber cuándo cambiar de pose. |
| `teclas` | Qué flechas están **apretadas** en este momento. |

> 📌 **Ojo con las coordenadas:** `x` crece hacia la derecha e `y` crece **hacia abajo**. El punto (0, 0) es la esquina de arriba a la izquierda.

---

## 4. Cargar las imágenes

```js
const fondo = new Image();
fondo.src = 'assets/fondo.svg';

const sprite = new Image();
sprite.src = 'assets/robot-sprite.svg';
```

Le decimos a JavaScript que cargue dos imágenes: el **fondo** y el **robot**. Todavía no las dibuja, solo las prepara.

---

## 5. El teclado

```js
function teclaADireccion(tecla) {
  switch (tecla) {
    case 'ArrowUp':    case 'w': case 'W': return 'arriba';
    case 'ArrowDown':  case 's': case 'S': return 'abajo';
    case 'ArrowLeft':  case 'a': case 'A': return 'izquierda';
    case 'ArrowRight': case 'd': case 'D': return 'derecha';
    default: return null;
  }
}
```

**Traduce** la tecla a una palabra: la flecha ↑ o la W se convierten en `'arriba'`, y así con las demás. Si la tecla no sirve (por ejemplo la Q), devuelve `null`, que significa "nada".

```js
document.addEventListener('keydown', (evento) => {
  const dir = teclaADireccion(evento.key);
  if (dir) {
    evento.preventDefault();
    teclas[dir] = true;
  }
});

document.addEventListener('keyup', (evento) => {
  const dir = teclaADireccion(evento.key);
  if (dir) {
    teclas[dir] = false;
  }
});
```

- **`keydown`** ocurre al **apretar** una tecla: anotamos `true` (apretada).
- **`keyup`** ocurre al **soltarla**: anotamos `false` (suelta).
- `preventDefault()` evita que las flechas muevan la página hacia arriba o abajo.

> 💡 **Lo importante:** aquí el robot **no se mueve**. Solo anotamos qué teclas están apretadas, como una lista. El movimiento ocurre en el paso 6.
>
> **¿Por qué así?** Si mantienes apretada una tecla, la computadora tarda un momento en empezar a repetirla, igual que cuando mantienes una letra en Word. El robot se movería a tirones. Con la lista, se mueve parejo.

---

## 6. Mover al robot

```js
function moverPersonaje() {
  seMueve = false;

  if (teclas.arriba)    { y -= VELOCIDAD; direccion = 'arriba';    seMueve = true; }
  if (teclas.abajo)     { y += VELOCIDAD; direccion = 'abajo';     seMueve = true; }
  if (teclas.izquierda) { x -= VELOCIDAD; direccion = 'izquierda'; seMueve = true; }
  if (teclas.derecha)   { x += VELOCIDAD; direccion = 'derecha';   seMueve = true; }
```

1. Primero suponemos que **no se mueve** (`seMueve = false`).
2. Revisamos la lista de teclas. Por cada tecla apretada:
   - **cambiamos la posición** (sumamos o restamos 4),
   - **anotamos hacia dónde mira**,
   - **marcamos que sí se mueve.**

| Tecla | Qué cambia |
|---|---|
| ↑ arriba | `y` baja 4 (el robot sube) |
| ↓ abajo | `y` sube 4 (el robot baja) |
| ← izquierda | `x` baja 4 |
| → derecha | `x` sube 4 |

> Si aprietas dos teclas (↓ y →), se aplican las dos y el robot va **en diagonal**.

### Que no se salga del lienzo

```js
  const maxX = canvas.width - TAMANO_PERSONAJE;   // 640 - 72 = 568
  const maxY = canvas.height - TAMANO_PERSONAJE;  // 400 - 72 = 328

  if (x < 0) x = 0;
  if (y < 0) y = 0;
  if (x > maxX) x = maxX;
  if (y > maxY) y = maxY;
}
```

Después de moverlo, revisamos si se pasó del borde. **Si se pasó, lo regresamos al borde.**

**¿Por qué restamos 72?** Porque `x` e `y` marcan la **esquina de arriba a la izquierda** del robot. Si `x` llegara a 640, el robot entero quedaría fuera del lienzo. El último lugar donde cabe completo es 640 − 72 = 568.

```
0                                    568   640
|------------------------------------|[🤖]|
                                       72px
```

---

## 7. Animar (cambiar de pose)

```js
function animarSprite() {
  if (!seMueve) {
    columna = COLUMNA_REPOSO;
    contador = 0;
    return;
  }

  contador++;
  if (contador >= ACTUALIZACIONES_POR_FRAME) {
    contador = 0;
    columna = (columna + 1) % TOTAL_COLUMNAS;
  }
}
```

**Si está quieto:** se pone la pose de reposo (columna 1) y no hace nada más.

**Si se mueve:**
1. Suma 1 al contador.
2. Cuando el contador llega a 4, lo reinicia a 0 y **pasa a la siguiente pose**.

**¿Por qué esperar 4?** Si cambiara de pose en cada dibujo (25 veces por segundo), el robot parecería correr desesperado. Esperando 4, cambia de pose más o menos 6 veces por segundo, que parece un paso normal.

**¿Qué hace el `%`?** Hace que, al pasar de 3, la cuenta **vuelva a 0**, como un reloj que después del 12 vuelve al 1:

```
columna:  0 → 1 → 2 → 3 → 0 → 1 → 2 → 3 → 0 ...
```

---

## 8. Dibujar

```js
function dibujar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(fondo, 0, 0, canvas.width, canvas.height);

  const recorteX = columna * TAMANO_FRAME;
  const recorteY = FILAS[direccion] * TAMANO_FRAME;

  ctx.drawImage(
    sprite,
    recorteX, recorteY, TAMANO_FRAME, TAMANO_FRAME,
    x, y, TAMANO_PERSONAJE, TAMANO_PERSONAJE
  );
}
```

Siempre en este orden:

**1. Borrar todo** (`clearRect`).
El lienzo no "mueve" cosas: solo es pintura. Si no borráramos, quedaría un rastro de robots.

**2. Pintar el fondo** (`drawImage` con la imagen completa).

**3. Pintar al robot**, pero **solo un cuadrito** de su imagen:
- Primero calculamos **dónde está ese cuadrito**: columna × 48 y fila × 48.
  - Ejemplo: mirando a la derecha (fila 2), pose 3 → recorte en (144, 96).
- Después, `drawImage` con muchos números significa:

```
ctx.drawImage( imagen,   recorteX, recorteY, 48, 48,      x, y, 72, 72 )
                         └─ qué cuadrito recorto ─┘        └─ dónde lo pego y de qué tamaño ─┘
```

Es como **recortar una figurita** de una hoja y pegarla en el lienzo.

> ⚠️ **El orden importa:** primero el fondo y después el robot. Al revés, el fondo taparía al robot.

---

## 9. Repetir todo sin parar

```js
function actualizar() {
  moverPersonaje();
  animarSprite();
  dibujar();
}
```

`actualizar` hace los 3 pasos juntos: **mover → animar → dibujar**.

```js
let imagenesCargadas = 0;

function imagenLista() {
  imagenesCargadas++;
  if (imagenesCargadas === 2) {
    setInterval(actualizar, INTERVALO);
  }
}

fondo.onload = imagenLista;
sprite.onload = imagenLista;
```

- `onload` avisa cuando una imagen **terminó de cargar**.
- Contamos las imágenes listas. Cuando **las dos** están listas, arrancamos.
- **`setInterval(actualizar, 40)`** significa: *"ejecuta `actualizar` cada 40 milésimas de segundo, para siempre"*. O sea, **25 veces por segundo**.

**¿Por qué esperar a las imágenes?** Si dibujáramos antes de que carguen, no saldría nada en pantalla.

---

# Todo junto: qué pasa cuando aprietas →

```
1. Aprietas →
        ↓
2. keydown anota en la lista: derecha = true
        ↓
3. Cada 40 ms se ejecuta actualizar():
        ↓
   a) moverPersonaje():  x sube 4, mira a la derecha, seMueve = true
                         (si se pasa del borde, lo regresa)
        ↓
   b) animarSprite():    cuenta; cada 4 veces cambia de pose
        ↓
   c) dibujar():         borra → pinta fondo → pinta el cuadrito del robot
        ↓
4. Se repite 25 veces por segundo → parece que camina
        ↓
5. Sueltas →
        ↓
6. keyup anota: derecha = false → seMueve = false → pose de reposo
```

---

# Las 5 ideas que debes saber sí o sí

1. **El canvas es una hoja y `ctx` es el pincel.**
2. **El sprite sheet es una imagen con todas las poses.** La fila dice hacia dónde mira y la columna en qué paso va.
3. **Las teclas solo se anotan en una lista.** El movimiento lo hace `moverPersonaje()`.
4. **Cada 40 ms se hace: mover → animar → dibujar.** Dibujar es siempre: borrar → fondo → robot.
5. **Para no salirse:** si se pasa del borde, se le regresa al borde (máximo = ancho del lienzo − tamaño del robot).

# Si el profesor pregunta...

| Pregunta | Respuesta corta |
|---|---|
| ¿Cómo se mueve? | Cada 40 ms reviso qué teclas están apretadas y sumo o resto 4 a `x` o `y`. |
| ¿Cómo se anima? | Cada 4 dibujos paso a la siguiente pose del sprite sheet. Al pasar de la 3 vuelve a la 0. |
| ¿Cómo sabe si está quieto? | Si no hay ninguna tecla apretada, `seMueve` es falso y pongo la pose de reposo. |
| ¿Por qué borras el lienzo? | Porque el canvas es pintura; si no lo borro, el robot deja un rastro. |
| ¿Qué hace `drawImage` con tantos números? | Recorta un cuadrito de la imagen y lo pega en el lienzo. |
| ¿Por qué `setInterval`? | Porque es simple: repite la función cada 40 ms y el robot va a la misma velocidad en cualquier computadora. |
| ¿Cómo evitas que se salga? | Si `x` o `y` se pasan del borde, los regreso al borde. |
