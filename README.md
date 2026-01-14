# Prueba Técnica Individual – Aplicación Web de Asignación Básica de Horarios 📚🕒

Este proyecto consiste en una **aplicación web frontend-only** para asignar horarios académicos respetando reglas básicas de disponibilidad y evitando conflictos. Está desarrollado usando **HTML, CSS y JavaScript Vanilla**, sin frameworks ni librerías externas.

---

## 📝 Objetivo

Desarrollar una **aplicación web del lado del cliente** que:

- Asigne horarios académicos automáticamente.  
- Respete reglas de disponibilidad de docentes y grupos.  
- Detecte conflictos y los muestre de forma clara.  
- Permita visualizar un horario sencillo.

---

## 📌 Alcance

### Incluye

- Modelado de **docentes**, **materias**, **grupos** y **horarios**.  
- Asignación automática básica de clases.  
- Detección de conflictos (docente ocupado, grupo ocupado, materias fuera de disponibilidad).  
- Visualización simple del horario en una tabla.

### No incluye

- Backend ni base de datos.  
- Frameworks o librerías externas.  
- Optimización avanzada de la asignación de horarios.

---

## 📏 Reglas obligatorias

1. Un docente **no puede tener dos clases al mismo tiempo**.  
2. Un grupo **no puede tener dos materias en la misma franja horaria**.  
3. Un docente solo puede impartir **materias que domina**.  
4. Las clases solo pueden asignarse **dentro de la disponibilidad del docente**.  

> Si no es posible asignar una clase, debe indicarse claramente en la interfaz.

---

## 🗂 Modelo de datos mínimo

El proyecto debe definir estructuras para:

- **Docentes**  
- **Materias**  
- **Grupos**  
- **Horarios**  

> La forma de modelar los datos será parte de la evaluación.

---

## 🎨 Interfaz mínima

- Botón: **Generar horario**  
- Tabla o grid mostrando:  
  - Días  
  - Horas  
  - Materia  
  - Docente  

> El diseño visual no es prioritario, pero la información debe ser clara y legible.

---

## ⚙️ Restricciones técnicas

- Solo usar **HTML, CSS y JavaScript Vanilla**.  
- No usar **frameworks** ni **librerías externas**.  
- No usar `eval`.  
- Código debe ser **claro, organizado y comentado**.

---

## 🧰 Uso de Git

- Mantener el **repositorio con historial de commits**.  
- Hacer **commits pequeños y descriptivos**, siguiendo este formato sugerido:

```text
feat: descripción breve
fix: corrección de errores
refactor: reorganización o mejora de código

