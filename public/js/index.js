const esOperador = (c) => c === '+' || c === '-' || c === '*' || c === '/' || c === '=';
const precedencia = (op) => op === '*' || op === '/' ? 2 : op === '+' || op === '-' ? 1 : op === '=' ? 0 : -1;

const convertirAPostfija = (expresion) => {
    let salida = [];
    let pila = [];

    // Elimina espacios y divide la cadena manteniendo los operadores y paréntesis como tokens individuales
    const tokens = expresion.replace(/\s+/g, '').split(/([+\-*/()=])/).filter(t => t);

    // Funciones recursivas para manejar la pila de operadores mediante operadores ternarios
    
    // Vacía la pila hacia la salida hasta encontrar el paréntesis de apertura '('
    const eliminarHastaParentesis = () => pila.length === 0 || pila[pila.length - 1] === '(' ? pila.pop() : (salida.push(pila.pop()), eliminarHastaParentesis());
    
    // Saca operadores de la pila a la salida mientras tengan mayor o igual precedencia que el token actual
    const eliminarOperador = (token) => pila.length === 0 || precedencia(pila[pila.length - 1]) < precedencia(token) ? pila.push(token) : (salida.push(pila.pop()), eliminarOperador(token));
    const eliminarTodo = () => pila.length === 0 ? null : (salida.push(pila.pop()), eliminarTodo());

    // Clasifica cada token operandos a la salida, paréntesis y operadores a la pila según las reglas
    tokens.forEach(token => {
        token.match(/^[a-zA-Z0-9]+$/) ? salida.push(token) : token === '(' ? pila.push(token) : token === ')' ? eliminarHastaParentesis(): eliminarOperador(token);
    });
    
    eliminarTodo();
    return salida;
};

const generarCodigoIntermedio = (expresionInput) => {
    const expresion = expresionInput.includes('=') ? expresionInput : `r = ${expresionInput}`;
    const postfija = convertirAPostfija(expresion);
    
    let pilaOperandos = [];
    let cuadruplos = [];
    let triplos = [];
    let contadorTemp = 1;

    postfija.forEach(token => {
        esOperador(token) ? token === '=' ? (() => {
                    const valor = pilaOperandos.pop();
                    const destino = pilaOperandos.pop();
                    cuadruplos.push({ op: token, arg1: valor, arg2: '-', res: destino });
                    triplos.push({ op: token, arg1: destino, arg2: valor });
                })() : (() => {
                    const op2 = pilaOperandos.pop();
                    const op1 = pilaOperandos.pop();
                    const temp = `t${contadorTemp}`;
                    cuadruplos.push({ op: token, arg1: op1, arg2: op2, res: temp });
                    triplos.push({ op: token, arg1: op1, arg2: op2 });
                    pilaOperandos.push(temp);
                    contadorTemp++;
                })() : pilaOperandos.push(token);
    });

    return { cuadruplos, triplos };
};

const actualizarVista = (cuadruplos, triplos) => {
    document.getElementById('body-cuadruplos').innerHTML = cuadruplos.length === 0 
        ? `<tr><td colspan="4" class="text-muted">Esperando</td></tr>`
        : cuadruplos.map(c => `<tr>
            <td><span class="badge bg-primary fs-6">${c.op}</span></td>
            <td>${c.arg1}</td>
            <td>${c.arg2}</td>
            <td class="fw-bold text-primary">${c.res}</td>
          </tr>`).join('');

    document.getElementById('body-triplos').innerHTML = triplos.length === 0
        ? `<tr><td colspan="4" class="text-muted">Esperando</td></tr>`
        : triplos.map((t, i) => `<tr>
                <td class="fw-bold">(${i})</td>
                <td><span class="badge bg-success fs-6">${t.op}</span></td>
                <td>${String(t.arg1).startsWith('t') ? `(${String(t.arg1).replace('t', '') - 1})` : t.arg1}</td>
                <td>${String(t.arg2).startsWith('t') ? `(${String(t.arg2).replace('t', '') - 1})` : t.arg2}</td>
            </tr>`).join('');
};

const procesarExpresion = () => {
    const inputExpresion = document.getElementById('expresion').value;
    inputExpresion.trim() === '' ? alert("Por favor ingresa una expresión válida") : (() => {
            const { cuadruplos, triplos } = generarCodigoIntermedio(inputExpresion);
            actualizarVista(cuadruplos, triplos);
        })();
};

const limpiarCampos = () => {
    document.getElementById('expresion').value = '';
    actualizarVista([], []);
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-procesar').addEventListener('click', procesarExpresion);
    document.getElementById('btn-limpiar').addEventListener('click', limpiarCampos);
    document.getElementById('expresion').addEventListener('keypress', (e) => e.key === 'Enter' ? procesarExpresion() : null);
    actualizarVista([], []);
});