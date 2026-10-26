# Sprite animado con Canvas

Proyecto académico de Desarrollo Web I: un robot animado con un **sprite sheet** que camina
dentro de un **`<canvas>`** usando solo HTML, CSS y JavaScript vanilla.

**Cómo ejecutarlo:** abre `index.html` con doble clic en Chrome, Firefox o Edge.
No necesita servidor ni Internet. Mueve al robot con las flechas o con W A S D.

---

## PROGRESO DEL PROYECTO

- Fase 1 — Análisis y planificación — **Completada**
- Fase 2 — Estructura HTML — **Completada**
- Fase 3 — Canvas y escenario — **Completada**
- Fase 4 — Personaje y Sprite Sheet — **Completada**
- Fase 5 — Movimiento mediante teclado — **Completada**
- Fase 6 — Animación del sprite — **Completada**
- Fase 7 — Actualización del Canvas — **Completada**
- Fase 8 — Límites del escenario — **Completada**
- Fase 9 — Diseño visual y limpieza — **Completada**
- Fase 10 — Pruebas finales — **Completada**
- Fase 11 — Preparación para la defensa — **Completada**

---

## Estructura de archivos

```
Sprite/
├── index.html              → estructura: título, <canvas>, instrucciones
├── css/
│   └── style.css           → apariencia de la página (no anima nada)
├── js/
│   └── game.js             → toda la lógica: teclado, movimiento, animación, dibujo
└── assets/
    ├── robot-sprite.svg    → sprite sheet del robot (4 × 4 frames de 48 × 48 px)
    └── fondo.svg           → imagen del escenario (640 × 400 px)
```

`index.html` enlaza `style.css` con `<link>` y `game.js` con `<script>`.
`game.js` busca el canvas con `getElementById('escenario')` y dibuja dentro de él.

---

## Fase 1 — Análisis y planificación

**Objetivo:** decidir qué construir y qué dejar fuera, antes de escribir código.

**Qué tiene el proyecto:** canvas de 640 × 400, fondo, robot con 4 frames por dirección,
movimiento con flechas o WASD, frame de reposo y límites.

**Qué NO tiene:** enemigos, puntos, vida, sonido, menús, físicas, colisiones con objetos,
librerías ni servidor. Del proyecto anterior se quitaron el D-Pad táctil, el monitor
y la animación con CSS, porque no los pide el enunciado y distraen del Canvas.

**Decisión sobre el bucle:** `setInterval(actualizar, 40)`. Es lo más simple de explicar y
la velocidad es la misma en cualquier pantalla (ver la comparación en la defensa).

**Defensa:** *“¿Por qué rehiciste el proyecto?”* → “Antes movía un `div` con CSS; el
objetivo era que yo dibujara cada frame en un Canvas con JavaScript.”

---

## Fase 2 — Estructura HTML

**Objetivo:** crear la página con el lienzo donde ocurrirá todo.

**Concepto:** `<canvas>` es un rectángulo de píxeles vacío; HTML solo lo crea, JavaScript dibuja.

**Archivo:** `index.html`

```html
<canvas id="escenario" width="640" height="400">
  Tu navegador no soporta Canvas.
</canvas>
```

**Explicación:**
- `id="escenario"` permite encontrar el canvas desde JavaScript.
- `width` y `height` se ponen **como atributos**, no en CSS. Son la resolución real del
  lienzo; si solo se cambia con CSS, el dibujo se estira y se ve borroso.
- El texto interno solo aparece si el navegador no soporta Canvas.
- El `<script>` va al final del `<body>` para que el canvas ya exista cuando el JS se ejecuta.

**Prueba:** se ve el título, un recuadro vacío y las instrucciones.

**Posibles errores:** `getElementById` devuelve `null` → el `<script>` está antes del canvas
o el `id` está mal escrito.

**Defensa:** *“¿Por qué el script va al final?”* → “Porque el navegador lee el HTML en orden;
si el script fuera arriba, buscaría un canvas que todavía no existe.”

---

## Fase 3 — Canvas y escenario

**Objetivo:** obtener el “pincel” y dibujar el fondo.

**Concepto:** `getContext('2d')` devuelve el contexto 2D (`ctx`), un objeto con los métodos
para dibujar: `drawImage`, `clearRect`, `fillRect`, etc.

**Archivo:** `js/game.js` (secciones 1, 4 y 8)

```js
const canvas = document.getElementById('escenario');
const ctx = canvas.getContext('2d');

const fondo = new Image();
fondo.src = 'assets/fondo.svg';

ctx.clearRect(0, 0, canvas.width, canvas.height);        // borrar todo
ctx.drawImage(fondo, 0, 0, canvas.width, canvas.height); // fondo completo
```

**Explicación:**
- `new Image()` crea una imagen en memoria; al asignar `src` empieza a cargarse.
- `drawImage(imagen, x, y, ancho, alto)` pega la imagen **completa** en esa posición.
- `clearRect` borra el rectángulo indicado (aquí, todo el canvas).
- El Canvas **no recuerda objetos**, solo píxeles: para “mover” algo hay que borrar
  y volver a dibujar todo.

**Posibles errores:** el fondo no aparece → ruta mal escrita (mira la consola con F12)
o se dibujó antes de que la imagen cargara.

**Defensa:** *“¿Qué es `ctx`?”* → “Es el contexto 2D, el objeto que tiene las funciones
para dibujar en el canvas. El canvas es la hoja; `ctx` es el lápiz.”

---

## Fase 4 — Personaje y Sprite Sheet

**Objetivo:** dibujar un solo frame del robot recortándolo del sprite sheet.

**Conceptos:**
- **Sprite:** imagen de un personaje u objeto de un juego.
- **Sprite sheet:** una imagen con muchos dibujos del sprite ordenados en cuadrícula.
- **Frame:** cada uno de esos dibujos (como un fotograma de una película).

Nuestro sprite sheet (192 × 192 px, frames de 48 × 48):

```
             col 0     col 1     col 2     col 3
            pie izq   reposo    pie der   reposo
fila 0      abajo
fila 1      izquierda
fila 2      derecha
fila 3      arriba
```

**Archivo:** `js/game.js` (secciones 2 y 8)

```js
const recorteX = columna * TAMANO_FRAME;           // columna 2 → 96 px
const recorteY = FILAS[direccion] * TAMANO_FRAME;  // 'derecha' → fila 2 → 96 px

ctx.drawImage(
  sprite,
  recorteX, recorteY, TAMANO_FRAME, TAMANO_FRAME,  // qué parte recorto
  x, y, TAMANO_PERSONAJE, TAMANO_PERSONAJE         // dónde y de qué tamaño lo pego
);
```

**Explicación:** `drawImage` con **9 parámetros** recorta un rectángulo de la imagen
(los 4 primeros números) y lo pega en el canvas (los 4 últimos). Para elegir un frame
basta con multiplicar la columna y la fila por 48. Lo dibujamos a 72 px (×1,5) para que
se vea mejor; como el sprite es SVG (vectorial), no pierde nitidez.

**Posibles errores:**
- Aparecen dos robots o medio robot → el recorte no es múltiplo de 48.
- El robot aparece detrás del fondo → se dibujó antes que el fondo; el orden importa.

**Defensa:** *“¿Por qué un sprite sheet y no 16 imágenes?”* → “Porque es una sola imagen
que se carga una vez; solo cambio qué parte recorto.”

---

## Fase 5 — Movimiento mediante teclado

**Objetivo:** que las flechas o WASD muevan al robot.

**Conceptos:**
- `keydown`: evento cuando se **presiona** una tecla.
- `keyup`: evento cuando se **suelta**.
- `x`, `y`: posición de la esquina superior izquierda del robot. El (0, 0) está arriba
  a la izquierda y Y crece **hacia abajo**.
- `VELOCIDAD`: píxeles que avanza en cada actualización (4).
- `direccion`: hacia dónde mira; decide la fila del sprite sheet.

**Archivo:** `js/game.js` (secciones 3, 5 y 6)

```js
const teclas = { arriba: false, abajo: false, izquierda: false, derecha: false };

document.addEventListener('keydown', (evento) => {
  const dir = teclaADireccion(evento.key);
  if (dir) { evento.preventDefault(); teclas[dir] = true; }
});
document.addEventListener('keyup', (evento) => {
  const dir = teclaADireccion(evento.key);
  if (dir) teclas[dir] = false;
});

function moverPersonaje() {
  seMueve = false;
  if (teclas.arriba)    { y -= VELOCIDAD; direccion = 'arriba';    seMueve = true; }
  if (teclas.abajo)     { y += VELOCIDAD; direccion = 'abajo';     seMueve = true; }
  if (teclas.izquierda) { x -= VELOCIDAD; direccion = 'izquierda'; seMueve = true; }
  if (teclas.derecha)   { x += VELOCIDAD; direccion = 'derecha';   seMueve = true; }
  // ... límites (Fase 8)
}
```

**Explicación:**
- Los eventos **no mueven** al robot; solo anotan qué teclas están presionadas en el
  objeto `teclas`. El movimiento lo hace `moverPersonaje()` en cada actualización.
  Así el movimiento es parejo: `keydown` se repite con retraso, como al mantener
  una letra en un editor, y si moviéramos directamente iría a tirones.
- `teclaADireccion()` traduce `'ArrowUp'`, `'w'` o `'W'` a `'arriba'`, etc.
- `preventDefault()` evita que las flechas hagan scroll en la página.
- Si se presionan dos teclas (por ejemplo ↓ y ←), se suman los dos movimientos y
  el robot va en diagonal sin código extra.

**Posibles errores:**
- WASD no funciona con Bloq Mayús → por eso aceptamos `'w'` y `'W'`.
- La página se desplaza con las flechas → falta `preventDefault()`.

**Defensa:** *“¿Por qué guardas las teclas en un objeto?”* → “Porque así sé en todo
momento qué teclas están presionadas y muevo al robot a ritmo constante en cada
actualización, no cuando el teclado repite la tecla.”

---

## Fase 6 — Animación del sprite

**Objetivo:** que el robot camine al moverse y se quede en reposo al estar quieto.

**Concepto:** animar es mostrar frames distintos uno tras otro, rápido. El ojo los une
y percibe movimiento, igual que en un flipbook.

**Archivo:** `js/game.js` (sección 7)

```js
function animarSprite() {
  if (!seMueve) {
    columna = COLUMNA_REPOSO;   // quieto: frame de reposo
    contador = 0;
    return;
  }
  contador++;
  if (contador >= ACTUALIZACIONES_POR_FRAME) {
    contador = 0;
    columna = (columna + 1) % TOTAL_COLUMNAS;  // 0 → 1 → 2 → 3 → 0 ...
  }
}
```

**Explicación:**
- `seMueve` lo calcula `moverPersonaje()`: es `true` si alguna tecla de dirección está
  presionada.
- **Quieto:** columna 1 (pies juntos).
- **Moviéndose:** cada 4 actualizaciones (4 × 40 ms = 160 ms) pasa a la siguiente
  columna. Si cambiara en cada actualización, el robot parecería correr desesperado.
- El operador `%` (resto de la división) hace que después de 3 vuelva a 0: `4 % 4 = 0`.

**Posibles errores:** la animación va demasiado rápida o lenta → ajustar
`ACTUALIZACIONES_POR_FRAME`.

**Defensa:** *“¿Cómo sabe el programa si el robot está quieto?”* → “En cada
actualización reviso si hay alguna tecla de dirección presionada; si no hay ninguna,
`seMueve` es `false` y dibujo el frame de reposo.”

---

## Fase 7 — Actualización del Canvas

**Objetivo:** repetir mover → animar → dibujar varias veces por segundo.

**Concepto:** `setInterval(funcion, ms)` ejecuta una función cada cierto número de
milisegundos. Con 40 ms son 1000 / 40 = **25 actualizaciones por segundo**.

**Archivo:** `js/game.js` (sección 9)

```js
function actualizar() {
  moverPersonaje();
  animarSprite();
  dibujar();
}

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

**Explicación:**
- Cada 40 ms: se calcula la nueva posición, se elige el frame, se borra el canvas,
  se dibuja el fondo y se dibuja el robot.
- Se necesita actualizar muchas veces por segundo porque el canvas es una imagen
  estática: si no lo redibujamos, nada cambia en pantalla.
- `onload` se dispara cuando una imagen termina de cargar. Contamos las dos imágenes
  y solo entonces arrancamos el intervalo, para no dibujar imágenes vacías.

**Posibles errores:**
- No se ve nada y no hay errores → una imagen no cargó (ruta mal escrita) y el intervalo
  nunca arrancó. Revisa la pestaña *Red* o la consola (F12).
- Rastro de robots → falta `clearRect` antes de dibujar.

**Defensa:** *“¿Qué pasa si cambias 40 por 100?”* → “Se actualizaría solo 10 veces por
segundo: el robot iría más lento y se vería a saltos.”

---

## Fase 8 — Límites del escenario

**Objetivo:** que el robot no salga del canvas.

**Concepto:** la posición mínima es 0 y la máxima es el tamaño del canvas menos el tamaño
del personaje (porque `x`, `y` es su esquina superior izquierda).

```
x mínimo = 0                   x máximo = 640 − 72 = 568
y mínimo = 0                   y máximo = 400 − 72 = 328
```

**Archivo:** `js/game.js` (final de `moverPersonaje()`)

```js
const maxX = canvas.width - TAMANO_PERSONAJE;
const maxY = canvas.height - TAMANO_PERSONAJE;

if (x < 0) x = 0;
if (y < 0) y = 0;
if (x > maxX) x = maxX;
if (y > maxY) y = maxY;
```

**Explicación:** primero se mueve y luego se corrige: si se pasó, se le devuelve al borde.

**Posibles errores:** el robot se sale a medias por la derecha o por abajo → se olvidó
restar `TAMANO_PERSONAJE`.

**Defensa:** *“¿Por qué restas 72?”* → “Porque `x` es la esquina izquierda del robot;
si dejara llegar `x` a 640, el robot entero quedaría fuera del canvas.”

---

## Fase 9 — Diseño visual y limpieza

**Archivo:** `css/style.css`

- `body` con `display: flex` y `flex-direction: column` centra el título, el canvas y
  las instrucciones.
- El canvas tiene borde morado, esquinas redondeadas y una sombra suave.
- `max-width: 100%` evita que el canvas se salga de la pantalla en ventanas pequeñas.
- Las teclas se muestran con `<kbd>`, la etiqueta HTML para teclas.
- Fondo propio `fondo.svg`: una placa de circuito, a juego con el robot.

**Limpieza:** se eliminaron el D-Pad, el monitor, la animación con `@keyframes`,
`script.js`, el `style.css` antiguo y `pbc2.png`. Todas las constantes de ajuste están
juntas al principio de `game.js`.

---

## Fase 10 — Pruebas finales

Probado abriendo `index.html` directamente (`file://`) en Chromium:

| Prueba | Resultado |
|---|---|
| El canvas aparece | ✅ |
| El fondo aparece | ✅ |
| El personaje aparece, centrado en (284, 164) | ✅ |
| Se mueve con flechas y con WASD | ✅ |
| No sale del canvas (se detiene en x = 568, y = 0, y = 328) | ✅ |
| Cambia de frame al moverse (columnas 1 → 2 → 3 → 0) | ✅ |
| Cambia de fila según la dirección | ✅ |
| Al soltar las teclas vuelve al frame de reposo (columna 1) | ✅ |
| Movimiento diagonal con dos teclas | ✅ |
| Sin errores en la consola | ✅ |

**Detalle conocido (aceptable):** si se mantiene una tecla contra un borde, el robot
“camina en el sitio”. Se deja así por simplicidad.

---

## Fase 11 — DEFENSA DEL PROYECTO

### Conceptos clave

- **¿Qué es Canvas?** Un elemento HTML que es un lienzo de píxeles donde JavaScript dibuja.
- **¿Para qué sirve `<canvas>`?** Para gráficos dinámicos: juegos, animaciones, gráficas.
- **¿Qué es el contexto 2D?** El objeto (`ctx`) que tiene los métodos para dibujar en 2D.
- **¿Qué es un sprite?** La imagen de un personaje u objeto.
- **¿Qué es un sprite sheet?** Una imagen con todos los frames del sprite en cuadrícula.
- **¿Qué es un frame?** Cada dibujo individual de la animación.
- **¿Cómo funciona `drawImage()`?** Con 5 parámetros pega una imagen completa (el fondo);
  con 9 recorta un trozo de la imagen y lo pega en el canvas (el robot).
- **¿Cómo se mueve el personaje?** Sumando o restando `VELOCIDAD` a `x` o `y` según las
  teclas presionadas.
- **¿Cómo se detectan las teclas?** Con `keydown` (pongo `true`) y `keyup` (pongo `false`)
  en el objeto `teclas`.
- **¿Cómo se cambia el frame?** Cada 4 actualizaciones sumo 1 a la columna; con `%` vuelve a 0.
- **¿Cómo se actualiza el Canvas?** Cada 40 ms: borrar, dibujar fondo, dibujar robot.
- **¿Qué hace `setInterval()`?** Ejecuta una función repetidamente cada X milisegundos.
- **¿Por qué varias veces por segundo?** Porque el canvas es una imagen fija; para ver
  movimiento hay que redibujarlo constantemente.
- **¿Cómo se evita que salga del Canvas?** Después de mover, si `x` o `y` se pasaron de
  0 o del máximo, los devuelvo al borde.

### `setInterval()` vs `requestAnimationFrame()`

| | `setInterval()` | `requestAnimationFrame()` |
|---|---|---|
| Qué hace | Llama a una función cada X ms fijos | Llama a una función antes de cada refresco de la pantalla |
| Ritmo | El que yo elijo (aquí 25 por segundo) | El de la pantalla (60, 120, 144 Hz...) |
| Velocidad del personaje | Igual en todas las pantallas | Cambia según la pantalla si no se calcula el tiempo transcurrido |
| Pestaña oculta | Sigue ejecutándose (más lento) | Se pausa y ahorra batería |
| Complejidad | Mínima | Mayor si se quiere velocidad constante |

**Cuál usamos:** `setInterval()`.
**Por qué:** es más simple de explicar, la velocidad es igual en cualquier computadora
y 25 actualizaciones por segundo bastan para una animación de 4 frames.
**Cuándo usar el otro:** en un juego real que necesite máxima fluidez y sincronía con la
pantalla, o que deba ahorrar batería.

### Preguntas del profesor

1. **¿Qué hace tu proyecto?**
   “Un robot que camina por un escenario dentro de un canvas. Lo muevo con el teclado y
   cambia de frame mientras camina.”
2. **¿Qué es un canvas?**
   “Un lienzo de píxeles en HTML. Por sí solo está vacío; yo dibujo en él con JavaScript.”
3. **¿Qué es `getContext('2d')`?**
   “Me da el contexto 2D, el objeto con las funciones para dibujar, como `drawImage`.”
4. **¿Por qué el ancho y alto del canvas están en el HTML y no en el CSS?**
   “Porque los atributos fijan la resolución real; con CSS solo se estira y se ve borroso.”
5. **¿Qué es un sprite sheet?**
   “Una sola imagen con todos los frames del personaje en una cuadrícula. Uso una parte
   cada vez.”
6. **¿Cómo eliges qué frame dibujar?**
   “La columna es el paso de la caminata y la fila es la dirección. Multiplico ambas por
   48 y recorto ese cuadro con `drawImage`.”
7. **Explícame los 9 parámetros de `drawImage`.**
   “La imagen, luego 4 números para el recorte (x, y, ancho, alto) y 4 para dónde y a qué
   tamaño lo pego en el canvas.”
8. **¿Cómo se consigue la sensación de movimiento?**
   “Mostrando frames distintos uno tras otro y rápido mientras cambia la posición, como
   en un flipbook.”
9. **¿Cómo detectas las teclas?**
   “Con `keydown` y `keyup`. Guardo en un objeto qué teclas están presionadas.”
10. **¿Por qué no mueves al robot directamente en el `keydown`?**
    “Porque `keydown` se repite con retraso y el movimiento saldría a tirones. Así se mueve
    parejo en cada actualización.”
11. **¿Cómo sabe el programa si el robot está quieto?**
    “Si ninguna tecla de dirección está presionada, `seMueve` es `false` y dibujo el frame
    de reposo.”
12. **¿Por qué la animación no cambia de frame en cada actualización?**
    “Porque serían 25 frames por segundo y parecería que corre. Cambio cada 4 actualizaciones,
    unos 160 ms.”
13. **¿Qué hace el `%` en `(columna + 1) % 4`?**
    “Da el resto de la división; cuando la columna llega a 4, vuelve a 0 y el ciclo se repite.”
14. **¿Qué hace `setInterval(actualizar, 40)`?**
    “Llama a `actualizar` cada 40 milisegundos, o sea 25 veces por segundo.”
15. **¿Por qué hay que borrar el canvas en cada actualización?**
    “Porque el canvas no recuerda objetos, solo píxeles. Si no lo borro, el robot deja un
    rastro.”
16. **¿Por qué dibujas primero el fondo?**
    “Porque se pinta por capas; si dibujara el fondo después, taparía al robot.”
17. **¿Cómo evitas que el robot salga del canvas?**
    “Después de moverlo compruebo si `x` o `y` se pasaron de 0 o del máximo y los dejo en
    el borde.”
18. **¿Por qué el máximo es `canvas.width - 72`?**
    “Porque `x` es la esquina izquierda del robot y el robot mide 72 px.”
19. **¿Por qué esperas el `onload` de las imágenes?**
    “Porque cargan un poco después; si dibujara antes, no saldría nada.”
20. **¿Por qué `setInterval` y no `requestAnimationFrame`?**
    “Es más simple y la velocidad es igual en todas las pantallas. `requestAnimationFrame`
    es mejor para juegos grandes, pero aquí no hacía falta.”

### Explicación final del funcionamiento

```
Usuario presiona una tecla
        ↓
JavaScript detecta la tecla (keydown → teclas.derecha = true)
        ↓
setInterval llama a actualizar() cada 40 ms
        ↓
moverPersonaje(): x += 4, direccion = 'derecha', seMueve = true, aplica límites
        ↓
animarSprite(): como se mueve, cada 4 actualizaciones columna = columna + 1
        ↓
dibujar(): clearRect borra el canvas
        ↓
drawImage dibuja el fondo completo
        ↓
drawImage recorta (columna × 48, fila × 48) del sprite sheet y lo dibuja en (x, y)
        ↓
Se espera la siguiente actualización (40 ms) y se repite
        ↓
Usuario suelta la tecla (keyup → false) → seMueve = false → frame de reposo
```

1. **Tecla:** el usuario presiona →. El evento `keydown` pone `teclas.derecha = true`.
2. **Intervalo:** cada 40 ms `setInterval` ejecuta `actualizar()`.
3. **Movimiento:** `moverPersonaje()` ve `teclas.derecha` en `true`: suma 4 a `x`,
   pone la dirección en `'derecha'` y marca `seMueve = true`. Si `x` pasó de 568,
   lo deja en 568.
4. **Animación:** `animarSprite()` suma 1 al contador; al llegar a 4, avanza la columna.
5. **Limpiar:** `clearRect` borra todo el canvas.
6. **Fondo:** `drawImage(fondo, ...)` pinta el escenario completo.
7. **Personaje:** `drawImage(sprite, ...)` recorta el frame de la columna actual y la
   fila 2 (derecha), y lo pinta en la nueva posición.
8. **Repetir:** 40 ms después todo vuelve a empezar. Como la posición y el frame cambian
   un poco cada vez, se ve al robot caminar.
9. **Soltar:** con `keyup`, `teclas.derecha = false`. En la siguiente actualización
   `seMueve` es `false` y se dibuja el frame de reposo.
