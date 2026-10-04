# Plan Técnico: [NNN-nombre-feature]

- **Spec Asociada:** [`spec.md`](spec.md)
- **Estado:** borrador | aprobado
- **Fecha:** <YYYY-MM-DD>

---

## 🏗️ 1. Arquitectura y Responsabilidades de Archivos

### Archivos Existentes a Modificar:
| Archivo | Responsabilidad / Modificación |
| :--- | :--- |
| `src/...` | <Descripción del ajuste> |

### Nuevos Archivos a Crear:
| Archivo | Capa / Módulo | Responsabilidad |
| :--- | :--- | :--- |
| `src/types/...` | Tipado / DTO | Contratos de datos e interfaces |
| `src/store/...` | Estado (Zustand) | Máquina de estados y acciones |
| `src/components/...` | UI (React) | Componente interactivo / Vista |

---

## 📊 2. Impacto en Tipos y Datos
- **Interfaces / DTOs:** Definición de nuevos tipos en `src/types/`.
- **Persistencia:** Estructura en `localStorage` o tabla en Supabase (`leaderboard`, `app_errors`).

---

## 🧮 3. Funciones Puras y Determinismo
- **Lógica de Dominio:** Funciones deterministas de cálculo de aciertos, pistas o comparaciones desacopladas de componentes de React.
- **Inyección de Semillas:** Asegurar paso de parámetros para PRNG o fechas fijas para facilitar verificación.

---

## 🏝️ 4. Arquitectura de Estado e Islas
- **Isla Astro:** Componente React contenedor y directiva de hidratación (`client:load`, `client:visible`, `client:only="React"`).
- **Manejo de Estado:** Store Zustand (con o sin `createGameStore`) vs Nanostores (`$playerName`).
- **Capa de Persistencia:** Métodos de repositorio requeridos (`dailyStorageRepository`, `scoreRepository`, etc.).

---

## 🎨 5. Theming y Estilos (Tailwind CSS v4)
- Integración con `@theme` o soporte temático mediante `[data-theme="..."]`.
- Clases de utilidad Tailwind y animaciones Framer Motion si aplica.

---

## 📐 6. Contratos de Interfaz (TypeScript)
```typescript
// Contratos de interfaces principales
export interface FeatureData {
  id: string;
  // ...
}
```

---

## ⚖️ 7. Decisiones Técnicas Justificadas
| Decisión Técnica | Alternativa Descartada | Justificación |
| :--- | :--- | :--- |
| <Opción elegida> | <Opción alternativa> | <Motivo de la elección> |

---

## 🧪 8. Estrategia de Verificación y Pruebas
| Requisito Funcional | Estrategia de Verificación | Criterio de Éxito |
| :--- | :--- | :--- |
| **RF-1** | Verificación técnica / build | <Comprobación esperada> |
| **RF-2** | Verificación de renderizado | <Comprobación esperada> |

- **Verificación Técnica Global:** `npm run build` sin errores de TypeScript ni empaquetado.
- **Verificación Responsive:** Inspección en viewport móvil estándar (375px) y escritorio.
