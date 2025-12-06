export const errorMessagesCategory = {
    createSuccess: (code: string, id: string) => `Categoría con code: ${code} y id: ${id} creada exitosamente`,
    createError: (error: string) => `Error al crear la categoría: ${error}`,
    findAllSuccess: (count: number) => `Se encontraron ${count} categorías`,
    findAllError: (error: string) => `Error al obtener las categorías: ${error}`,
    findByIdNotFound: (id: string) => `Categoría con ID: ${id} no encontrada`,
    findByIdSuccess: (id: string) => `Categoría con ID: ${id} encontrada`,
    findByIdError: (id: string, error: string) => `Error al obtener la categoría con ID: ${id}: ${error}`,
    findByCodeNotFound: (code: string) => `Categoría con code: ${code} no encontrada`,
    findByCodeSuccess: (code: string) => `Categoría con code: ${code} encontrada`,
    findByCodeError: (code: string, error: string) => `Error al obtener la categoría con code: ${code}: ${error}`,
    updateSuccess: (id: string) => `Categoría actualizada exitosamente con ID: ${id}`,
    updateError: (id: string, error: string) => `Error al actualizar la categoría con ID: ${id}: ${error}`,
    deleteSuccess: (id: string) => `Categoría eliminada exitosamente con ID: ${id}`,
    deleteError: (id: string, error: string) => `Error al eliminar la categoría con ID: ${id}: ${error}`,

    createCategorySuccess: 'Categoría creada exitosamente',
    deleteCategorySuccess: 'Categoría eliminada exitosamente',
}