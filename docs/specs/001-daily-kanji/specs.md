# Spec: Daily Kanji [/kanji] (Aprender Japonés)

> **Nota:** La especificación formalizada siguiendo el flujo canónico SDD (`_template.md`) y la sintaxis EARS se encuentra en [`spec.md`](spec.md).

- **Estado:** borrador
- **Fecha:** 2026-10-04
- **Documento Canónico SDD:** [`docs/specs/spec.md`](spec.md)
- **Plan Técnico:** [`docs/specs/plan.md`](plan.md)
- **Lista de Tareas:** [`docs/specs/tasks.md`](tasks.md)

---

## Resumen Ejecutivo de la Spec
1. **Determinismo Diario (Art. I):** Reto unificado para todos los jugadores según fecha local (`YYYY-MM-DD`) empleando `rand-seed`.
2. **Minijuegos por Etapas:**
   - **Etapa 1 (Lectura):** Identificación o escritura de lectura en hiragana (on'yomi/kun'yomi).
   - **Etapa 2 (Significado):** Opción múltiple en español con distractores deterministas.
   - **Etapa 3 (Romanización):** Transcripción fonética a romaji (Hepburn).
   - **Etapa 4 (Trazos):** Práctica interactiva en canvas validando orden y orientación de trazos.
3. **Persistencia y Racha (Art. III):** Manejo desacoplado en `localStorage` mediante repositorio de dominio.
4. **Viralidad:** Modal de victoria con grilla de desempeño y acción "Toque a un amigo" vía Web Share API / WhatsApp fallback.
