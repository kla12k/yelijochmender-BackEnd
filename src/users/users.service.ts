import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { RoleUpgradeRequest } from './entities/role-upgrade-request.entity';
import { Repository } from 'typeorm';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RoleChangeDto } from './dto/role-change.dto';
import * as bcrypt from 'bcryptjs';
import { RequestStatus } from '../users/entities/role-upgrade-request.entity';
@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(RoleUpgradeRequest) private upgradeRepo: Repository<RoleUpgradeRequest>,
    ) { }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        await this.userRepository.update(userId, dto);
        return this.userRepository.findOne({ where: { id: userId } });
    }

    async changePassword(userId: string, dto: ChangePasswordDto) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['password'],
        });

        if (!user) throw new UnauthorizedException('User not found');

        const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
        if (!isMatch) {
            throw new BadRequestException('Old password is incorrect');
        }

        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
        await this.userRepository.update(userId, { password: hashedPassword });

        return { message: 'Password updated' };
    }

    async requestRoleChange(userId: string, dto: RoleChangeDto) {
        const exists = await this.upgradeRepo.findOne({
            where: { user: { id: userId }, status: RequestStatus.PENDING },
        });

        if (exists) throw new BadRequestException('Pending request already exists');

        const req = this.upgradeRepo.create({
            user: { id: userId },
            requestedRole: dto.role,
            status: RequestStatus.PENDING ,
        });
        await this.upgradeRepo.save(req);
        return { message: 'Upgrade request submitted successfully' };
    }

    async uploadAvatar(userId: string, file: Express.Multer.File) {
        const avatarUri = `/uploads/${file.filename}`;
        await this.userRepository.update(userId, { avatarUri });
        return { avatarUri };
    }

}
