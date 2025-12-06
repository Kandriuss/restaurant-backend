export const errorMessagesGlobal = {
    internalServerError: 'Error interno del servidor',
    notFound: 'No encontrado',
    badRequest: 'Solicitud incorrecta',
    unauthorized: 'No autorizado',
    unknown: 'desconocido',
    databaseError: 'Error de base de datos',
    unexpectedError: 'Error inesperado',

    codeDuplicate: (code: string) =>  `El código ${code} ya existe`,
}