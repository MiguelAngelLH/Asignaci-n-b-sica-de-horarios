// ============================================
// SISTEMA DE ASIGNACIÓN DE HORARIOS ACADÉMICOS
// Versión final adaptada a index.html (sin emojis)
// ============================================

/**
 * Clase que representa un Docente
 */
class Docente {
    constructor(id, nombre, materias, disponibilidad) {
        this.id = id;
        this.nombre = nombre;
        this.materias = materias;
        this.disponibilidad = disponibilidad; // {dia: [horas]}
        this.color = null;
    }

    puedeImpartir(materiaId) {
        return this.materias.includes(materiaId);
    }

    estaDisponible(dia, hora) {
        return this.disponibilidad[dia] && this.disponibilidad[dia].includes(hora);
    }
}

class Materia {
    constructor(id, nombre, horasPorSemana) {
        this.id = id;
        this.nombre = nombre;
        this.horasPorSemana = horasPorSemana;
    }
}

class Grupo {
    constructor(id, nombre, materias) {
        this.id = id;
        this.nombre = nombre;
        this.materias = materias;
    }
}

class Clase {
    constructor(dia, hora, materiaId, docenteId, grupoId) {
        this.dia = dia;
        this.hora = hora;
        this.materiaId = materiaId;
        this.docenteId = docenteId;
        this.grupoId = grupoId;
    }
}

// ============================================
// 2. DATOS DE EJEMPLO
// ============================================
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const HORARIOS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

const materias = [
    new Materia('MAT001', 'Matemáticas', 4),
    new Materia('FIS001', 'Física', 3),
    new Materia('PROG001', 'Programación', 4),
    new Materia('HIST001', 'Historia', 2),
    new Materia('ING001', 'Inglés', 3),
    new Materia('QUIM001', 'Química', 3)
];

const docentes = [
    new Docente(
        'DOC001',
        'Prof. Juan Pérez',
        ['MAT001', 'FIS001'],
        {
            'Lunes': ['08:00', '09:00', '10:00', '11:00'],
            'Martes': ['08:00', '09:00', '10:00'],
            'Miércoles': ['08:00', '09:00', '10:00', '11:00', '12:00'],
            'Jueves': ['09:00', '10:00', '11:00'],
            'Viernes': ['08:00', '09:00', '10:00']
        }
    ),
    new Docente(
        'DOC002',
        'Prof. María García',
        ['PROG001', 'MAT001'],
        {
            'Lunes': ['10:00', '11:00', '12:00', '13:00'],
            'Martes': ['09:00', '10:00', '11:00', '12:00'],
            'Miércoles': ['10:00', '11:00', '12:00'],
            'Jueves': ['08:00', '09:00', '10:00', '11:00'],
            'Viernes': ['09:00', '10:00', '11:00', '12:00']
        }
    ),
    new Docente(
        'DOC003',
        'Prof. Carlos López',
        ['HIST001', 'ING001'],
        {
            'Lunes': ['09:00', '10:00', '11:00', '12:00'],
            'Martes': ['08:00', '09:00', '10:00', '11:00'],
            'Miércoles': ['09:00', '10:00', '11:00'],
            'Jueves': ['08:00', '09:00', '10:00'],
            'Viernes': ['08:00', '09:00', '10:00', '11:00']
        }
    ),
    new Docente(
        'DOC004',
        'Prof. Ana Martínez',
        ['QUIM001', 'FIS001'],
        {
            'Lunes': ['08:00', '09:00', '10:00'],
            'Martes': ['10:00', '11:00', '12:00', '13:00'],
            'Miércoles': ['08:00', '09:00', '10:00', '11:00'],
            'Jueves': ['09:00', '10:00', '11:00', '12:00'],
            'Viernes': ['08:00', '09:00', '10:00']
        }
    )
];

const COLORES_DOCENTES = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c'];
docentes.forEach((d, i) => d.color = COLORES_DOCENTES[i % COLORES_DOCENTES.length]);

const grupos = [
    new Grupo('GRP001', 'Grupo A', ['MAT001', 'FIS001', 'PROG001', 'ING001']),
    new Grupo('GRP002', 'Grupo B', ['MAT001', 'QUIM001', 'HIST001', 'PROG001'])
];

// ============================================
// 3. SISTEMA DE ASIGNACIÓN
// ============================================

class SistemaHorarios {
    constructor() {
        this.horarios = [];
        this.conflictos = [];
        this.clasesNoAsignadas = [];
    }

    generarHorarios() {
        this.limpiar();
        grupos.forEach(grupo => {
            grupo.materias = grupo.materias || grupo.materias; // por compatibilidad
            grupo.materias.forEach(m => this.asignarMateria(grupo, m));
        });
        return { horarios: this.horarios, conflictos: this.conflictos, clasesNoAsignadas: this.clasesNoAsignadas };
    }

    asignarMateria(grupo, materiaId) {
        const materia = materias.find(m => m.id === materiaId);
        if(!materia) return;
        let horasAsignadas = 0;
        const horasRequeridas = materia.horasPorSemana;
        const docentesCapaces = docentes.filter(d => d.puedeImpartir ? d.puedeImpartir(materiaId) : d.materias.includes(materiaId));
        if(docentesCapaces.length === 0){
            this.clasesNoAsignadas.push({ grupo: grupo.nombre, materia: materia.nombre, razon: 'No hay docentes para esta materia' });
            return;
        }

        for(let dia of DIAS){
            if(horasAsignadas >= horasRequeridas) break;
            for(let hora of HORARIOS){
                if(horasAsignadas >= horasRequeridas) break;
                const docente = this.encontrarDocenteDisponible(docentesCapaces, dia, hora, grupo.id);
                if(docente && !this.hayConflicto(dia, hora, docente.id, grupo.id)){
                    this.horarios.push(new Clase(dia, hora, materiaId, docente.id, grupo.id));
                    horasAsignadas++;
                }
            }
        }

        if(horasAsignadas < horasRequeridas){
            this.clasesNoAsignadas.push({ grupo: grupo.nombre, materia: materia.nombre, horasAsignadas, horasRequeridas, razon: `Solo asignadas ${horasAsignadas} de ${horasRequeridas}` });
        }
    }

    encontrarDocenteDisponible(docentesCapaces, dia, hora, grupoId){
        for(let docente of docentesCapaces){
            const disponible = typeof docente.estaDisponible === 'function' ? docente.estaDisponible(dia, hora) : (docente.disponibilidad && docente.disponibilidad[dia] && docente.disponibilidad[dia].includes(hora));
            if(!disponible) continue;
            const tieneClase = this.horarios.some(c => c.dia === dia && c.hora === hora && c.docenteId === (docente.id || docente.nombre));
            if(!tieneClase) return docente;
        }
        return null;
    }

    hayConflicto(dia, hora, docenteId, grupoId){
        const conflictoDocente = this.horarios.some(c => c.dia === dia && c.hora === hora && c.docenteId === docenteId);
        const conflictoGrupo = this.horarios.some(c => c.dia === dia && c.hora === hora && c.grupoId === grupoId);
        if(conflictoDocente || conflictoGrupo){
            this.conflictos.push({ dia, hora, tipo: conflictoDocente ? 'Docente ocupado' : 'Grupo ocupado' });
            return true;
        }
        return false;
    }

    limpiar(){ this.horarios = []; this.conflictos = []; this.clasesNoAsignadas = []; }

    obtenerHorarioGrupo(grupoId){ return this.horarios.filter(c => c.grupoId === grupoId); }
}

// ============================================
// 4. INTERFAZ
// ============================================
const sistema = new SistemaHorarios();
const generateBtn = document.getElementById('generateBtn');
const resetBtn = document.getElementById('resetBtn');
const scheduleContainer = document.getElementById('scheduleContainer');
const messagesSection = document.getElementById('messagesSection');
const docentesInfo = document.getElementById('docentesInfo');
const materiasInfo = document.getElementById('materiasInfo');
const gruposInfo = document.getElementById('gruposInfo');

function inicializar(){
    mostrarInformacionDocentes();
    mostrarInformacionMaterias();
    mostrarInformacionGrupos();
}

function mostrarInformacionDocentes(){
    if(!docentesInfo) return;
    docentesInfo.innerHTML = docentes.map((doc, i) => {
        const nombres = doc.materias ? doc.materias.map(id => (materias.find(m => m.id === id) || {nombre: id}).nombre).join(', ') : '';
        return `<div class="info-item"><span class="teacher-color" style="background:${doc.color}"></span><strong>${doc.nombre}</strong><br><small>Materias: ${nombres}</small></div>`;
    }).join('');
}

function mostrarInformacionMaterias(){
    if(!materiasInfo) return;
    materiasInfo.innerHTML = materias.map(m => `<div class="info-item"><strong>${m.nombre}</strong><br><small>${m.horasPorSemana} horas/semana</small></div>`).join('');
}

function mostrarInformacionGrupos(){
    if(!gruposInfo) return;
    gruposInfo.innerHTML = grupos.map(g => `<div class="info-item"><strong>${g.nombre}</strong><br><small>${g.materias.map(id=> (materias.find(m=>m.id===id)||{nombre:id}).nombre).join(', ')}</small></div>`).join('');
}

function generarYMostrarHorarios(){
    if(messagesSection) messagesSection.innerHTML = '';
    if(scheduleContainer) scheduleContainer.innerHTML = '';
    const resultado = sistema.generarHorarios();
    if(resultado.horarios.length>0) agregarMensaje('success', `Se generaron ${resultado.horarios.length} clases`);
    resultado.clasesNoAsignadas.forEach(c => agregarMensaje('warning', `${c.grupo} - ${c.materia}: ${c.razon}`));
    if(resultado.conflictos.length===0 && resultado.horarios.length>0) agregarMensaje('info', 'No se detectaron conflictos');
    grupos.forEach(g => mostrarHorarioGrupo(g));
}

function agregarMensaje(tipo, texto){
    if(!messagesSection) return;
    const div = document.createElement('div');
    div.className = `message message-${tipo}`;
    div.textContent = texto;
    messagesSection.appendChild(div);
}

function mostrarHorarioGrupo(grupo){
    if(!scheduleContainer) return;
    const horario = sistema.obtenerHorarioGrupo(grupo.id);
    const divGrupo = document.createElement('div');
    divGrupo.className = 'group-schedule';
    const header = document.createElement('div'); header.className='group-header'; header.textContent = grupo.nombre; divGrupo.appendChild(header);
    const tableWrap = document.createElement('div'); tableWrap.className='schedule-table';
    const table = document.createElement('table');
    const thead = document.createElement('thead'); const hr = document.createElement('tr'); hr.innerHTML = '<th>Hora</th>' + DIAS.map(d=>`<th>${d}</th>`).join(''); thead.appendChild(hr); table.appendChild(thead);
    const tbody = document.createElement('tbody');
    HORARIOS.forEach(h => {
        const tr = document.createElement('tr'); const th = document.createElement('th'); th.textContent = h; tr.appendChild(th);
        DIAS.forEach(d => {
            const td = document.createElement('td');
            const clase = horario.find(c => c.dia===d && c.hora===h);
            if(clase){
                const mat = materias.find(m=>m.id===clase.materiaId);
                const doc = docentes.find(dd=>dd.id===clase.docenteId) || docentes.find(dd=>dd.nombre===clase.docenteId);
                const idx = docentes.findIndex(dd=>dd.id===clase.docenteId);
                const divC = document.createElement('div'); divC.className = `class-cell teacher-${Math.max(0, idx)}`;
                divC.innerHTML = `<div class="class-subject">${mat ? mat.nombre : clase.materiaId}</div><div class="class-teacher">${doc ? doc.nombre : clase.docenteId}</div>`;
                td.appendChild(divC);
            } else {
                const divV = document.createElement('div'); divV.className='empty-cell'; divV.textContent='-'; td.appendChild(divV);
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody); tableWrap.appendChild(table); divGrupo.appendChild(tableWrap); scheduleContainer.appendChild(divGrupo);
}

function reiniciar(){
    sistema.limpiar();
    if(scheduleContainer) scheduleContainer.innerHTML = '';
    if(messagesSection) messagesSection.innerHTML = '';
    agregarMensaje('info', 'Sistema reiniciado. Presiona "Generar Horario" para crear nuevos horarios.');
}

if(generateBtn) generateBtn.addEventListener('click', () => { generateBtn.disabled = true; generateBtn.textContent = 'Generando...'; setTimeout(()=>{ generarYMostrarHorarios(); generateBtn.disabled = false; generateBtn.textContent = 'Generar Horario'; }, 400); });
if(resetBtn) resetBtn.addEventListener('click', reiniciar);
document.addEventListener('DOMContentLoaded', inicializar);

/*
Simulación de commits:
- feat: adaptar index.js a index.html
*/
