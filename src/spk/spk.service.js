const spkRepository = require('./spk.repository')
const materialRepository = require('../material/material.repository')
const prisma = require('../db')

const getFreeWHOPerators = async () => {
    const freeOperators = await spkRepository.findFreeWHOperators()
    if (!freeOperators.length) {
        throw new Error('No free WH Operators found')
    }
    return freeOperators
}

const createSpk = async (userId, materialId, quantityOrder, penerima) => {
    // validasi penerima
    const freeOperators = await spkRepository.findFreeWHOperators()
    const isValidasiOperators = freeOperators.some(user => user.userId === parseInt(penerima))
    if (!isValidasiOperators) {
        throw new Error('Selected penerima is not valid or not free')
    }
    const spk = await spkRepository.insertSPK(userId, parseInt(materialId), parseInt(quantityOrder), penerima)
    return spk
}

const getAllSPK = async () => {
    const spk = await spkRepository.findSpk()
    return spk
}

const getSpkByUser = async (userId) => {
    const userSpk = await spkRepository.findSpkByUser(userId)
    if (!userSpk) {
        throw new Error('SPK by User not found')
    }
    return userSpk
}

const getSpkById = async (spkId) => {
    const spkById = await spkRepository.findSpkById(spkId)
    if (!spkById) {
        throw new Error('SPK by Id not found')
    }
    return spkById
}

const updateStatusSpk = async (spkId, status) => {
    const validStatus = ['PENDING', 'ON_PROCESS', 'DONE']
    if (!validStatus.includes(status.toUpperCase())) {
        throw new Error('Invalid status')
    }
    const updateSpk = await spkRepository.updateSpkStatus(spkId, status.toUpperCase())
    if (!updateSpk) {
        throw new Error(`SPK with id ${spkId} not found`)
    }
    return updateSpk
}

const verifySPK2 = async (spkId, status) => {
    const validStatus = ['PENDING', 'ON_PROCESS', 'DONE']
    if (!validStatus.includes(status)) {
        throw new Error('Status tidak valid. Gunakan: PENDING, ON_PROCESS, atau DONE')
    }

    const spk = await spkRepository.findSpkById(spkId)
    if (!spk) {
        throw new Error('SPK tidak ditemukan')
    }

    const updatedSpk = await spkRepository.updateSpkStatus(spkId, status, null)

    if (status === 'DONE') {
        const material = await materialRepository.findMaterialById(spk.materialId)
        if (!material) {
            throw new Error('Material tidak ditemukan')
        }

        const newQuantity = material.quantity - spk.quantityOrder
        if (newQuantity < 0) {
            throw new Error('Stok material tidak mencukupi untuk menyelesaikan SPK ini')
        }

        // Update kuantitas stok
        await materialRepository.updateMaterialQuantity(spk.materialId, newQuantity)

        // Auto-set status material UNAVAILABLE jika stok habis
        if (newQuantity === 0) {
            await prisma.material.update({
                where: { materialId: parseInt(spk.materialId) },
                data: { status: 'UNAVAILABLE' }
            })
        }
    }

    return updatedSpk
}

module.exports = {
    createSpk,
    getSpkByUser,
    getSpkById,
    getAllSPK,
    updateStatusSpk,
    getFreeWHOPerators,
    verifySPK2
}
