# Cambios: obstáculos con colisiones

Resumen de lo que se agregó al proyecto en la versión con obstáculos: qué cambió, cuánto código y cómo encaja con lo que ya existía.

## Qué se agregó, en una frase

Ahora hay **5 chips de circuito** en el escenario y **el robot no puede atravesarlos**: choca con ellos y se desliza por sus bordes.

## Cuánto código y en qué archivos

| Archivo | Cambio | Líneas |
|---|---|---|
| `assets/obstaculo.svg` | **Nuevo.** El dibujo del chip. | +51 |
| `js/game.js` | Lista de chips, funciones de choque, dibujo de chips, tercera imagen. | ≈ +60 (pasa de ~160 a ~220 líneas) |
| `index.html` | Sin cambios. | 0 |
| `css/style.css` | Sin cambios. | 0 |
| `assets/fondo.svg`, `assets/robot-sprite.svg` | Sin cambios. | 0 |

> Todo el cambio está en **la lógica** (`game.js`) y **una imagen nueva**. El HTML y el CSS no se tocaron.

## Qué cambió dentro de `game.js`

| Parte | Antes | Ahora |
|---|---|---|
| **2. Ajustes** | Solo tamaños del robot y velocidad. | Más tamaño de los pies (`CAJA_*`), tamaño de los chips (`OBSTACULO_*`) y la **lista `obstaculos`** con las 5 posiciones. |
| **4. Imágenes** | 2 imágenes (fondo y robot). | 3 imágenes: se suma `imagenObstaculo`. |
| **6. Límites y colisiones** | No existía como parte separada. | **Nueva.** Tres funciones: `fueraDelCanvas`, `chocaConObstaculo` y `puedeIr`. |
| **7. Movimiento** | Movía primero y después corregía si se salía del borde. | **Primero pregunta `puedeIr`, y solo mueve si está permitido.** Revisa horizontal y vertical por separado. |
| **9. Dibujo** | Borrar → fondo → robot. | Borrar → fondo → **chips** → robot. |
| **10. Arranque** | Esperaba 2 imágenes. | Espera **3** imágenes. |

## Cómo se relacionan las piezas

```
             obstaculos (lista de 5 posiciones)
              │                         │
              ▼                         ▼
   chocaConObstaculo()             dibujar()
              │                    pinta el chip en cada posición
              ▼
  fueraDelCanvas() ──► puedeIr() ◄── "¿puede ir aquí?"
                          │
                          ▼
                   moverPersonaje() ── decide si mueve y pone seMueve
                          │
                          ▼
                   animarSprite()  ── si seMueve: camina; si no: reposo
```

- **La lista `obstaculos` se usa en dos lugares:** para **chocar** (`chocaConObstaculo`) y para **dibujar** (`dibujar`). Como usan la misma lista y los mismos tamaños, **lo que se ve es exactamente lo que choca**.
- **`puedeIr` junta las dos reglas** (no salirse y no chocar). `moverPersonaje` solo le pregunta a ella.
- **`seMueve` conecta el movimiento con la animación:** si el robot quedó bloqueado, no se movió, así que se muestra la pose de reposo.

## Cómo funciona el choque (corto)

1. **Solo chocan los pies.** El robot se dibuja a 72 × 72, pero para chocar se usa una caja de 48 × 40 en la parte de abajo. Así la cabeza puede pasar por delante de un chip, como en los juegos vistos desde arriba.
2. **Dos rectángulos chocan** si se cruzan **en horizontal y en vertical a la vez**.
3. **Se revisa antes de mover.** Si la nueva posición choca o se sale del lienzo, el robot no se mueve en esa dirección.
4. **Horizontal y vertical por separado.** Yendo en diagonal contra un chip, el robot sigue avanzando por el lado libre y se desliza por el borde.

## Qué corregí de la versión de Oscar

| Problema | Corrección |
|---|---|
| La lista de chips tenía **comas sobrantes** (`},  , {`). JavaScript las tomaba como "huecos": la lista medía 7 pero tenía 5 chips. | La lista quedó limpia, con 5 chips y una coma entre cada uno. |
| Los chips se declaraban **al final del archivo**, lejos de donde se usaban. | Ahora están en la parte 2, junto a los demás ajustes. |
| Se movía, se revisaba el choque y **después** se corregía el borde: dos reglas en lugares distintos. | Una sola pregunta, `puedeIr`, revisa **las dos** reglas antes de mover. |
| Contra el **borde del lienzo** el robot "caminaba en el sitio", pero contra un chip no: se comportaba distinto. | Ahora se detiene igual en los dos casos y muestra la pose de reposo. |
| `obstaculo.svg` decía que medía 120 × 84 "igual que su caja de colisión", pero en el código el chip mide 100 × 70. | Se corrigió el comentario. |
| `.gitignore` tenía `README.md`, así que la documentación **no se subía**. | No se copió: el README y las explicaciones sí están en el repo. |
| Nombres poco claros (`dx`, `dy`, `spriteObstaculo`). | `pasoX`, `pasoY`, `imagenObstaculo`. |

## Pruebas realizadas

| Prueba | Resultado |
|---|---|
| Aparecen el fondo, los 5 chips y el robot | ✅ |
| Choca con un chip y se detiene justo en el borde del chip | ✅ |
| En diagonal contra un chip, se desliza por el lado libre | ✅ |
| Se detiene en los 4 bordes del lienzo (x de 0 a 568, y de 0 a 328) | ✅ |
| Bloqueado (por chip o borde) muestra la pose de reposo | ✅ |
| Caminando cambia de pose: 1 → 2 → 3 → 0 | ✅ |
| Sin errores en la consola | ✅ |
