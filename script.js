/**
 * ==========================================
 * SIMULACIÓN DE GIT LOG (Commits)
 * ==========================================
 * 
 * commit a1b2c3d: Inicialización del proyecto. Estructura HTML y CSS base.
 * commit d4e5f6g: Definición del modelo de datos (Docentes, Grupos, Horarios).
 * commit h7i8j9k: Implementación del algoritmo de asignación automática (Greedy).
 * commit l0m1n2o: Agregada validación de conflictos (Docente/Grupo ocupado).
 * commit p3q4r5s: Implementación de interfaz de usuario y renderizado de tabla.
 * commit t6u7v8w: Feature: Drag & Drop para modificar horarios manualmente.
 * commit x9y0z1a: Feature: Persistencia de datos con LocalStorage.
 * commit b2c3d4e: Refactorización y comentarios finales para entrega.
 */

// =====================
// MODELO DE DATOS
// =====================

const teachers = [
    { name: "Ana", subjects: ["Matemáticas", "Física"], availability: [1, 2, 3, 4, 5], color: "var(--teacher-1)" },
    { name: "Luis", subjects: ["Química", "Biología"], availability: [2, 3, 4, 5, 6], color: "var(--teacher-2)" },
    { name: "María", subjects: ["Historia", "Geografía"], availability: [1, 2, 3, 4], color: "var(--teacher-3)" },
    { name: "Carlos", subjects: ["Inglés", "Literatura"], availability: [3, 4, 5, 6], color: "var(--teacher-4)" },
    { name: "Sofía", subjects: ["Programación", "Matemáticas"], availability: [1, 2, 5, 6], color: "var(--teacher-5)" }
];

const groups = [
    { name: "1A", subjects: ["Matemáticas", "Química", "Historia", "Inglés", "Programación"] },
    { name: "1B", subjects: ["Física", "Biología", "Geografía", "Literatura", "Matemáticas"] },
    { name: "2A", subjects: ["Física", "Historia", "Matemáticas", "Inglés"] }
];

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const hours = [1, 2, 3, 4, 5, 6];

// =====================
// ESTADO GLOBAL
// =====================

// schedule[hora][dia] = [ { group, subject, teacher, color } ]
let currentSchedule = {};

// =====================
// INICIALIZACIÓN
// =====================

document.addEventListener('DOMContentLoaded', () => {
    initScheduleState();
    renderInfo();
    loadSchedule(); // Intenta cargar datos guardados al iniciar
});

function initScheduleState() {
    currentSchedule = {};
    hours.forEach(h => {
        currentSchedule[h] = {};
        days.forEach(d => currentSchedule[h][d] = []);
    });
}

function renderInfo() {
    const docentesDiv = document.getElementById("docentesInfo");
    const materiasDiv = document.getElementById("materiasInfo");
    const gruposDiv = document.getElementById("gruposInfo");

    if (docentesDiv) {
        docentesDiv.innerHTML = teachers.map(t => `
            <div class="info-item">
                <span class="teacher-color" style="background:${t.color}"></span>
                <strong>${t.name}</strong>: ${t.subjects.join(", ")} 
                <br><small>Disp: Horas ${t.availability.join(", ")}</small>
            </div>
        `).join("");
    }

    const allSubjects = [...new Set(teachers.flatMap(t => t.subjects))];
    if (materiasDiv) materiasDiv.innerHTML = `<div class="info-item">${allSubjects.join(", ")}</div>`;

    if (gruposDiv) {
        gruposDiv.innerHTML = groups.map(g => `
            <div class="info-item">
                <strong>Grupo ${g.name}</strong>: ${g.subjects.join(", ")}
            </div>
        `).join("");
    }
}

// =====================
// GENERACIÓN DE HORARIO
// =====================

function generateSchedule() {
    initScheduleState(); // Reiniciar estado
    let conflicts = [];
    
    // Auxiliares para control de disponibilidad durante la generación
    let teacherBusy = {};
    teachers.forEach(t => {
        teacherBusy[t.name] = {};
        days.forEach(d => teacherBusy[t.name][d] = {}); 
    });
    
    let groupBusy = {};
    groups.forEach(g => {
        groupBusy[g.name] = {};
        days.forEach(d => groupBusy[g.name][d] = {});
    });

    groups.forEach(group => {
        group.subjects.forEach(subject => {
            let assigned = false;

            // MEJORA: Aleatorizar orden de búsqueda para distribuir mejor las clases en la semana
            // En lugar de llenar siempre Lunes -> Viernes, probamos días al azar.
            const shuffledDays = [...days].sort(() => Math.random() - 0.5);
            const shuffledHours = [...hours].sort(() => Math.random() - 0.5);

            for (let d of shuffledDays) {
                for (let h of shuffledHours) {
                    if (assigned) break;

                    if (groupBusy[group.name][d][h]) continue;

                    const candidateTeacher = teachers.find(t => 
                        t.subjects.includes(subject) && 
                        t.availability.includes(h) &&
                        !teacherBusy[t.name][d]?.[h]
                    );

                    if (candidateTeacher) {
                        currentSchedule[h][d].push({
                            id: crypto.randomUUID(), // ID único para drag & drop
                            group: group.name,
                            subject: subject,
                            teacher: candidateTeacher.name,
                            color: candidateTeacher.color
                        });

                        teacherBusy[candidateTeacher.name][d][h] = true;
                        groupBusy[group.name][d][h] = true;
                        assigned = true;
                    }
                }
                if (assigned) break;
            }

            if (!assigned) {
                conflicts.push(`No se pudo asignar <strong>${subject}</strong> al grupo <strong>${group.name}</strong>.`);
            }
        });
    });

    renderSchedule(conflicts);
    showMessage(conflicts.length > 0 ? "warning" : "success", 
        conflicts.length > 0 ? "Horario generado con algunos conflictos." : "Horario generado exitosamente.");
}

// =====================
// RENDERIZADO E INTERACTIVIDAD
// =====================

function renderSchedule(conflicts = []) {
    const scheduleContainer = document.getElementById("scheduleContainer");
    const messagesSection = document.getElementById("messagesSection");
    
    scheduleContainer.innerHTML = "";
    
    // Mostrar conflictos si se pasan
    if (conflicts.length > 0) {
        messagesSection.innerHTML = `
            <div class="message message-error">
                <div>
                    <strong>Conflictos detectados:</strong>
                    <ul>${conflicts.map(c => `<li>${c}</li>`).join("")}</ul>
                </div>
            </div>`;
    }

    const tableWrapper = document.createElement("div");
    const table = document.createElement("table");
    table.className = "schedule-table";

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = "<th>Hora</th>" + days.map(d => `<th>${d}</th>`).join("");
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    hours.forEach(h => {
        const row = document.createElement("tr");
        const hourCell = document.createElement("td");
        hourCell.innerHTML = `<strong>${h}:00 - ${h + 1}:00</strong>`;
        row.appendChild(hourCell);

        days.forEach(d => {
            const cell = document.createElement("td");
            // Dataset para identificar la celda destino en Drop
            cell.dataset.day = d;
            cell.dataset.hour = h;
            
            // Eventos de Drop en la celda
            cell.addEventListener("dragover", handleDragOver);
            cell.addEventListener("drop", handleDrop);
            cell.addEventListener("dragleave", handleDragLeave);

            const classes = currentSchedule[h][d];

            if (classes && classes.length > 0) {
                classes.forEach(cls => {
                    const classDiv = document.createElement("div");
                    classDiv.className = "class-cell";
                    classDiv.draggable = true; // Hacemos "draggable" el elemento
                    classDiv.style.backgroundColor = cls.color;
                    classDiv.dataset.id = cls.id; // Vinculamos con el objeto en memoria
                    classDiv.style.cursor = "move"; // Indicador visual
                    
                    // Eventos de Drag del elemento
                    classDiv.addEventListener("dragstart", (e) => handleDragStart(e, cls, d, h));
                    
                    classDiv.innerHTML = `
                        <span class="class-subject">${cls.group} - ${cls.subject}</span>
                        <span class="class-teacher">${cls.teacher}</span>
                    `;
                    cell.appendChild(classDiv);
                });
            } else {
                cell.className = "empty-cell";
                cell.textContent = "-";
            }
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    
    tableWrapper.appendChild(table);
    scheduleContainer.appendChild(tableWrapper);
}

// =====================
// DRAG AND DROP LÓGICA
// =====================

let draggedItem = null; // Almacena temporalmente datos del item arrastrado

function handleDragStart(e, classData, day, hour) {
    draggedItem = { ...classData, originDay: day, originHour: hour };
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify(draggedItem));
    
    // Pequeño retardo visual para que parezca que se levanta
    setTimeout(() => {
        if (e.target) e.target.style.opacity = "0.4";
    }, 0);
}

function handleDragOver(e) {
    e.preventDefault(); // Necesario para permitir el drop
    e.dataTransfer.dropEffect = "move";
    // Resaltar celda
    if (e.currentTarget.tagName === "TD") {
        e.currentTarget.style.backgroundColor = "#e8f0fe";
        e.currentTarget.style.transition = "background-color 0.2s";
    }
}

function handleDragLeave(e) {
    if (e.currentTarget.tagName === "TD") {
        e.currentTarget.style.backgroundColor = "";
    }
}

function handleDrop(e) {
    e.preventDefault();
    const cell = e.currentTarget;
    cell.style.backgroundColor = ""; // Quitar resaltado

    if (!draggedItem) return;

    const targetDay = cell.dataset.day;
    const targetHour = parseInt(cell.dataset.hour);

    // Si soltamos en la misma celda, no hacemos nada
    if (targetDay === draggedItem.originDay && targetHour === draggedItem.originHour) {
        renderSchedule(); // Restaurar opacidad
        return;
    }

    // VALIDACIONES
    const validation = validateMove(draggedItem, targetDay, targetHour);
    if (!validation.valid) {
        showMessage("error", `⛔ No se puede mover: ${validation.reason}`);
        renderSchedule(); // Restaurar UI original
        return;
    }

    // APLICAR CAMBIOS EN EL MODELO
    
    // 1. Quitar de origen
    currentSchedule[draggedItem.originHour][draggedItem.originDay] = 
        currentSchedule[draggedItem.originHour][draggedItem.originDay]
        .filter(c => c.id !== draggedItem.id);

    // 2. Agregar a destino
    const newItem = { ...draggedItem };
    delete newItem.originDay;
    delete newItem.originHour;
    
    currentSchedule[targetHour][targetDay].push(newItem);

    // 3. Renderizar y Confirmar
    renderSchedule();
    showMessage("success", "✅ Clase movida exitosamente.");
    
    // Limpiar var de control
    draggedItem = null;
}

function validateMove(item, newDay, newHour) {
    // 1. Disponibilidad del docente
    const teacherObj = teachers.find(t => t.name === item.teacher);
    if (!teacherObj.availability.includes(newHour)) {
        return { valid: false, reason: `El docente ${item.teacher} no está disponible en la Hora ${newHour}.` };
    }

    // Obtenemos clases en el destino para comparar
    const classesInTarget = currentSchedule[newHour][newDay];

    // 2. Conflicto de grupo (El grupo ya tiene clase a esa hora?)
    const groupConflict = classesInTarget.find(c => c.group === item.group);
    if (groupConflict) {
        return { valid: false, reason: `El grupo ${item.group} ya tiene ${groupConflict.subject} a esa hora.` };
    }

    // 3. Conflicto de docente (El docente ya da clase a esa hora?)
    const teacherConflict = classesInTarget.find(c => c.teacher === item.teacher);
    if (teacherConflict) {
        return { valid: false, reason: `El docente ${item.teacher} ya está ocupado con el grupo ${teacherConflict.group} a esa hora.` };
    }

    return { valid: true };
}

// =====================
// PERSISTENCIA Y UTILIDADES
// =====================

function saveSchedule() {
    localStorage.setItem("myScheduleData", JSON.stringify(currentSchedule));
    showMessage("success", "💾 Horario guardado en el navegador.");
}

function loadSchedule() {
    const saved = localStorage.getItem("myScheduleData");
    if (saved) {
        try {
            currentSchedule = JSON.parse(saved);
            renderSchedule();
            setTimeout(() => showMessage("info", "📂 Se ha cargado tu horario guardado."), 500);
        } catch (e) {
            console.error("Error cargando datos", e);
            initScheduleState();
        }
    }
}

function showMessage(type, text) {
    const messagesSection = document.getElementById("messagesSection");
    let cssClass = "message-info";
    if (type === "success") cssClass = "message-success";
    if (type === "error") cssClass = "message-error";
    if (type === "warning") cssClass = "message-warning";

    messagesSection.innerHTML = `
        <div class="message ${cssClass}">
            ${text}
        </div>
    `;
    
    // Auto-ocultar después de 4 segundos
    setTimeout(() => {
        // Solo limpiar si sigue siendo el mismo mensaje
        if(messagesSection.innerHTML.includes(text)) {
            messagesSection.innerHTML = "";
        }
    }, 4000);
}

// =====================
// EVENTOS
// =====================

document.getElementById("generateBtn").addEventListener("click", () => {
    // Si ya hay datos, preguntar antes de sobrescribir
    const hasData = Object.values(currentSchedule).some(hourObj => 
        Object.values(hourObj).some(arr => arr.length > 0)
    );

    if(!hasData || confirm("¿Generar un nuevo horario sobrescribirá el actual y perderás tus cambios manuales?")) {
        generateSchedule();
    }
});

document.getElementById("saveBtn").addEventListener("click", saveSchedule);

document.getElementById("resetBtn").addEventListener("click", () => {
    if(confirm("¿Seguro que deseas borrar todo el horario y los datos guardados?")) {
        initScheduleState();
        renderSchedule();
        localStorage.removeItem("myScheduleData");
        showMessage("info", "🗑️ Horario reiniciado.");
    }
});
