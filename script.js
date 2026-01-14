// =====================
// MODELO DE DATOS
// =====================

// Docentes con materias que dominan y disponibilidad (horas 1-6)
// Nota: availability representa las horas en las que pueden dar clase
const teachers = [
    { name: "Ana", subjects: ["Matemáticas", "Física"], availability: [1, 2, 3, 4, 5], color: "var(--teacher-1)" },
    { name: "Luis", subjects: ["Química", "Biología"], availability: [2, 3, 4, 5, 6], color: "var(--teacher-2)" },
    { name: "María", subjects: ["Historia", "Geografía"], availability: [1, 2, 3, 4], color: "var(--teacher-3)" },
    { name: "Carlos", subjects: ["Inglés", "Literatura"], availability: [3, 4, 5, 6], color: "var(--teacher-4)" },
    { name: "Sofía", subjects: ["Programación", "Matemáticas"], availability: [1, 2, 5, 6], color: "var(--teacher-5)" }
];

// Grupos con materias asignadas (Plan de estudios)
const groups = [
    { name: "1A", subjects: ["Matemáticas", "Química", "Historia", "Inglés", "Programación"] },
    { name: "1B", subjects: ["Física", "Biología", "Geografía", "Literatura", "Matemáticas"] },
    { name: "2A", subjects: ["Física", "Historia", "Matemáticas", "Inglés"] }
];

// Configuración de Tiempo
const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const hours = [1, 2, 3, 4, 5, 6]; 

// =====================
// INICIALIZACIÓN
// =====================

document.addEventListener('DOMContentLoaded', () => {
    renderInfo();
});

// Función para mostrar la información inicial (Modelado de datos)
function renderInfo() {
    const docentesDiv = document.getElementById("docentesInfo");
    const materiasDiv = document.getElementById("materiasInfo");
    const gruposDiv = document.getElementById("gruposInfo");

    // Renderizar Docentes
    if(docentesDiv) {
        docentesDiv.innerHTML = teachers.map(t => `
            <div class="info-item">
                <span class="teacher-color" style="background:${t.color}"></span>
                <strong>${t.name}</strong>: ${t.subjects.join(", ")} 
                <br><small>Disp: Horas ${t.availability.join(", ")}</small>
            </div>
        `).join("");
    }

    // Calcular materias únicas
    const allSubjects = [...new Set(teachers.flatMap(t => t.subjects))];
    if(materiasDiv) materiasDiv.innerHTML = `<div class="info-item">${allSubjects.join(", ")}</div>`;

    // Renderizar Grupos
    if(gruposDiv) {
        gruposDiv.innerHTML = groups.map(g => `
            <div class="info-item">
                <strong>Grupo ${g.name}</strong>: ${g.subjects.join(", ")}
            </div>
        `).join("");
    }
}

// =====================
// LÓGICA DE ASIGNACIÓN
// =====================

function generateSchedule() {
    console.log("Generando horario...");
    const scheduleContainer = document.getElementById("scheduleContainer");
    const messagesSection = document.getElementById("messagesSection");
    
    // Limpiar resultados anteriores
    scheduleContainer.innerHTML = "";
    messagesSection.innerHTML = "";

    // 1. Inicializar estructura de horario vacía
    // schedule[hora][dia] = [ { group, subject, teacher } ]
    let schedule = {};
    hours.forEach(h => {
        schedule[h] = {};
        days.forEach(d => schedule[h][d] = []);
    });

    let conflicts = [];
    
    // Estructura auxiliar para rastrear ocupación de docentes: teacherSchedule[teacherName][day][hour] = true/false
    let teacherBusy = {};
    teachers.forEach(t => {
        teacherBusy[t.name] = {};
        days.forEach(d => teacherBusy[t.name][d] = {}); // Inicializar por día
    });
    
    // Estructura auxiliar para rastrear ocupación de grupos: groupBusy[groupName][day][hour] = true/false
    let groupBusy = {};
    groups.forEach(g => {
        groupBusy[g.name] = {};
        days.forEach(d => groupBusy[g.name][d] = {});
    });

    // 2. Algoritmo de Asignación (Greedy / Voraz)
    groups.forEach(group => {
        group.subjects.forEach(subject => {
            let assigned = false;

            // Intentar asignar en el primer hueco disponible
            for (let d of days) {
                // Mezclamos las horas o iteramos en orden. 
                // Para equilibrar, podríamos intentar diferentes estrategias, 
                // pero iterar en orden 1-6 es lo más simple.
                for (let h of hours) {
                    if (assigned) break;

                    // Validación 1: El grupo no debe estar ocupado
                    if (groupBusy[group.name][d][h]) continue;

                    // Buscar un docente candidato
                    // Reglas:
                    // 1. Domina la materia
                    // 2. Tiene disponibilidad en esa hora
                    // 3. No está ocupado en esa hora y día (Conflicto docente)
                    const candidateTeacher = teachers.find(t => 
                        t.subjects.includes(subject) && 
                        t.availability.includes(h) &&
                        !teacherBusy[t.name][d]?.[h]
                    );

                    if (candidateTeacher) {
                        // Asignar
                        schedule[h][d].push({
                            group: group.name,
                            subject: subject,
                            teacher: candidateTeacher.name,
                            color: candidateTeacher.color
                        });

                        // Marcar ocupados
                        teacherBusy[candidateTeacher.name][d][h] = true;
                        groupBusy[group.name][d][h] = true;
                        assigned = true;
                    }
                }
                if (assigned) break;
            }

            if (!assigned) {
                conflicts.push(`No se pudo asignar <strong>${subject}</strong> al grupo <strong>${group.name}</strong> por falta de disponibilidad o docentes.`);
            }
        });
    });

    // =====================
    // RENDERIZADO
    // =====================

    // Mostrar conflictos si existen
    if (conflicts.length > 0) {
        messagesSection.innerHTML = `
            <div class="message message-error">
                <div>
                    <strong>Se encontraron conflictos:</strong>
                    <ul>${conflicts.map(c => `<li>${c}</li>`).join("")}</ul>
                </div>
            </div>`;
    } else {
        messagesSection.innerHTML = `
            <div class="message message-success">
                ✅ Horario generado exitosamente sin conflictos.
            </div>`;
    }

    // Crear la tabla única
    const tableWrapper = document.createElement("div");
    // tableWrapper.className = "group-schedule"; // Usamos container styles
    
    const table = document.createElement("table");
    table.className = "schedule-table";

    // Header de la tabla
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = "<th>Hora</th>" + days.map(d => `<th>${d}</th>`).join("");
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Cuerpo de la tabla
    const tbody = document.createElement("tbody");
    hours.forEach(h => {
        const row = document.createElement("tr");
        
        // Celda de Hora
        const hourCell = document.createElement("td");
        hourCell.innerHTML = `<strong>${h}:00 - ${h + 1}:00</strong>`;
        row.appendChild(hourCell);

        days.forEach(d => {
            const cell = document.createElement("td");
            const classes = schedule[h][d];

            if (classes.length > 0) {
                // Renderizar cada clase en esta hora (pueden ser varios grupos)
                classes.forEach(cls => {
                    const classDiv = document.createElement("div");
                    classDiv.className = "class-cell";
                    // Obtener índice para color del docente basado en configuración CSS si fuera necesario, 
                    // pero aquí usamos inline style para mayor flexibilidad con el modelo Teacher
                    classDiv.style.backgroundColor = cls.color || "var(--primary-color)";
                    
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

function resetSchedule() {
    document.getElementById("scheduleContainer").innerHTML = "";
    document.getElementById("messagesSection").innerHTML = "";
    // Opcional: mostrar mensaje de reinicio
}

// =====================
// EVENTOS
// =====================
document.getElementById("generateBtn").addEventListener("click", generateSchedule);
document.getElementById("resetBtn").addEventListener("click", resetSchedule);
