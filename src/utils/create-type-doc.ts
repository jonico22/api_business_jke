import prisma from '../config/database';

const documentTypes = [
    {name: 'dni', code: 'DNI'},
    {name: 'ruc', code: 'RUC'},
    {name: 'carnet de extranjeria', code: 'CE'},
    {name: 'pasaporte', code: 'PASAPORTE'}
];

export const createDocumentTypes = async () => {
    for (const type of documentTypes) {
        const exists = await prisma.documentType.findUnique({ where: { code: type.code } });
        if (!exists) {
            await prisma.documentType.create({ data: type });
            console.log(`Tipo de documento creado: ${type.name}`);
        }
    }
}