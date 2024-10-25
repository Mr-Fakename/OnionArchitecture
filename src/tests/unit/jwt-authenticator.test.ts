import { JWTAuthenticator } from "../../infrastructure/authenticators/jwt-authenticator"
import { InMemoryUserRepository } from "../in-memory/in-memory-user-repository"
import { testUsers } from "./seeds/seeds-user"

describe('JWT Authenticator', () => {
    let userRepository: InMemoryUserRepository
    let authenticator: JWTAuthenticator

    beforeEach(async () => {
        userRepository = new InMemoryUserRepository()
        await userRepository.create(testUsers.johnDoe)

        authenticator = new JWTAuthenticator(userRepository)
    })

    describe('Token Generation', () => {
        it('should generate valid token with correct credentials', async () => {
            const token = await authenticator.generateToken(
                testUsers.johnDoe.props.email,
                testUsers.johnDoe.props.password
            )
            expect(token).toBeTruthy()
        })

        it('should throw error with invalid credentials', async () => {
            await expect(
                authenticator.generateToken('unknown@gmail.com', 'wrong-password')
            ).rejects.toThrow('Wrong credentials')
        })
    })

    describe('Token Authentication', () => {
        let validToken: string

        beforeEach(async () => {
            validToken = await authenticator.generateToken(
                testUsers.johnDoe.props.email,
                testUsers.johnDoe.props.password
            )
        })

        it('should authenticate valid token', async () => {
            const user = await authenticator.authenticate(validToken)
            expect(user!.props).toEqual({
                id: 'john-doe',
                email: 'johndoe@gmail.com',
                password: 'qwerty'
            })
        })

        it('should throw error with invalid token', async () => {
            await expect(
                authenticator.authenticate('invalid-token')
            ).rejects.toThrow('Invalid token')
        })
    })
})