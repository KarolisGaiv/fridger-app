import { createTestDatabase } from "@tests/utils/database";
import { fakeUser } from "@server/entities/tests/fakes";
import { wrapInRollbacks } from "@tests/utils/transactions";
import { insertAll, selectAll } from "@tests/utils/records";
import { pick } from "lodash-es";
import { userKeysPublic } from "@server/entities/user";
import { userRepository, UserRepository } from "../userRepository";

const db = await wrapInRollbacks(createTestDatabase())
const respository = userRepository(db)

describe("create", () => {
    it("should create a new user", async () => {
        const user = fakeUser()
        const createdUser = await respository.create(user) 

        expect(createdUser).toEqual({
            firstName: user.firstName,
            lastName: user.lastName,
            id: expect.any(Number)
        })
    })
})