import { User } from "../../../domain/entities/user.entity";
import { ResolveDependency } from "../../../infrastructure/config/dependency-injection";
import { IFixture } from "../utils/fixture.interface";
import { JWTAuthenticator } from "../../../infrastructure/authenticators/jwt-authenticator";

export class UserFixture implements IFixture {
    constructor(public entity: User) {}

    async load(container: ResolveDependency): Promise<void> {
        const userRepository = container('userRepository')
        await userRepository.create(this.entity)
    }

    async createAuthorizationToken(container: ResolveDependency) {
        const authenticator = container('authenticator') as JWTAuthenticator
        const token = await authenticator.generateToken(
            this.entity.props.email,
            this.entity.props.password
        )
        return `Bearer ${token}`
    }
}