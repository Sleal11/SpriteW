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
const CAJA_ANCHO = 48;        // ancho de la caja de choque del robot (zona de los pies)
const CAJA_ALTO = 40;         // alto de la caja de choque del robot
const OBSTACULO_ANCHO = 100;  // tamaño de cada obstáculo (px)
const OBSTACULO_ALTO = 70;
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

// Posición (esquina superior izquierda) de cada obstáculo del escenario
const obstaculos = [
  { x: 80,  y: 32 },  { x: 480, y: 32 },   // fila de arriba
  { x: 160, y: 160 },                      // fila del medio
  { x: 80,  y: 288 }, { x: 460, y: 288 },  // fila de abajo
];

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

const imagenObstaculo = new Image();
imagenObstaculo.src = 'assets/obstaculo.svg';

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
// 6. LÍMITES Y COLISIONES
// =============================================
// ¿El robot en (nuevoX, nuevoY) quedaría fuera del canvas?
function fueraDelCanvas(nuevoX, nuevoY) {
  return nuevoX < 0 ||
         nuevoY < 0 ||
         nuevoX > canvas.width - TAMANO_PERSONAJE ||
         nuevoY > canvas.height - TAMANO_PERSONAJE;
}

// ¿Los pies del robot en (nuevoX, nuevoY) tocarían algún obstáculo?
function chocaConObstaculo(nuevoX, nuevoY) {
  // Caja de choque: más chica que el dibujo, centrada y abajo (en los pies)
  const pies = {
    x: nuevoX + (TAMANO_PERSONAJE - CAJA_ANCHO) / 2,
    y: nuevoY + (TAMANO_PERSONAJE - CAJA_ALTO),
  };

  // Dos rectángulos se tocan si se cruzan en horizontal Y en vertical
  return obstaculos.some((obstaculo) =>
    pies.x < obstaculo.x + OBSTACULO_ANCHO &&
    pies.x + CAJA_ANCHO > obstaculo.x &&
    pies.y < obstaculo.y + OBSTACULO_ALTO &&
    pies.y + CAJA_ALTO > obstaculo.y
  );
}

// El robot solo puede ir a un lugar dentro del canvas y sin obstáculos
function puedeIr(nuevoX, nuevoY) {
  return !fueraDelCanvas(nuevoX, nuevoY) && !chocaConObstaculo(nuevoX, nuevoY);
}

// =============================================
// 7. MOVIMIENTO
// =============================================
function moverPersonaje() {
  seMueve = false;

  // 1) Según las teclas, cuánto quiere moverse en cada eje
  let pasoX = 0;
  let pasoY = 0;

  if (teclas.arriba)    { pasoY -= VELOCIDAD; direccion = 'arriba'; }
  if (teclas.abajo)     { pasoY += VELOCIDAD; direccion = 'abajo'; }
  if (teclas.izquierda) { pasoX -= VELOCIDAD; direccion = 'izquierda'; }
  if (teclas.derecha)   { pasoX += VELOCIDAD; direccion = 'derecha'; }

  // 2) Probar cada eje por separado: si uno está bloqueado, el otro sigue
  //    (así el robot se desliza por el borde de un obstáculo)
  if (pasoX !== 0 && puedeIr(x + pasoX, y)) {
    x += pasoX;
    seMueve = true;
  }

  if (pasoY !== 0 && puedeIr(x, y + pasoY)) {
    y += pasoY;
    seMueve = true;
  }
}

// =============================================
// 8. ANIMACIÓN DEL SPRITE
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
// 9. DIBUJO
// =============================================
function dibujar() {
  // 1) Limpiar el canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 2) Dibujar el fondo completo
  ctx.drawImage(fondo, 0, 0, canvas.width, canvas.height);

  // 3) Dibujar los obstáculos
  obstaculos.forEach((obstaculo) => {
    ctx.drawImage(imagenObstaculo, obstaculo.x, obstaculo.y, OBSTACULO_ANCHO, OBSTACULO_ALTO);
  });

  // 4) Recortar el frame actual del sprite sheet y dibujarlo
  const recorteX = columna * TAMANO_FRAME;
  const recorteY = FILAS[direccion] * TAMANO_FRAME;

  ctx.drawImage(
    sprite,
    recorteX, recorteY, TAMANO_FRAME, TAMANO_FRAME,  // qué parte del sprite sheet
    x, y, TAMANO_PERSONAJE, TAMANO_PERSONAJE         // dónde y de qué tamaño en el canvas
  );
}

// =============================================
// 10. ACTUALIZACIÓN PERIÓDICA
// =============================================
function actualizar() {
  moverPersonaje();
  animarSprite();
  dibujar();
}

// Esperamos a que carguen las tres imágenes antes de empezar
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
