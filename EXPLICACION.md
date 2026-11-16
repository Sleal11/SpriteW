# Cómo funciona el proyecto

## En una frase

Un robot camina por un escenario con obstáculos. **JavaScript lo dibuja 25 veces por segundo**, y en cada dibujo cambia un poquito su posición y su pose. Eso hace que parezca que camina.

## Los archivos

| Archivo | Qué hace |
|---|---|
| `index.html` | Pone en la página un recuadro vacío llamado **canvas** (un lienzo para dibujar). |
| `css/style.css` | Solo decora: centra el lienzo, le pone borde y colores. |
| `js/game.js` | **Todo lo importante.** Dibuja, mueve, anima y hace chocar al robot. |
| `assets/` | Las 3 imágenes: el fondo, el robot y el chip (obstáculo). |

---

# `game.js` paso a paso

El archivo está dividido en 10 partes. Vamos una por una.

## 1. El lienzo y el pincel

```js
const canvas = document.getElementById('escenario');
const ctx = canvas.getContext('2d');
```

- `canvas` es **la hoja**: el recuadro que está en el HTML.
- `ctx` es **el pincel**: con él dibujamos en esa hoja.

> Todo lo que se dibuja pasa por `ctx`.

---

## 2. Los ajustes y el mapa

Son números que no cambian. Están arriba para poder ajustarlos fácilmente:

| Nombre | Valor | Qué significa |
|---|---|---|
| `TAMANO_FRAME` | 48 | Cada dibujito del robot en la imagen mide 48 × 48 píxeles. |
| `TAMANO_PERSONAJE` | 72 | En pantalla lo dibujamos más grande: 72 × 72. |
| `CAJA_ANCHO`, `CAJA_ALTO` | 48, 40 | Tamaño de la **zona de los pies**, la parte que choca (ver parte 6). |
| `OBSTACULO_ANCHO`, `OBSTACULO_ALTO` | 100, 70 | Tamaño de cada chip. |
| `VELOCIDAD` | 4 | Cada vez que se actualiza, el robot avanza 4 píxeles. |
| `INTERVALO` | 40 | Cada 40 milésimas de segundo se vuelve a dibujar todo (25 veces por segundo). |
| `ACTUALIZACIONES_POR_FRAME` | 4 | Cada 4 dibujos, el robot cambia de pose. |
| `COLUMNA_REPOSO` | 1 | La pose que se usa cuando está quieto. |
| `TOTAL_COLUMNAS` | 4 | Hay 4 poses por dirección. |
| `FILAS` | | Qué fila de la imagen usar según hacia dónde mira. |

### El mapa de obstáculos

```js
const obstaculos = [
  { x: 80,  y: 32 },  { x: 480, y: 32 },   // fila de arriba
  { x: 160, y: 160 },                      // fila del medio
  { x: 80,  y: 288 }, { x: 460, y: 288 },  // fila de abajo
];
```

Es **una lista de 5 chips**. De cada uno solo guardamos **dónde está** (su esquina de arriba a la izquierda). El tamaño es el mismo para todos, así que no hace falta repetirlo.

> Para agregar o mover un chip, solo se cambia esta lista.

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
const fondo = new Image();            fondo.src = 'assets/fondo.svg';
const sprite = new Image();           sprite.src = 'assets/robot-sprite.svg';
const imagenObstaculo = new Image();  imagenObstaculo.src = 'assets/obstaculo.svg';
```

Preparamos **3 imágenes**: el fondo, el robot y el chip. Todavía no se dibujan.

> El chip es **una sola imagen** que se dibuja **5 veces** en distintos lugares.

---

## 5. El teclado

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

- `teclaADireccion` **traduce** la tecla: ↑ o W → `'arriba'`, etc. Si la tecla no sirve, devuelve `null` ("nada").
- **`keydown`** ocurre al **apretar**: anotamos `true`.
- **`keyup`** ocurre al **soltar**: anotamos `false`.
- `preventDefault()` evita que las flechas muevan la página.

> 💡 **Aquí el robot no se mueve.** Solo anotamos qué teclas están apretadas, como una lista. El movimiento ocurre en la parte 7.

---

## 6. Límites y colisiones: ¿puede ir ahí?

Son **3 preguntas pequeñas**, cada una en su función.

### a) ¿Se saldría del lienzo?

```js
function fueraDelCanvas(nuevoX, nuevoY) {
  return nuevoX < 0 ||
         nuevoY < 0 ||
         nuevoX > canvas.width - TAMANO_PERSONAJE ||
         nuevoY > canvas.height - TAMANO_PERSONAJE;
}
```

Responde **sí** si el robot se pasaría de algún borde.

**¿Por qué restamos 72?** Porque `x` e `y` marcan la **esquina de arriba a la izquierda** del robot. El último lugar donde cabe completo es 640 − 72 = **568**.

```
0                                    568   640
|------------------------------------|[🤖]|
                                       72px
```

### b) ¿Chocaría con un chip?

```js
function chocaConObstaculo(nuevoX, nuevoY) {
  const pies = {
    x: nuevoX + (TAMANO_PERSONAJE - CAJA_ANCHO) / 2,
    y: nuevoY + (TAMANO_PERSONAJE - CAJA_ALTO),
  };

  return obstaculos.some((obstaculo) =>
    pies.x < obstaculo.x + OBSTACULO_ANCHO &&
    pies.x + CAJA_ANCHO > obstaculo.x &&
    pies.y < obstaculo.y + OBSTACULO_ALTO &&
    pies.y + CAJA_ALTO > obstaculo.y
  );
}
```

**Paso 1: la caja de los pies.** No usamos el dibujo entero del robot, solo un rectángulo en la **parte de abajo** (48 × 40). Así la cabeza puede pasar "por delante" de un chip, como en los juegos vistos desde arriba, y el choque se siente natural.

```
┌────────┐
│  🤖    │   ← dibujo de 72 × 72
│ ┌────┐ │
│ │pies│ │   ← caja de choque de 48 × 40
└─┴────┴─┘
```

**Paso 2: ¿se encima con algún chip?** `some` revisa la lista de chips y responde **sí** si **al menos uno** se encima.

Dos rectángulos se enciman **solo si se cruzan en las dos direcciones a la vez**:
- **En horizontal:** los pies empiezan antes de que termine el chip, **y** terminan después de que empiece el chip.
- **En vertical:** lo mismo, de arriba abajo.

```
 se cruzan en horizontal y vertical → CHOCAN     solo en horizontal → NO chocan
   ┌──────┐                                         ┌──────┐
   │ chip │                                         │ chip │
   │   ┌──┼───┐                                     └──────┘
   └───┼──┘   │                                        ┌──────┐
       │ pies │                                        │ pies │
       └──────┘                                        └──────┘
```

### c) Juntando las dos

```js
function puedeIr(nuevoX, nuevoY) {
  return !fueraDelCanvas(nuevoX, nuevoY) && !chocaConObstaculo(nuevoX, nuevoY);
}
```

**El robot puede ir a un lugar solo si no se sale del lienzo y no choca con un chip.** (El `!` significa "no".)

---

## 7. Mover al robot

```js
function moverPersonaje() {
  seMueve = false;

  let pasoX = 0;
  let pasoY = 0;

  if (teclas.arriba)    { pasoY -= VELOCIDAD; direccion = 'arriba'; }
  if (teclas.abajo)     { pasoY += VELOCIDAD; direccion = 'abajo'; }
  if (teclas.izquierda) { pasoX -= VELOCIDAD; direccion = 'izquierda'; }
  if (teclas.derecha)   { pasoX += VELOCIDAD; direccion = 'derecha'; }

  if (pasoX !== 0 && puedeIr(x + pasoX, y)) {
    x += pasoX;
    seMueve = true;
  }

  if (pasoY !== 0 && puedeIr(x, y + pasoY)) {
    y += pasoY;
    seMueve = true;
  }
}
```

1. Suponemos que **no se mueve**.
2. Según las teclas, calculamos **cuánto quiere moverse**: `pasoX` (izquierda/derecha) y `pasoY` (arriba/abajo). También anotamos hacia dónde mira.
3. **Antes de mover, preguntamos `puedeIr`.** Si la respuesta es sí, lo movemos y marcamos que se mueve. Si es no, se queda donde está.

**¿Por qué revisar cada dirección por separado?** Si vas en diagonal (↑ y ←) y un chip te bloquea hacia la izquierda, **igual puedes seguir subiendo**. El robot "se desliza" por el borde del chip en vez de quedarse pegado.

> Si el robot está bloqueado (por un borde o un chip), `seMueve` queda en **falso** y se muestra la pose de reposo. Así no "camina en el sitio" contra la pared.

---

## 8. Animar (cambiar de pose)

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

**Si está quieto:** se pone la pose de reposo (columna 1).

**Si se mueve:** cuenta; cada 4 dibujos **pasa a la siguiente pose**. Si cambiara en cada dibujo, el robot parecería correr desesperado.

**¿Qué hace el `%`?** Hace que, al pasar de 3, la cuenta **vuelva a 0**, como un reloj:

```
columna:  0 → 1 → 2 → 3 → 0 → 1 → 2 → 3 → 0 ...
```

---

## 9. Dibujar

```js
function dibujar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);                 // 1) borrar

  ctx.drawImage(fondo, 0, 0, canvas.width, canvas.height);           // 2) fondo

  obstaculos.forEach((obstaculo) => {                                // 3) chips
    ctx.drawImage(imagenObstaculo, obstaculo.x, obstaculo.y, OBSTACULO_ANCHO, OBSTACULO_ALTO);
  });

  const recorteX = columna * TAMANO_FRAME;                           // 4) robot
  const recorteY = FILAS[direccion] * TAMANO_FRAME;
  ctx.drawImage(
    sprite,
    recorteX, recorteY, TAMANO_FRAME, TAMANO_FRAME,
    x, y, TAMANO_PERSONAJE, TAMANO_PERSONAJE
  );
}
```

Siempre en este orden, **como capas de pintura**:

1. **Borrar todo.** El lienzo es pintura: si no borramos, queda un rastro de robots.
2. **El fondo**, completo.
3. **Los chips:** `forEach` recorre la lista y pinta la misma imagen en la posición de cada uno.
4. **El robot**, pero **solo un cuadrito** de su imagen:

```
ctx.drawImage( imagen,   recorteX, recorteY, 48, 48,      x, y, 72, 72 )
                         └─ qué cuadrito recorto ─┘        └─ dónde lo pego y de qué tamaño ─┘
```

Es como **recortar una figurita** de una hoja y pegarla en el lienzo.

> ⚠️ **El orden importa:** el robot va al final para que quede **encima** de todo.

---

## 10. Repetir todo sin parar

```js
function actualizar() {
  moverPersonaje();
  animarSprite();
  dibujar();
}

let imagenesCargadas = 0;

function imagenLista() {
  imagenesCargadas++;
  if (imagenesCargadas === 3) {
    setInterval(actualizar, INTERVALO);
  }
}

fondo.onload = imagenLista;
sprite.onload = imagenLista;
imagenObstaculo.onload = imagenLista;
```

- `actualizar` hace los 3 pasos juntos: **mover → animar → dibujar**.
- `onload` avisa cuando una imagen **terminó de cargar**. Cuando **las 3** están listas, arrancamos.
- **`setInterval(actualizar, 40)`**: *"ejecuta `actualizar` cada 40 milésimas de segundo, para siempre"* → **25 veces por segundo**.

---

# Todo junto: qué pasa cuando aprietas ←

```
1. Aprietas ←
        ↓
2. keydown anota en la lista: izquierda = true
        ↓
3. Cada 40 ms se ejecuta actualizar():
        ↓
   a) moverPersonaje():  quiere ir 4 px a la izquierda
                         ¿puedeIr? → ¿se sale? ¿choca con un chip?
                         sí puede → x baja 4, seMueve = true
                         no puede → se queda, seMueve = false
        ↓
   b) animarSprite():    si se mueve, cada 4 veces cambia de pose
                         si no, pose de reposo
        ↓
   c) dibujar():         borra → fondo → chips → robot
        ↓
4. Se repite 25 veces por segundo → parece que camina
        ↓
5. Sueltas ← → keyup anota false → pose de reposo
```

---

# Las 6 ideas que debes saber sí o sí

1. **El canvas es una hoja y `ctx` es el pincel.**
2. **El sprite sheet es una imagen con todas las poses.** La fila dice hacia dónde mira y la columna en qué paso va.
3. **Las teclas solo se anotan en una lista.** El movimiento lo hace `moverPersonaje()`.
4. **Antes de mover se pregunta `puedeIr`:** que no se salga del lienzo y que sus pies no se encimen con un chip.
5. **Cada 40 ms: mover → animar → dibujar.** Dibujar es: borrar → fondo → chips → robot.
6. **Dos rectángulos chocan si se cruzan en horizontal y en vertical a la vez.**

# Si el profesor pregunta...

| Pregunta | Respuesta corta |
|---|---|
| ¿Cómo se mueve? | Cada 40 ms reviso qué teclas están apretadas y, si puede ir, sumo o resto 4 a `x` o `y`. |
| ¿Cómo se anima? | Cada 4 dibujos paso a la siguiente pose del sprite sheet. Al pasar de la 3 vuelve a la 0. |
| ¿Cómo sabe si está quieto? | Si no se pudo mover (no hay teclas o está bloqueado), `seMueve` es falso y pongo la pose de reposo. |
| ¿Cómo evitas que se salga? | Antes de moverlo pregunto si la nueva posición queda dentro del lienzo. Si no, no lo muevo. |
| ¿Cómo detectas el choque? | Comparo el rectángulo de los pies con el de cada chip: si se cruzan en horizontal y en vertical, chocan. |
| ¿Por qué solo los pies? | Porque desde arriba lo que "toca el suelo" son los pies. Así la cabeza puede pasar por delante del chip y se ve natural. |
| ¿Por qué revisas X e Y por separado? | Para que, si un lado está bloqueado, pueda seguir por el otro y se deslice por el borde. |
| ¿Por qué hay 5 chips y una sola imagen? | Porque guardo las posiciones en una lista y dibujo la misma imagen en cada posición. |
| ¿Por qué borras el lienzo? | Porque el canvas es pintura; si no lo borro, el robot deja un rastro. |
| ¿Por qué `setInterval`? | Porque es simple: repite la función cada 40 ms y el robot va a la misma velocidad en cualquier computadora. |
