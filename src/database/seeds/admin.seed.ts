import * as bcrypt from 'bcrypt';

import { User } from '../entities/user.entity';
import { Role } from '../../common/enums/role.enum';

export async function createMasterAdmin(
  userRepository: any,
) {
  const existingAdmin = await userRepository.findOne({
    where: {
      email: 'nikhil@brightpeak.in',
    },
  });

  if (existingAdmin) {
    return;
  }

  const passwordHash = await bcrypt.hash(
    'ChangeMe123!',
    10,
  );

  await userRepository.save({
    name: 'Master Admin',
    email: 'nikhil@brightpeak.in',
    passwordHash,
    role: Role.MASTER_ADMIN,
  });

  console.log(
    'Master admin created successfully',
  );
}