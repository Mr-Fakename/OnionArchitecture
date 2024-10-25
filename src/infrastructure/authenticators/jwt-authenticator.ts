import { sign, verify } from 'jsonwebtoken'
import { IAuthenticator } from "../../interfaces/authenticator.interface"
import { IUserRepository } from "../../interfaces/user-repository.interface"

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key'

export class JWTAuthenticator implements IAuthenticator {
    constructor(
        private readonly userRepository: IUserRepository
    ) {}

    async authenticate(token: string) {
        try {
            const decoded = verify(token, JWT_SECRET) as { email: string }
            const user = await this.userRepository.findByEmail(decoded.email)

            if (!user) throw new Error("User not found")

            return user
        } catch (error) {
            throw new Error("Invalid token")
        }
    }

    async generateToken(email: string, password: string) {
        const user = await this.userRepository.findByEmail(email)

        if(!user || user.props.password !== password) {
            throw new Error("Wrong credentials")
        }

        return sign({ email: user.props.email }, JWT_SECRET, { expiresIn: '24h' })
    }
}