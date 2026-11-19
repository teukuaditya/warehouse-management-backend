const prisma = require('../db')

async function insertMaterial(materialData) {
    const qty = parseInt(materialData.quantity) || 0;
    const newMaterial = await prisma.material.create({
        data: {
            name: materialData.name,
            descriptions: materialData.descriptions,
            quantity: qty,
            status: materialData.status || (qty > 0 ? 'AVAILABLE' : 'UNAVAILABLE')
        }
    });
    return newMaterial;    
}

async function findMaterials() {
    const materials = await prisma.material.findMany();
    return materials;
}

async function findMaterialById(id) {
    const material = await prisma.material.findUnique({
        where: {
            materialId: parseInt(id),
        }
    });
    return material;
}

async function editMaterial(id, materialData) {
    const qty = materialData.quantity !== undefined ? parseInt(materialData.quantity) : undefined;
    const dataToUpdate = {
        name: materialData.name,
        descriptions: materialData.descriptions,
    };
    if (qty !== undefined) {
        dataToUpdate.quantity = qty;
    }
    if (materialData.status) {
        dataToUpdate.status = materialData.status;
    } else if (qty !== undefined && qty === 0) {
        dataToUpdate.status = 'UNAVAILABLE';
    }

    const updatedMaterial = await prisma.material.update({
        where: {
            materialId: parseInt(id),
        },
        data: dataToUpdate,
    });
    return updatedMaterial;
}

async function deleteMaterial(id) {
    await prisma.material.delete({
        where: {
            materialId: parseInt(id)
        }
    })
}

const updateMaterialQuantity = async(materialId, newQuantity) =>{
    await prisma.material.update({
        where:{
            materialId:parseInt(materialId)
        },
        data:{
            quantity:newQuantity
        }
    })
}

module.exports = {
    insertMaterial,
    findMaterials,
    findMaterialById,
    editMaterial,
    deleteMaterial,
    updateMaterialQuantity
}