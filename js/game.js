// =============================================
// 1. CANVAS Y CONTEXTO
// =============================================
const canvas = document.getElementById('escenario');
const ctx = canvas.getContext('2d');

// =============================================
// 2. CONFIGURACIÓN
// =============================================
const TAMANO_FRAME = 48;      // tamaño de cada frame dentro del sprite sheet (px)
const TAMANO_PERSONAJE = 72;  // tamaño con el que dibujamos al robot en el canvas (px)
const VELOCIDAD = 4;          // píxeles que avanza en cada actualización
const INTERVALO = 40;         // milisegundos entre actualizaciones (25 por segundo)
const ACTUALIZACIONES_POR_FRAME = 4; // cada cuántas actualizaciones cambia el frame
const COLUMNA_REPOSO = 1;     // frame que se muestra cuando está quieto
const TOTAL_COLUMNAS = 4;     // frames por fila en el sprite sheet

// Cada dirección corresponde a una fila del sprite sheet
const FILAS = {
  abajo: 0,
  izquierda: 1,
  derecha: 2,
  arriba: 3,
};

// =============================================
// 3. ESTADO DEL PERSONAJE
// =============================================
let x = (canvas.width - TAMANO_PERSONAJE) / 2;  // empieza en el centro
let y = (canvas.height - TAMANO_PERSONAJE) / 2;
let direccion = 'abajo';
let seMueve = false;
let columna = COLUMNA_REPOSO;
let contador = 0;

const teclas = {
  arriba: false,
  abajo: false,
  izquierda: false,
  derecha: false,
};

// =============================================
// 4. IMÁGENES
// =============================================
const fondo = new Image();
fondo.src = 'assets/fondo.svg';

const sprite = new Image();
sprite.src = 'assets/robot-sprite.svg';

// =============================================
// 5. TECLADO
// =============================================
// Convierte la tecla presionada en una dirección (o null si no nos interesa)
function teclaADireccion(tecla) {
  switch (tecla) {
    case 'ArrowUp':    case 'w': case 'W': return 'arriba';
    case 'ArrowDown':  case 's': case 'S': return 'abajo';
    case 'ArrowLeft':  case 'a': case 'A': return 'izquierda';
    case 'ArrowRight': case 'd': case 'D': return 'derecha';
    default: return null;
  }
}

document.addEventListener('keydown', (evento) => {
  const dir = teclaADireccion(evento.key);
  if (dir) {
    evento.preventDefault(); // evita que las flechas desplacen la página
    teclas[dir] = true;
  }
});

document.addEventListener('keyup', (evento) => {
  const dir = teclaADireccion(evento.key);
  if (dir) {
    teclas[dir] = false;
  }
});

// =============================================
// 6. MOVIMIENTO Y LÍMITES
// =============================================
function moverPersonaje() {
  seMueve = false;

  if (teclas.arriba)    { y -= VELOCIDAD; direccion = 'arriba';    seMueve = true; }
  if (teclas.abajo)     { y += VELOCIDAD; direccion = 'abajo';     seMueve = true; }
  if (teclas.izquierda) { x -= VELOCIDAD; direccion = 'izquierda'; seMueve = true; }
  if (teclas.derecha)   { x += VELOCIDAD; direccion = 'derecha';   seMueve = true; }

  // Límites: el personaje no puede salir del canvas
  const maxX = canvas.width - TAMANO_PERSONAJE;
  const maxY = canvas.height - TAMANO_PERSONAJE;

  if (x < 0) x = 0;
  if (y < 0) y = 0;
  if (x > maxX) x = maxX;
  if (y > maxY) y = maxY;
}

// =============================================
// 7. ANIMACIÓN DEL SPRITE
// =============================================
function animarSprite() {
  if (!seMueve) {
    columna = COLUMNA_REPOSO;
    contador = 0;
    return;
  }

  contador++;
  if (contador >= ACTUALIZACIONES_POR_FRAME) {
    contador = 0;
    columna = (columna + 1) % TOTAL_COLUMNAS; // 0 → 1 → 2 → 3 → 0 ...
  }
}

// =============================================
// 8. DIBUJO
// =============================================
function dibujar() {
  // 1) Limpiar el canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 2) Dibujar el fondo completo
  ctx.drawImage(fondo, 0, 0, canvas.width, canvas.height);

  // 3) Recortar el frame actual del sprite sheet y dibujarlo
  const recorteX = columna * TAMANO_FRAME;
  const recorteY = FILAS[direccion] * TAMANO_FRAME;

  ctx.drawImage(
    sprite,
    recorteX, recorteY, TAMANO_FRAME, TAMANO_FRAME,  // qué parte del sprite sheet
    x, y, TAMANO_PERSONAJE, TAMANO_PERSONAJE         // dónde y de qué tamaño en el canvas
  );
}

// =============================================
// 9. ACTUALIZACIÓN PERIÓDICA
// =============================================
function actualizar() {
  moverPersonaje();
  animarSprite();
  dibujar();
}

// Esperamos a que carguen las dos imágenes antes de empezar
let imagenesCargadas = 0;

function imagenLista() {
  imagenesCargadas++;
  if (imagenesCargadas === 2) {
    setInterval(actualizar, INTERVALO);
  }
}

fondo.onload = imagenLista;
sprite.onload = imagenLista;
