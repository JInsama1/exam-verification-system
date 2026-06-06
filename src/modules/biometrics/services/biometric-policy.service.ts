import {
  Injectable,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  BiometricPolicy,
  DEFAULT_BIOMETRIC_POLICY,
  PolicyShape,
} from '../../../database/entities/biometric-policy.entity';


@Injectable()
export class BiometricPolicyService {

  constructor(
    @InjectRepository(BiometricPolicy)
    private readonly policyRepo: Repository<BiometricPolicy>,
  ) {}

  async getForProject(projectId: string): Promise<PolicyShape> {
    const policy = await this.policyRepo.findOne({
      where: { project: { id: projectId } },
    });
    return policy ?? DEFAULT_BIOMETRIC_POLICY;
  }

}
