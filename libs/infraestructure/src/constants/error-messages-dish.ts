export const errorMessagesDish = {
    createSuccess: (name: string, id: string) => `Plato creado exitosamente con nombre: ${name} y ID: ${id}`,
    createError: (error: string) => `Error al crear el plato: ${error}`,
    createNameDuplicate: (name: string) => `Intento de crear plato con nombre duplicado: ${name}`,
    findAllSuccess: (count: number) => `Se encontraron ${count} platos`,
    findAllError: (error: string) => `Error al obtener los platos: ${error}`,
    findByIdNotFound: (id: string) => `Plato con ID: ${id} no encontrado`,
    findByIdSuccess: (id: string) => `Plato encontrado con ID: ${id}`,
    findByIdError: (id: string, error: string) => `Error al obtener el plato con ID: ${id}: ${error}`,
    updateSuccess: (id: string) => `Plato actualizado exitosamente con ID: ${id}`,
    updateError: (id: string, error: string) => `Error al actualizar el plato con ID: ${id}: ${error}`,
    deleteSuccess: (id: string) => `Plato eliminado exitosamente con ID: ${id}`,
    deleteError: (id: string, error: string) => `Error al eliminar el plato con ID: ${id}: ${error}`,

    createDishSuccess: 'Plato creado exitosamente',
    deleteDishSuccess: 'Plato eliminado exitosamente',
}