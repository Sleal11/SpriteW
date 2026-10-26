# Sprite animado con Canvas — Registro del proyecto

## PROGRESO DEL PROYECTO

- [x] Fase 1 — Análisis y planificación — **Completada**
- [ ] Fase 2 — Estructura HTML
- [ ] Fase 3 — Canvas y escenario
- [ ] Fase 4 — Personaje y Sprite Sheet
- [ ] Fase 5 — Movimiento mediante teclado
- [ ] Fase 6 — Animación del sprite
- [ ] Fase 7 — Actualización del Canvas
- [ ] Fase 8 — Límites del escenario
- [ ] Fase 9 — Diseño visual y limpieza
- [ ] Fase 10 — Pruebas finales
- [ ] Fase 11 — Preparación para la defensa

## Decisiones de la Fase 1

| Decisión | Elección |
|---|---|
| Dibujo | Todo dentro de un `<canvas>` de 640 × 400 px con contexto 2D |
| Personaje | Sprite sheet propio `assets/robot-sprite.svg` (4 × 4 frames de 48 × 48 px) |
| Fondo | Imagen `assets/fondo.svg` dibujada completa con `drawImage()` |
| Bucle | `setInterval(actualizar, 40)` → 25 actualizaciones por segundo |
| Velocidad | 4 px por actualización |
| Animación | Cambia de frame cada 4 actualizaciones (≈160 ms por frame) |
| Reposo | Columna 1 del sprite sheet (robot con los pies juntos) |
| Dirección | Fila del sprite sheet: 0 abajo, 1 izquierda, 2 derecha, 3 arriba |
| Teclas | Flechas y W A S D |
| Límites | Limitar `x` entre `0` y `canvas.width - ancho`; igual con `y` |

### Estructura de archivos planificada

```
Sprite/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── game.js
└── assets/
    ├── robot-sprite.svg
    └── fondo.svg
```

Se retiran del proyecto anterior: el D-Pad, el monitor, `script.js`, `style.css`
de la raíz y `pbc2.png` (el nuevo fondo lo sustituye).
