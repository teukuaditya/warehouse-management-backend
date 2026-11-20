const prisma = require('../db')
const createUser = async (userData) => {
    try {
        const newUser = await prisma.user.create({ data: userData })
        return newUser
    } catch (error) {
        if (error.code === 'P2002') {
            const field = error.meta?.target?.[0] || 'field';
            throw new Error(`${field} sudah terdaftar`);
        }
        throw new Error(error.message || 'Register gagal');
    }
}

const findUsernameByUser = async (username) => {
    try {
        return prisma.user.findUnique({ where: { username } })
    } catch (error) {
        throw new Error('Login Failed')
    }
}
module.exports = {
    createUser,
    findUsernameByUser
}