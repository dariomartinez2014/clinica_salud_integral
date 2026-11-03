# MP2 — Día 5: lectura de citas para reportes

GET /api/citas permite RECEPCIONISTA y GERENCIA. La ampliación de lectura para GERENCIA permite cargar las citas del gráfico de los últimos siete días junto con el reporte de especialidades existente. Se mantienen autenticación y restricciones de creación, agenda y cambio de estado.

Verificación: npm run build y node scripts/mp2-dia5.mjs. Pasaron 16 comprobaciones reales: login de los tres roles, 401 sin token, 403 para MÉDICO al listar citas, 200 para recepción y gerencia, reporte de especialidades para gerencia, y 403 al intentar crear o cambiar estados desde gerencia. Solo se crean usuarios temporales con correos example.test, eliminados al finalizar. No se crean pacientes ni citas.
