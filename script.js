

// =====================
// MODELO DE DATOS
// =====================

const teachers = [
    { name: "Ana", subjects: ["Matemáticas", "Física"], availability: [1, 2, 3, 4, 5, 6], color: "var(--teacher-1)" },
    { name: "Luis", subjects: ["Química", "Biología"], availability: [1, 2, 3, 4, 5, 6], color: "var(--teacher-2)" },
    { name: "María", subjects: ["Historia", "Geografía", "Civismo"], availability: [1, 2, 3, 4, 5], color: "var(--teacher-3)" },
    { name: "Carlos", subjects: ["Inglés", "Literatura", "Artes"], availability: [1, 2, 3, 4, 5, 6], color: "var(--teacher-4)" },
    { name: "Sofía", subjects: ["Programación", "Matemáticas", "Tecnología"], availability: [1, 2, 3, 4, 5, 6], color: "var(--teacher-5)" },
    { name: "Pedro", subjects: ["Educación Física", "Salud"], availability: [1, 2, 3], color: "var(--teacher-6)" }
];

const groups = [
    { name: "1A", subjects: ["Matemáticas", "Química", "Historia", "Inglés", "Programación", "Artes", "Educación Física"] },
    { name: "1B", subjects: ["Física", "Biología", "Geografía", "Literatura", "Matemáticas", "Civismo", "Tecnología"] },
    { name: "2A", subjects: ["Física", "Historia", "Matemáticas", "Inglés", "Programación", "Biología"] },
    { name: "2B", subjects: ["Química", "Literatura", "Artes", "Salud", "Matemáticas", "Historia"] }
];

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const hours = [1, 2, 3, 4, 5, 6];

// Estado global del horario
let currentSchedule = [];
// currentSchedule: Array de { id, group, day, hour, subject, teacher, color }

// Variable para Drag and Drop
let draggedItem = null;

// =====================
// INICIALIZACIÓN
// =====================

document.addEventListener('DOMContentLoaded', () => {
    renderInfo();

    document.getElementById("generateBtn").addEventListener("click", () => {
        if (currentSchedule.length > 0 && !confirm("¿Generar nuevo horario? Se perderán los datos actuales.")) return;
        generateSchedule();
    });

    document.getElementById("resetBtn").addEventListener("click", () => {
        if (!confirm("¿Borrar todo?")) return;
        currentSchedule = [];
        renderSchedule();
        showMessage("info", "Horario reiniciado.");
    });
});

function renderInfo() {
    const docentesDiv = document.getElementById("docentesInfo");
    const materiasDiv = document.getElementById("materiasInfo");
    const gruposDiv = document.getElementById("gruposInfo");

    if (docentesDiv) {
        docentesDiv.innerHTML = teachers.map(t => `
            <div class="info-item">
                <span class="teacher-color" style="background:${t.color}"></span>
                <strong>${t.name}</strong>: ${t.subjects.join(", ")}
                <br><small>Disp: Hrs ${t.availability.join(", ")}</small>
            </div>
        `).join("");
    }

    const allSubjects = [...new Set(teachers.flatMap(t => t.subjects))];
    if (materiasDiv) {
        materiasDiv.innerHTML = `<div class="info-item">${allSubjects.join(", ")}</div>`;
    }

    if (gruposDiv) {
        gruposDiv.innerHTML = groups.map(g => `
            <div class="info-item">
                <strong>Gpo ${g.name}</strong>: ${g.subjects.join(", ")}
            </div>
        `).join("");
    }
}

// =====================
// LÓGICA DE GENERACIÓN
// =====================

function generateSchedule() {
    currentSchedule = [];
    let conflicts = [];

    // Mapas de ocupación para validación rápida
    // busyTeachers[teacherName][day][hour] = true
    const busyTeachers = {};

    // busyGroups[groupName][day][hour] = true
    const busyGroups = {};

    // Inicializar mapas
    teachers.forEach(t => {
        busyTeachers[t.name] = {};
        days.forEach(d => busyTeachers[t.name][d] = {});
    });
    groups.forEach(g => {
        busyGroups[g.name] = {};
        days.forEach(d => busyGroups[g.name][d] = {});
    });

    // Intentamos asignar materias
    // Para maximizar el uso de horas de docentes, ordenamos materias de grupos aleatoriamente
    // pero iteramos exhaustivamente.

    // Crear una lista de tareas: { group, subject }
    let tasks = [];
    groups.forEach(g => {
        g.subjects.forEach(s => tasks.push({ group: g, subject: s }));
    });

    // Mezclar tareas para evitar patrones fijos
    shuffleArray(tasks);

    tasks.forEach(task => {
        const { group, subject } = task;

        // Buscar docentes candidatos
        const candidates = teachers.filter(t => t.subjects.includes(subject));
        shuffleArray(candidates); // Variedad

        let assigned = false;

        // Intentar asignar
        for (const teacher of candidates) {
            if (assigned) break;

            // Buscar un slot (Día/Hora) disponible para ambos
            // Mezclamos días y horas para no llenar siempre Lunes a las 8am primero
            const shuffledDays = [...days];
            shuffleArray(shuffledDays);
            const shuffledHours = [...hours];
            shuffleArray(shuffledHours);

            for (const day of shuffledDays) {
                if (assigned) break;
                for (const hour of shuffledHours) {
                    // 1. Docente dispone de esa hora globalmente?
                    if (!teacher.availability.includes(hour)) continue;

                    // 2. Docente ocupado ya?
                    if (busyTeachers[teacher.name][day][hour]) continue;

                    // 3. Grupo ocupado ya?
                    if (busyGroups[group.name][day][hour]) continue;

                    // ASIGNACIÓN
                    const assignment = {
                        id: Date.now() + Math.random(),
                        group: group.name,
                        day: day,
                        hour: hour,
                        subject: subject,
                        teacher: teacher.name,
                        color: teacher.color
                    };

                    currentSchedule.push(assignment);
                    busyTeachers[teacher.name][day][hour] = true;
                    busyGroups[group.name][day][hour] = true;

                    assigned = true;
                    break;
                }
            }
        }

        if (!assigned) {
            conflicts.push(`Sin cupo para <strong>${subject}</strong> en <strong>${group.name}</strong>.`);
        }
    });

    renderSchedule();

    if (conflicts.length > 0) {
        showMessage("warning", "Horario generado con conflictos (algunas materias no cupieron).");
        renderConflicts(conflicts);
    } else {
        showMessage("success", "Horario generado exitosamente.");
        document.getElementById("messagesSection").innerHTML = "";
    }
}

// =====================
// RENDERIZADO Y UI
// =====================

function renderSchedule() {
    const container = document.getElementById("scheduleContainer");
    container.innerHTML = "";

    groups.forEach(group => {
        const groupWrapper = document.createElement('div');
        groupWrapper.className = 'group-schedule';

        const header = document.createElement('div');
        header.className = 'group-header';
        header.textContent = `Horario Grupo ${group.name}`;
        groupWrapper.appendChild(header);

        const table = document.createElement('table');
        table.className = 'schedule-table';

        const thead = document.createElement('thead');
        const headRow = document.createElement('tr');
        headRow.innerHTML = `<th>Hora</th>${days.map(d => `<th>${d}</th>`).join('')}`;
        thead.appendChild(headRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        hours.forEach(hour => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td><strong>${hour}:00 - ${hour + 1}:00</strong></td>`;

            days.forEach(day => {
                const td = document.createElement('td');
                // Metadatos para Drop
                td.dataset.group = group.name;
                td.dataset.day = day;
                td.dataset.hour = hour;

                // Listeners de Drop
                td.addEventListener("dragover", handleDragOver);
                td.addEventListener("drop", handleDrop);
                td.addEventListener("dragleave", handleDragLeave);

                // Buscar clase
                const classFound = currentSchedule.find(c => c.group === group.name && c.day === day && c.hour === hour);
                if (classFound) {
                    td.innerHTML = `
                        <div class="class-cell" draggable="true" style="background-color: ${classFound.color}" data-id="${classFound.id}">
                            <div class="class-subject">${classFound.subject}</div>
                            <div class="class-teacher">${classFound.teacher}</div>
                        </div>
                    `;
                    // Listener de Drag Start al elemento creado
                    const cellDiv = td.querySelector('.class-cell');
                    cellDiv.addEventListener("dragstart", (e) => handleDragStart(e, classFound));
                } else {
                    td.className = "empty-cell";
                    td.textContent = "-";
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        groupWrapper.appendChild(table);
        container.appendChild(groupWrapper);
    });
}

function renderConflicts(conflicts) {
    const msgSection = document.getElementById("messagesSection");
    msgSection.innerHTML = `
        <div class="message message-error">
            <strong>Conflictos no resueltos:</strong>
            <ul>${conflicts.map(c => `<li>${c}</li>`).join('')}</ul>
        </div>
    `;
}

// =====================
// DRAG AND DROP
// =====================

function handleDragStart(e, classObj) {
    draggedItem = classObj;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify(classObj));
    // Estilo visual
    setTimeout(() => e.target.style.opacity = '0.5', 0);
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    // Resaltar celda destino
    if (e.currentTarget.tagName === 'TD') {
        e.currentTarget.style.backgroundColor = "#e1f5fe";
    }
}

function handleDragLeave(e) {
    if (e.currentTarget.tagName === 'TD') {
        e.currentTarget.style.backgroundColor = "";
    }
}

function handleDrop(e) {
    e.preventDefault();
    const targetCell = e.currentTarget;
    targetCell.style.backgroundColor = ""; // Limpiar color hover

    if (!draggedItem) return;

    const targetGroup = targetCell.dataset.group;
    const targetDay = targetCell.dataset.day;
    const targetHour = parseInt(targetCell.dataset.hour);

    // 1. Validar que no movemos entre grupos (por simplicidad visual)
    if (targetGroup !== draggedItem.group) {
        showMessage("error", "No puedes mover una materia a otro grupo.");
        renderSchedule();
        return;
    }

    // 2. Si es la misma celda, cancelar
    if (targetDay === draggedItem.day && targetHour === draggedItem.hour) {
        renderSchedule();
        return;
    }

    // 3. Validar movimiento
    const validation = validateMove(draggedItem, targetDay, targetHour);
    if (!validation.ok) {
        showMessage("error", `Movimiento inválido: ${validation.reason}`);
        renderSchedule();
        return;
    }

    // 4. Aplicar cambios
    // Remover item antiguo
    currentSchedule = currentSchedule.filter(c => c.id !== draggedItem.id);

    // Crear nuevo item actualizado
    const newItem = {
        ...draggedItem,
        day: targetDay,
        hour: targetHour
    };

    currentSchedule.push(newItem);

    renderSchedule();
    showMessage("success", "Clase reprogramada correctamente.");
    draggedItem = null;
}

function validateMove(item, targetDay, targetHour) {
    const teacher = teachers.find(t => t.name === item.teacher);

    // A. Disponibilidad del profe
    if (!teacher.availability.includes(targetHour)) {
        return { ok: false, reason: `El docente ${item.teacher} no puede a las ${targetHour}:00.` };
    }

    // B. Profe ocupado en otro grupo?
    // Buscamos si hay alguna clase de este profe en ese día/hora, EXCEPTO la que estamos moviendo (que ya filtramos/igual es diferente ID)
    const teacherBusy = currentSchedule.find(c =>
        c.teacher === item.teacher &&
        c.day === targetDay &&
        c.hour === targetHour &&
        c.id !== item.id
    );
    if (teacherBusy) {
        return { ok: false, reason: `El docente ${item.teacher} ya está ocupado en el Gpo ${teacherBusy.group}.` };
    }

    // C. El grupo ya tiene clase?
    // Buscamos si este grupo tiene clase aquí
    const groupBusy = currentSchedule.find(c =>
        c.group === item.group &&
        c.day === targetDay &&
        c.hour === targetHour &&
        c.id !== item.id
    );
    if (groupBusy) {
        return { ok: false, reason: `El grupo ya tiene la clase de ${groupBusy.subject} a esa hora.` };
    }

    return { ok: true };
}


// =====================
// UTILIDADES
// =====================

function showMessage(type, text) {
    const msgSection = document.getElementById("messagesSection");
    if (type === 'success') msgSection.innerHTML = '';

    const div = document.createElement('div');
    div.className = `message message-${type}`;
    div.textContent = text;

    if (type !== 'error') {
        setTimeout(() => div.remove(), 4000);
        msgSection.prepend(div);
    } else {
        msgSection.prepend(div);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

