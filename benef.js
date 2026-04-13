// app.js

// Definimos db usando let para indicar que sus valores internos pueden mutar
let db = {
    "QUITO": { "MULTIRIESGO": { "51234": { "2026-2027": {
            "1": { "INCENDIO": { "EDIFICIO": { "valor_asegurado": 20000, "valor_endosado": 5000 }, "MERCADERIA": { "valor_asegurado": 300000, "valor_endosado": 200000 } } },
            "2": { "INCENDIO": { "MERCADERIA": { "valor_asegurado": 500000, "valor_endosado": 0 } } },
            "3": { "INCENDIO": { "MERCADERIA": { "valor_asegurado": 5000, "valor_endosado": 0 } } },
            "4": { "INCENDIO": { "MERCADERIA": { "valor_asegurado": 50000, "valor_endosado": 0 } } },
            "5": { "INCENDIO": { "MERCADERIA": { "valor_asegurado": 500, "valor_endosado": 0 } } },
            "6": { "INCENDIO": { "MERCADERIA": { "valor_asegurado": 1200, "valor_endosado": 0 } } },
            "7": { "INCENDIO": { "MERCADERIA": { "valor_asegurado": 3400, "valor_endosado": 0 } } },
            "8": { "INCENDIO": { "MERCADERIA": { "valor_asegurado": 4500, "valor_endosado": 0 } } },
            "9": { "INCENDIO": { "MERCADERIA": { "valor_asegurado": 4000, "valor_endosado": 0 } } }
    }}}},
    "GUAYAQUIL": { "MULTIRIESGO": { "51234": { "2026-2027": {
            "1": { "INCENDIO": { "EDIFICIO": { "valor_asegurado": 400000, "valor_endosado": 400000 } } },
            "2": { "INCENDIO": { "EDIFICIO": { "valor_asegurado": 70000, "valor_endosado": 0 } } },
            "3": { "INCENDIO": { "EDIFICIO": { "valor_asegurado": 80000, "valor_endosado": 0 } } },
            "4": { "INCENDIO": { "EDIFICIO": { "valor_asegurado": 60000, "valor_endosado": 0 } } }
    }}}}
};

// Referencias DOM
const selSucursal = document.getElementById('sucursal');
const selRamo = document.getElementById('ramo');
const inputPoliza = document.getElementById('poliza'); // Ahora es un Input Text
const selVigencia = document.getElementById('vigencia');
const btnBuscar = document.getElementById('buscarBtn');

const controlesPostBusqueda = document.getElementById('controlesPostBusqueda');
const tipoMovimiento = document.getElementById('tipoMovimiento');
const contenedorTabla = document.getElementById('resultado');
const tablaCuerpo = document.getElementById('tablaCuerpo');

const controlesGuardar = document.getElementById('controlesGuardar');
const numeroEndoso = document.getElementById('numeroEndoso');
const btnGuardar = document.getElementById('btnGuardar');

function llenarSelect(selectElement, opciones) {
    selectElement.innerHTML = '<option value="">Seleccione...</option>';
    opciones.forEach(opcion => {
        selectElement.innerHTML += `<option value="${opcion}">${opcion}</option>`;
    });
    selectElement.disabled = opciones.length === 0;
}

llenarSelect(selSucursal, Object.keys(db));

// Lógica de menús en cascada
selSucursal.addEventListener('change', (e) => {
    llenarSelect(selRamo, e.target.value ? Object.keys(db[e.target.value]) : []);
    selRamo.dispatchEvent(new Event('change'));
});

selRamo.addEventListener('change', (e) => {
    // Si se seleccionó un ramo, habilitamos el input de póliza
    if(e.target.value) {
        inputPoliza.disabled = false;
        inputPoliza.value = '';
        llenarSelect(selVigencia, []);
    } else {
        inputPoliza.disabled = true;
        inputPoliza.value = '';
        llenarSelect(selVigencia, []);
    }
});

// En vez de change de un select, escuchamos mientras el usuario teclea (input)
inputPoliza.addEventListener('input', (e) => {
    const sucursal = selSucursal.value;
    const ramo = selRamo.value;
    const poliza = e.target.value.trim();

    // Verificamos si la ruta existe en la base de datos para poblar Vigencia
    if (sucursal && ramo && poliza && db[sucursal][ramo][poliza]) {
        llenarSelect(selVigencia, Object.keys(db[sucursal][ramo][poliza]));
    } else {
        llenarSelect(selVigencia, []);
    }
});

// Buscar
btnBuscar.addEventListener('click', () => {
    if (!selSucursal.value || !selRamo.value || !inputPoliza.value || !selVigencia.value) {
        alert("Por favor asegúrese de ingresar una Póliza válida y seleccione todos los filtros.");
        return;
    }

    const items = db[selSucursal.value][selRamo.value][inputPoliza.value][selVigencia.value];
    tablaCuerpo.innerHTML = ''; 
    numeroEndoso.value = '';

    for (const [itemNum, ramosPol] of Object.entries(items)) {
        for (const [ramoPolNombre, rubros] of Object.entries(ramosPol)) {
            for (const [rubroNombre, valores] of Object.entries(rubros)) {
                const tr = document.createElement('tr');
                
                // Guardamos los valores y las claves de acceso en el dataset de la fila
                tr.dataset.item = itemNum;
                tr.dataset.ramo = ramoPolNombre;
                tr.dataset.rubro = rubroNombre;
                tr.dataset.vaOriginal = valores.valor_asegurado;
                tr.dataset.veOriginal = valores.valor_endosado;

                tr.innerHTML = `
                    <td class="text-center">${itemNum}</td>
                    <td>${ramoPolNombre}</td>
                    <td>${rubroNombre}</td>
                    <td>
                        <input type="number" class="form-control form-control-sm input-movimiento" placeholder="0">
                        <span class="error-text"></span>
                    </td>
                    <td class="text-end cell-va">$ ${valores.valor_asegurado.toLocaleString()}</td>
                    <td class="text-end cell-ve">$ ${valores.valor_endosado.toLocaleString()}</td>
                `;
                tablaCuerpo.appendChild(tr);
            }
        }
    }

    controlesPostBusqueda.style.display = 'flex';
    contenedorTabla.style.display = 'flex';
    controlesGuardar.style.display = 'flex';
    validarEstadoGuardar();
    
    document.querySelectorAll('.input-movimiento').forEach(input => {
        input.addEventListener('input', () => calcularFila(input.closest('tr')));
    });
});

tipoMovimiento.addEventListener('change', () => {
    document.querySelectorAll('#tablaCuerpo tr').forEach(tr => calcularFila(tr));
});

numeroEndoso.addEventListener('input', validarEstadoGuardar);

function calcularFila(tr) {
    const input = tr.querySelector('.input-movimiento');
    const cellVA = tr.querySelector('.cell-va');
    const cellVE = tr.querySelector('.cell-ve');
    const errorText = tr.querySelector('.error-text');
    
    const vaOriginal = parseFloat(tr.dataset.vaOriginal);
    const veOriginal = parseFloat(tr.dataset.veOriginal);
    const valMov = parseFloat(input.value) || 0;
    const tipo = tipoMovimiento.value;

    let nuevoVA = vaOriginal;
    let nuevoVE = veOriginal;
    let errorMsg = "";

    if (tipo === 'modificacion') {
        nuevoVA = vaOriginal + valMov;
        if (nuevoVA < veOriginal) {
            errorMsg = "Suma Asegurada no puede ser menor a Suma Endosada.";
        }
    } else if (tipo === 'endoso') {
        if (valMov < 0) {
            errorMsg = "Valores negativos no permitidos en Endoso de Beneficiario.";
            nuevoVE = veOriginal; 
        } else {
            nuevoVE = veOriginal + valMov;
            if (nuevoVE > vaOriginal) {
                errorMsg = "Suma Endosada no puede superar la Suma Asegurada.";
            }
        }
    }

    // Actualizar vista y data-attributes internos para el momento de guardar
    cellVA.textContent = `$ ${nuevoVA.toLocaleString()}`;
    cellVE.textContent = `$ ${nuevoVE.toLocaleString()}`;
    tr.dataset.vaCalculado = nuevoVA;
    tr.dataset.veCalculado = nuevoVE;

    if (errorMsg) {
        tr.classList.add('error-row');
        errorText.textContent = errorMsg;
        tr.dataset.hasError = "true";
    } else {
        tr.classList.remove('error-row');
        errorText.textContent = "";
        tr.dataset.hasError = "false";
    }

    validarEstadoGuardar();
}

function validarEstadoGuardar() {
    let hayErrores = false;
    document.querySelectorAll('#tablaCuerpo tr').forEach(tr => {
        if (tr.dataset.hasError === "true") hayErrores = true;
    });
    const numEndosoOk = numeroEndoso.value.trim() !== '';
    btnGuardar.disabled = hayErrores || !numEndosoOk;
}

// Acción Guardar: ¡Ahora altera el JSON!
btnGuardar.addEventListener('click', () => {
    const sucursal = selSucursal.value;
    const ramo = selRamo.value;
    const poliza = inputPoliza.value;
    const vigencia = selVigencia.value;

    // Iterar por cada fila de la tabla para buscar sus valores calculados
    document.querySelectorAll('#tablaCuerpo tr').forEach(tr => {
        const item = tr.dataset.item;
        const ramoNombre = tr.dataset.ramo;
        const rubro = tr.dataset.rubro;
        
        // Si no hay cálculo (porque el usuario no modificó nada ahí), tomamos el original
        const finalVA = parseFloat(tr.dataset.vaCalculado || tr.dataset.vaOriginal);
        const finalVE = parseFloat(tr.dataset.veCalculado || tr.dataset.veOriginal);

        // Mutar la base de datos en memoria (JSON)
        db[sucursal][ramo][poliza][vigencia][item][ramoNombre][rubro].valor_asegurado = finalVA;
        db[sucursal][ramo][poliza][vigencia][item][ramoNombre][rubro].valor_endosado = finalVE;
    });

    alert(`¡Datos guardados exitosamente!\nEndoso Nº: ${numeroEndoso.value}\n\nLos cambios se han escrito en la base de datos.`);
    
    // Recargar la tabla automáticamente para que el usuario compruebe que los valores base han cambiado en el JSON
    btnBuscar.click();
});