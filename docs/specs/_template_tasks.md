# Tareas: [NNN-nombre-feature]

- **Spec Asociada:** [`spec.md`](spec.md)
- **Plan Asociado:** [`plan.md`](plan.md)
- **Estado General:** 0/N completadas

---

## 📋 Lista de Tareas Atómicas (20-30 min por tarea)

- [ ] **T1. Definir tipos, DTOs y modelos de datos.** (Cubre: RF-1)
  - **Archivos:** `src/types/nombreDTO.ts`
  - **Hecho cuando:** Archivo creado, tipos exportados y compilación TypeScript limpia.

- [ ] **T2. Implementar funciones puras y lógica de dominio.** (Cubre: RF-1, RF-2)
  - **Archivos:** `src/utils/nombreLogica.ts`
  - **Hecho cuando:** Funciones de cálculo y algoritmos deterministas implementados y probados.

- [ ] **T3. Implementar o extender métodos en la capa de repositorios.** (Cubre: RF-2)
  - **Archivos:** `src/services/nombreRepository.ts`
  - **Hecho cuando:** Métodos de persistencia implementados sin acoplamiento a componentes UI.

- [ ] **T4. Configurar el estado de dominio en Zustand / Nanostores.** (Cubre: RF-3)
  - **Archivos:** `src/store/useNombreStore.ts`
  - **Hecho cuando:** Store creado con acciones, persistencia y estado reactivo.

- [ ] **T5. Construir los componentes visuales e interactivos en React.** (Cubre: RF-3, RF-4)
  - **Archivos:** `src/components/.../NombreComponent.tsx`
  - **Hecho cuando:** Componentes renderizados con feedback visual, animaciones y diseño responsive.

- [ ] **T6. Integrar en la página / layout de Astro con la directiva de hidratación adecuada.** (Cubre: RF-4)
  - **Archivos:** `src/pages/...`, `src/layouts/...`
  - **Hecho cuando:** Componente montado como isla en Astro y navegable en el entorno local.

- [ ] **T7. Verificación final de build y actualización de progreso.** (Cubre: todos los RFs)
  - **Archivos:** `docs/progress.md`
  - **Hecho cuando:** `npm run build` ejecutado exitosamente al 100% y estado actualizado en `docs/progress.md`.
